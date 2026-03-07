import { io, Socket } from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'
import type { Device, Transport, Producer, Consumer, RtpCapabilities } from 'mediasoup-client/lib/types'

export type StreamType = 'camera' | 'screen' | 'audio'

export interface Peer {
  socketId: string
  userId: string
  role: string
  streams: Map<string, MediaStream>
}

export interface WebRTCEvents {
  onPeerJoined: (peer: Peer) => void
  onPeerLeft: (socketId: string) => void
  onStreamAdded: (socketId: string, stream: MediaStream, kind: 'audio' | 'video') => void
  onStreamRemoved: (socketId: string, producerId: string) => void
  onHandRaised: (userId: string, raised: boolean) => void
  onChatMessage: (userId: string, message: string, timestamp: string) => void
  onForceMuted: () => void
  onKicked: (reason: string) => void
  onPollReceived: (poll: { id: string; question: string; options: string[] }) => void
  onError: (message: string) => void
}

export class WebRTCClient {
  private socket: Socket
  private device: Device | null = null
  private sendTransport: Transport | null = null
  private recvTransport: Transport | null = null
  private producers = new Map<string, Producer>()
  private consumers = new Map<string, Consumer>()
  private peers = new Map<string, Peer>()

  private localStream: MediaStream | null = null
  private localScreenStream: MediaStream | null = null

  private roomName: string
  private token: string
  private events: Partial<WebRTCEvents>

  private isAudioEnabled = true
  private isVideoEnabled = true

