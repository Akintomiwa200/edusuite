import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as mediasoup from 'mediasoup'
import type {
  Worker,
  Router,
  WebRtcTransport,
  Producer,
  Consumer,
  RtpCapabilities,
} from 'mediasoup/node/lib/types'
import { LiveClass } from './schemas/live-class.schema'

interface RoomState {
  router: Router
  peers: Map<
    string,
    {
      userId: string
      role: string
      transports: Map<string, WebRtcTransport>
      producers: Map<string, Producer>
      consumers: Map<string, Consumer>
    }
  >
}

@WebSocketGateway({
  namespace: 'live-class',
  cors: { origin: '*', credentials: true },
  transports: ['websocket'],
})
export class LiveClassGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server
  private readonly logger = new Logger(LiveClassGateway.name)

  private workers: Worker[] = []
  private workerIndex = 0
  private rooms = new Map<string, RoomState>()

  constructor(
    @InjectModel(LiveClass.name) private liveClassModel: Model<LiveClass>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async afterInit() {
    await this.createMediasoupWorkers()
    this.logger.log(`LiveClass WebSocket Gateway initialized with ${this.workers.length} workers`)
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token)
      client.data.userId = payload.sub
      client.data.role = payload.role
      client.data.schoolId = payload.schoolId

      this.logger.log(`Client connected: ${client.id} | User: ${payload.sub}`)
    } catch {
      this.logger.warn(`Unauthorized connection attempt: ${client.id}`)
      client.disconnect()
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)

    // Clean up from all rooms
    for (const [roomId, room] of this.rooms) {
      const peer = room.peers.get(client.id)
      if (!peer) continue

      // Close all producers and notify room
      for (const producer of peer.producers.values()) {
        client.to(roomId).emit('producer-closed', { producerId: producer.id })
        producer.close()
      }

      // Close all consumers
      for (const consumer of peer.consumers.values()) {
        consumer.close()
      }

      // Close all transports
      for (const transport of peer.transports.values()) {
        transport.close()
      }

      room.peers.delete(client.id)

      client.to(roomId).emit('peer-left', {
        socketId: client.id,
        userId: peer.userId,
      })

      // Clean up empty rooms
      if (room.peers.size === 0) {
        room.router.close()
        this.rooms.delete(roomId)
        this.logger.log(`Room ${roomId} closed (empty)`)

        // Update DB status
        await this.liveClassModel
          .findOneAndUpdate({ roomName: roomId }, { status: 'ENDED', actualEnd: new Date() })
          .exec()
      }
    }
  }

  // ── Join Room ──────────────────────────────────────────────────────

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; classId: string },
  ) {
    const { roomName } = data

    // Validate live class exists
    const liveClass = await this.liveClassModel
      .findOne({ roomName, status: { $in: ['SCHEDULED', 'LIVE'] } })
      .exec()

    if (!liveClass) {
      client.emit('error', { message: 'Live class not found or has ended' })
      return
    }

    // Create room if it doesn't exist
    if (!this.rooms.has(roomName)) {
      const router = await this.createRouter()
      this.rooms.set(roomName, { router, peers: new Map() })

      // Update class status to LIVE
      await this.liveClassModel
        .findByIdAndUpdate(liveClass._id, { status: 'LIVE', actualStart: new Date() })
        .exec()
    }

    const room = this.rooms.get(roomName)!

    // Register peer
    room.peers.set(client.id, {
      userId: client.data.userId,
      role: client.data.role,
      transports: new Map(),
      producers: new Map(),
      consumers: new Map(),
    })

    client.join(roomName)

    // Get existing producers from other peers
    const existingProducers: { producerId: string; userId: string; kind: string }[] = []
    for (const [socketId, peer] of room.peers) {
      if (socketId === client.id) continue
      for (const producer of peer.producers.values()) {
        existingProducers.push({ producerId: producer.id, userId: peer.userId, kind: producer.kind })
      }
    }

    client.emit('room-joined', {
      rtpCapabilities: room.router.rtpCapabilities,
      existingProducers,
      peers: Array.from(room.peers.entries())
        .filter(([id]) => id !== client.id)
        .map(([id, p]) => ({ socketId: id, userId: p.userId, role: p.role })),
    })

    client.to(roomName).emit('peer-joined', {
      socketId: client.id,
      userId: client.data.userId,
      role: client.data.role,
    })
  }

  // ── Transport ──────────────────────────────────────────────────────

  @SubscribeMessage('create-transport')
  async handleCreateTransport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; direction: 'send' | 'recv' },
  ) {
    const room = this.rooms.get(data.roomName)
    if (!room) return client.emit('error', { message: 'Room not found' })

    const transport = await room.router.createWebRtcTransport({
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: this.config.get<string>('ai.webrtcPublicIp', '127.0.0.1'),
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 1_000_000,
    })

    const peer = room.peers.get(client.id)
    peer?.transports.set(transport.id, transport)

    // Set up DTLS state monitoring
    transport.on('dtlsstatechange', (state) => {
      if (state === 'closed') transport.close()
    })

    client.emit('transport-created', {
      transportId: transport.id,
      direction: data.direction,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    })
  }

  @SubscribeMessage('connect-transport')
  async handleConnectTransport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; transportId: string; dtlsParameters: object },
  ) {
    const room = this.rooms.get(data.roomName)
    const peer = room?.peers.get(client.id)
    const transport = peer?.transports.get(data.transportId)

    if (!transport) return client.emit('error', { message: 'Transport not found' })

    await transport.connect({ dtlsParameters: data.dtlsParameters })
    client.emit('transport-connected', { transportId: data.transportId })
  }

  // ── Produce ────────────────────────────────────────────────────────

  @SubscribeMessage('produce')
  async handleProduce(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      roomName: string
      transportId: string
      kind: 'audio' | 'video'
      rtpParameters: object
      appData?: Record<string, unknown>
    },
  ) {
    const room = this.rooms.get(data.roomName)
    const peer = room?.peers.get(client.id)
    const transport = peer?.transports.get(data.transportId)

    if (!transport) return client.emit('error', { message: 'Transport not found' })

    const producer = await transport.produce({
      kind: data.kind,
      rtpParameters: data.rtpParameters as mediasoup.types.RtpParameters,
      appData: data.appData,
    })

    peer!.producers.set(producer.id, producer)

    producer.on('transportclose', () => {
      producer.close()
      peer!.producers.delete(producer.id)
    })

    // Notify others in room
    client.to(data.roomName).emit('new-producer', {
      producerId: producer.id,
      userId: client.data.userId,
      kind: data.kind,
      socketId: client.id,
    })

    client.emit('produced', { producerId: producer.id })
  }

  // ── Consume ────────────────────────────────────────────────────────

  @SubscribeMessage('consume')
  async handleConsume(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      roomName: string
      transportId: string
      producerId: string
      rtpCapabilities: RtpCapabilities
    },
  ) {
    const room = this.rooms.get(data.roomName)
    const peer = room?.peers.get(client.id)
    const transport = peer?.transports.get(data.transportId)

    if (!transport) return client.emit('error', { message: 'Transport not found' })

    if (!room!.router.canConsume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities })) {
      return client.emit('error', { message: 'Cannot consume producer' })
    }

    const consumer = await transport.consume({
      producerId: data.producerId,
      rtpCapabilities: data.rtpCapabilities,
      paused: false,
    })

    peer!.consumers.set(consumer.id, consumer)

    consumer.on('transportclose', () => {
      consumer.close()
      peer!.consumers.delete(consumer.id)
    })

    consumer.on('producerclose', () => {
      client.emit('consumer-closed', { consumerId: consumer.id })
      consumer.close()
      peer!.consumers.delete(consumer.id)
    })

    client.emit('consumed', {
      consumerId: consumer.id,
      producerId: data.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    })
  }

  // ── Control Events ─────────────────────────────────────────────────

  @SubscribeMessage('raise-hand')
  handleRaiseHand(@ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string; raised: boolean }) {
    client.to(data.roomName).emit('hand-raised', {
      userId: client.data.userId,
      socketId: client.id,
      raised: data.raised,
    })
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; message: string },
  ) {
    if (data.message.length > 500) return

    this.server.to(data.roomName).emit('new-chat-message', {
      userId: client.data.userId,
      message: data.message,
      timestamp: new Date().toISOString(),
    })
  }

  @SubscribeMessage('mute-participant')
  handleMuteParticipant(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; targetSocketId: string },
  ) {
    // Only teachers can mute
    if (!['TEACHER', 'SCHOOL_ADMIN', 'BRANCH_ADMIN', 'PRINCIPAL'].includes(client.data.role)) return

    this.server.to(data.targetSocketId).emit('force-muted', {
      by: client.data.userId,
    })
  }

  @SubscribeMessage('kick-participant')
  handleKickParticipant(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; targetSocketId: string; reason?: string },
  ) {
    if (!['TEACHER', 'SCHOOL_ADMIN', 'BRANCH_ADMIN', 'PRINCIPAL'].includes(client.data.role)) return

    this.server.to(data.targetSocketId).emit('kicked', {
      reason: data.reason || 'Removed by host',
      by: client.data.userId,
    })

    const targetSocket = this.server.sockets.sockets.get(data.targetSocketId)
    targetSocket?.disconnect()
  }

  @SubscribeMessage('poll')
  handlePoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; question: string; options: string[] },
  ) {
    if (!['TEACHER', 'SCHOOL_ADMIN'].includes(client.data.role)) return

    this.server.to(data.roomName).emit('new-poll', {
      id: Date.now().toString(),
      question: data.question,
      options: data.options,
      createdBy: client.data.userId,
    })
  }

  // ── Mediasoup Setup ────────────────────────────────────────────────

  private async createMediasoupWorkers() {
    const numWorkers = Math.min(Object.keys(require('os').cpus()).length, 4)

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: 'warn',
        rtcMinPort: this.config.get<number>('ai.webrtcMinPort', 40000),
        rtcMaxPort: this.config.get<number>('ai.webrtcMaxPort', 49999),
      })

      worker.on('died', async () => {
        this.logger.error(`Mediasoup worker died, restarting...`)
        this.workers = this.workers.filter((w) => w !== worker)
        const newWorker = await mediasoup.createWorker({ logLevel: 'warn' })
        this.workers.push(newWorker)
      })

      this.workers.push(worker)
    }
  }

  private async createRouter(): Promise<Router> {
    const worker = this.workers[this.workerIndex++ % this.workers.length]

    return worker.createRouter({
      mediaCodecs: [
        { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: { 'x-google-start-bitrate': 1000 },
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
          },
        },
        { kind: 'video', mimeType: 'video/VP9', clockRate: 90000 },
      ],
    })
  }
}