  constructor(opts: {
    roomName: string
    token: string
    serverUrl?: string
    events?: Partial<WebRTCEvents>
  }) {
    this.roomName = opts.roomName
    this.token = opts.token
    this.events = opts.events || {}

    const serverUrl = opts.serverUrl || process.env.NEXT_PUBLIC_WEBRTC_URL || 'http://localhost:4000'

    this.socket = io(`${serverUrl}/live-class`, {
      auth: { token: this.token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to WebRTC server')
    })

    this.socket.on('room-joined', async ({ rtpCapabilities, existingProducers, peers }: any) => {
      await this.loadDevice(rtpCapabilities)

      // Register existing peers
      for (const peer of peers) {
        this.peers.set(peer.socketId, { ...peer, streams: new Map() })
        this.events.onPeerJoined?.({ ...peer, streams: new Map() })
      }

      // Consume existing producers
      for (const { producerId, userId, kind } of existingProducers) {
        await this.consumeProducer(producerId, userId)
      }
    })

    this.socket.on('peer-joined', (data: { socketId: string; userId: string; role: string }) => {
      const peer: Peer = { ...data, streams: new Map() }
      this.peers.set(data.socketId, peer)
      this.events.onPeerJoined?.(peer)
    })

    this.socket.on('peer-left', ({ socketId }: { socketId: string }) => {
      this.peers.delete(socketId)
      this.events.onPeerLeft?.(socketId)
    })

    this.socket.on('new-producer', async ({ producerId, userId, kind, socketId }: any) => {
      await this.consumeProducer(producerId, userId, socketId)
    })

    this.socket.on('transport-created', (data: any) => {
      this.handleTransportCreated(data)
    })

    this.socket.on('transport-connected', () => {})

    this.socket.on('produced', ({ producerId }: { producerId: string }) => {
      console.log('Produced:', producerId)
    })

    this.socket.on('consumed', (data: any) => {
      this.handleConsumed(data)
    })

    this.socket.on('consumer-closed', ({ consumerId }: { consumerId: string }) => {
      const consumer = this.consumers.get(consumerId)
      consumer?.close()
      this.consumers.delete(consumerId)
    })

    this.socket.on('producer-closed', ({ producerId }: { producerId: string }) => {
      this.events.onStreamRemoved?.('', producerId)
    })

    this.socket.on('hand-raised', (data: any) => {
      this.events.onHandRaised?.(data.userId, data.raised)
    })

    this.socket.on('new-chat-message', (data: any) => {
      this.events.onChatMessage?.(data.userId, data.message, data.timestamp)
    })

    this.socket.on('force-muted', () => {
      this.muteAudio()
      this.events.onForceMuted?.()
    })

    this.socket.on('kicked', ({ reason }: { reason: string }) => {
      this.events.onKicked?.(reason)
      this.disconnect()
    })

    this.socket.on('new-poll', (poll: any) => {
      this.events.onPollReceived?.(poll)
    })

    this.socket.on('error', ({ message }: { message: string }) => {
      this.events.onError?.(message)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebRTC server')
    })
  }

  // ── Join ───────────────────────────────────────────────────────────

  async joinRoom(classId: string) {
    this.socket.emit('join-room', { roomName: this.roomName, classId })
  }

  // ── Media ──────────────────────────────────────────────────────────

  async startCamera(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia(
      constraints || { video: { width: 1280, height: 720, frameRate: 30 }, audio: true },
    )

    this.localStream = stream
    await this.publishStream(stream)
    return stream
  }

  async startScreenShare(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080, frameRate: 15 },
      audio: true,
    })

    this.localScreenStream = stream

    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack && this.sendTransport) {
      const producer = await this.sendTransport.produce({
        track: videoTrack,
        appData: { type: 'screen' },
        encodings: [{ maxBitrate: 1_500_000 }],
        codecOptions: { videoGoogleStartBitrate: 1000 },
      })
      this.producers.set(producer.id, producer)

      videoTrack.onended = () => this.stopScreenShare()
    }

    return stream
  }

  async stopScreenShare() {
    this.localScreenStream?.getTracks().forEach((t) => t.stop())
    this.localScreenStream = null

    // Close screen share producer
    for (const [id, producer] of this.producers) {
      if (producer.appData?.type === 'screen') {
        producer.close()
        this.producers.delete(id)
      }
    }
  }

  async muteAudio() {
    for (const producer of this.producers.values()) {
      if (producer.kind === 'audio') {
        producer.pause()
        this.isAudioEnabled = false
      }
    }
  }

  async unmuteAudio() {
    for (const producer of this.producers.values()) {
      if (producer.kind === 'audio') {
        producer.resume()
        this.isAudioEnabled = true
      }
    }
  }

  async disableVideo() {
    for (const producer of this.producers.values()) {
      if (producer.kind === 'video' && !producer.appData?.type) {
        producer.pause()
        this.isVideoEnabled = false
      }
    }
  }

  async enableVideo() {
    for (const producer of this.producers.values()) {
      if (producer.kind === 'video' && !producer.appData?.type) {
        producer.resume()
        this.isVideoEnabled = true
      }
    }
  }

  // ── Signaling helpers ──────────────────────────────────────────────

  raiseHand(raised: boolean) {
    this.socket.emit('raise-hand', { roomName: this.roomName, raised })
  }

  sendChatMessage(message: string) {
    this.socket.emit('chat-message', { roomName: this.roomName, message })
  }

  muteParticipant(targetSocketId: string) {
    this.socket.emit('mute-participant', { roomName: this.roomName, targetSocketId })
  }

  kickParticipant(targetSocketId: string, reason?: string) {
    this.socket.emit('kick-participant', { roomName: this.roomName, targetSocketId, reason })
  }

  createPoll(question: string, options: string[]) {
    this.socket.emit('poll', { roomName: this.roomName, question, options })
  }

  // ── Internal ───────────────────────────────────────────────────────

  private async loadDevice(rtpCapabilities: RtpCapabilities) {
    this.device = new mediasoupClient.Device()
    await this.device.load({ routerRtpCapabilities: rtpCapabilities })
    this.createSendTransport()
    this.createRecvTransport()
  }

  private createSendTransport() {
    this.socket.emit('create-transport', { roomName: this.roomName, direction: 'send' })
  }

  private createRecvTransport() {
    this.socket.emit('create-transport', { roomName: this.roomName, direction: 'recv' })
  }

  private handleTransportCreated(data: any) {
    if (!this.device) return

    const { transportId, direction, iceParameters, iceCandidates, dtlsParameters } = data

    const transport =
      direction === 'send'
        ? this.device.createSendTransport({ id: transportId, iceParameters, iceCandidates, dtlsParameters })
        : this.device.createRecvTransport({ id: transportId, iceParameters, iceCandidates, dtlsParameters })

    transport.on('connect', ({ dtlsParameters }, callback, errback) => {
      this.socket.emit('connect-transport', { roomName: this.roomName, transportId, dtlsParameters })
      this.socket.once('transport-connected', callback)
    })

    if (direction === 'send') {
      transport.on('produce', ({ kind, rtpParameters, appData }, callback, errback) => {
        this.socket.emit('produce', { roomName: this.roomName, transportId, kind, rtpParameters, appData })
        this.socket.once('produced', ({ producerId }) => callback({ id: producerId }))
      })
      this.sendTransport = transport as Transport
    } else {
      this.recvTransport = transport as Transport
    }
  }

  private async publishStream(stream: MediaStream) {
    if (!this.sendTransport) return

    const audioTrack = stream.getAudioTracks()[0]
    const videoTrack = stream.getVideoTracks()[0]

    if (audioTrack) {
      const producer = await this.sendTransport.produce({ track: audioTrack })
      this.producers.set(producer.id, producer)
    }

    if (videoTrack) {
      const producer = await this.sendTransport.produce({
        track: videoTrack,
        encodings: [
          { rid: 'r0', maxBitrate: 100_000, scalabilityMode: 'S1T3' },
          { rid: 'r1', maxBitrate: 300_000, scalabilityMode: 'S1T3' },
          { rid: 'r2', maxBitrate: 900_000, scalabilityMode: 'S1T3' },
        ],
        codecOptions: { videoGoogleStartBitrate: 1000 },
      })
      this.producers.set(producer.id, producer)
    }
  }

  private async consumeProducer(producerId: string, userId: string, socketId?: string) {
    if (!this.recvTransport || !this.device) return

    this.socket.emit('consume', {
      roomName: this.roomName,
      transportId: this.recvTransport.id,
      producerId,
      rtpCapabilities: this.device.rtpCapabilities,
    })
  }

  private async handleConsumed(data: { consumerId: string; producerId: string; kind: 'audio' | 'video'; rtpParameters: object }) {
    if (!this.recvTransport) return

    const consumer = await this.recvTransport.consume({
      id: data.consumerId,
      producerId: data.producerId,
      kind: data.kind,
      rtpParameters: data.rtpParameters as mediasoupClient.types.RtpParameters,
    })

    this.consumers.set(consumer.id, consumer)

    const stream = new MediaStream([consumer.track])

    // Find which peer this belongs to (by matching producers)
    for (const [socketId, peer] of this.peers) {
      this.events.onStreamAdded?.(socketId, stream, data.kind)
    }
  }

  disconnect() {
    for (const producer of this.producers.values()) producer.close()
    for (const consumer of this.consumers.values()) consumer.close()
    this.sendTransport?.close()
    this.recvTransport?.close()
    this.localStream?.getTracks().forEach((t) => t.stop())
    this.localScreenStream?.getTracks().forEach((t) => t.stop())
    this.socket.disconnect()
  }

  get audioEnabled() {
    return this.isAudioEnabled
  }
  get videoEnabled() {
    return this.isVideoEnabled
  }
  get connectedPeers() {
    return this.peers
  }
}
