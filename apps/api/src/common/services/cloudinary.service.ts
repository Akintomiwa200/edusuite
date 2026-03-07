import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { Readable } from 'stream'
import { CloudinaryUploadResult, CloudinaryTransformOptions } from '@edusuite/shared-types'

export type ResourceType = 'image' | 'video' | 'raw' | 'auto'

export interface UploadOptions {
  folder: string
  resourceType?: ResourceType
  publicId?: string
  tags?: string[]
  transformation?: CloudinaryTransformOptions
  eager?: CloudinaryTransformOptions[]
  overwrite?: boolean
  invalidate?: boolean
  format?: string
  quality?: string | number
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name)

  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('cloudinary.cloudName'),
      api_key: this.config.get<string>('cloudinary.apiKey'),
      api_secret: this.config.get<string>('cloudinary.apiSecret'),
      secure: true,
    })
  }

  /**
   * Upload a file buffer or stream to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File | Buffer,
    options: UploadOptions,
  ): Promise<CloudinaryUploadResult> {
    const buffer = Buffer.isBuffer(file) ? file : (file as Express.Multer.File).buffer

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType || 'auto',
          public_id: options.publicId,
          tags: options.tags,
          overwrite: options.overwrite ?? true,
          invalidate: options.invalidate ?? true,
          quality: options.quality || 'auto',
          format: options.format,
          transformation: options.transformation
            ? this.buildTransformation(options.transformation)
            : undefined,
          eager: options.eager?.map((t) => this.buildTransformation(t)),
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed', error)
            reject(new BadRequestException('File upload failed: ' + error?.message))
            return
          }

          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            url: result.url,
            format: result.format,
            resourceType: result.resource_type as ResourceType,
            size: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
            thumbnailUrl:
              result.resource_type === 'video'
                ? cloudinary.url(result.public_id, {
                    resource_type: 'video',
                    format: 'jpg',
                    transformation: [{ width: 400, height: 300, crop: 'fill' }],
                  })
                : undefined,
          })
        },
      )

      const readable = new Readable()
      readable.push(buffer)
      readable.push(null)
      readable.pipe(uploadStream)
    })
  }

  /**
   * Upload from a URL (e.g. for remote files)
   */
  async uploadFromUrl(url: string, options: UploadOptions): Promise<CloudinaryUploadResult> {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: options.folder,
        resource_type: options.resourceType || 'auto',
        public_id: options.publicId,
        tags: options.tags,
        overwrite: options.overwrite ?? true,
      })

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        url: result.url,
        format: result.format,
        resourceType: result.resource_type as ResourceType,
        size: result.bytes,
        width: result.width,
        height: result.height,
      }
    } catch (error) {
      this.logger.error('Cloudinary upload from URL failed', error)
      throw new BadRequestException('File upload failed')
    }
  }

  /**
   * Upload profile picture with automatic face cropping
   */
  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
    folder: string,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(file, {
      folder,
      publicId: `profile_${userId}`,
      resourceType: 'image',
      transformation: {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
        format: 'auto',
      },
      overwrite: true,
      invalidate: true,
    })
  }

  /**
   * Upload exam result scan with high quality preservation
   */
  async uploadResultScan(
    file: Express.Multer.File,
    resultId: string,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(file, {
      folder: this.config.get<string>('cloudinary.folders.results')!,
      publicId: `result_${resultId}`,
      resourceType: 'image',
      quality: 90,
      tags: ['exam-result', 'ai-scan'],
    })
  }

  /**
   * Upload proctoring screenshot
   */
  async uploadProctoringScreenshot(
    buffer: Buffer,
    sessionId: string,
    timestamp: number,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(buffer, {
      folder: `${this.config.get<string>('cloudinary.folders.proctoring')}/${sessionId}`,
      publicId: `screenshot_${timestamp}`,
      resourceType: 'image',
      quality: 70,
      tags: ['proctoring', sessionId],
    })
  }

  /**
   * Upload class recording (video)
   */
  async uploadRecording(
    buffer: Buffer,
    classId: string,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(buffer, {
      folder: this.config.get<string>('cloudinary.folders.recordings')!,
      publicId: `class_${classId}`,
      resourceType: 'video',
      tags: ['recording', 'live-class'],
      eager: [
        { width: 1280, height: 720, crop: 'scale', quality: 'auto' },
      ],
    })
  }

  /**
   * Upload document (PDF, Word, etc.)
   */
  async uploadDocument(
    file: Express.Multer.File,
    folder: string,
    publicId?: string,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(file, {
      folder,
      publicId,
      resourceType: 'raw',
      tags: ['document'],
    })
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: ResourceType = 'image'): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      })
      return result.result === 'ok'
    } catch (error) {
      this.logger.error(`Failed to delete file ${publicId}`, error)
      return false
    }
  }

  /**
   * Delete multiple files at once
   */
  async deleteFiles(
    publicIds: string[],
    resourceType: ResourceType = 'image',
  ): Promise<{ deleted: string[]; failed: string[] }> {
    const results = await Promise.allSettled(
      publicIds.map((id) => this.deleteFile(id, resourceType)),
    )

    const deleted: string[] = []
    const failed: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        deleted.push(publicIds[index])
      } else {
        failed.push(publicIds[index])
      }
    })

    return { deleted, failed }
  }

  /**
   * Generate a signed URL for secure access (time-limited)
   */
  generateSignedUrl(
    publicId: string,
    options: { expiresIn?: number; resourceType?: ResourceType; transformation?: CloudinaryTransformOptions },
  ): string {
    const expiresAt = Math.floor(Date.now() / 1000) + (options.expiresIn || 3600)

    return cloudinary.url(publicId, {
      resource_type: options.resourceType || 'image',
      sign_url: true,
      expires_at: expiresAt,
      transformation: options.transformation ? [this.buildTransformation(options.transformation)] : undefined,
    })
  }

  /**
   * Generate a transformation URL without re-uploading
   */
  getTransformedUrl(
    publicId: string,
    transformation: CloudinaryTransformOptions,
    resourceType: ResourceType = 'image',
  ): string {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      transformation: [this.buildTransformation(transformation)],
      secure: true,
    })
  }

  /**
   * Get file metadata from Cloudinary
   */
  async getFileInfo(publicId: string, resourceType: ResourceType = 'image') {
    try {
      return await cloudinary.api.resource(publicId, { resource_type: resourceType })
    } catch (error) {
      this.logger.error(`Failed to get file info for ${publicId}`, error)
      return null
    }
  }

  /**
   * Create a Cloudinary upload preset for frontend direct uploads
   */
  async createUploadPreset(name: string, folder: string) {
    return cloudinary.api.create_upload_preset({
      name,
      folder,
      unsigned: false,
      allowed_formats: 'jpg,png,gif,webp,pdf,mp4,mov',
      max_file_size: 10000000, // 10MB
    })
  }

  /**
   * Generate a signed upload token for client-side direct uploads
   */
  generateUploadSignature(folder: string, tags?: string[]): {
    signature: string
    timestamp: number
    apiKey: string
    cloudName: string
  } {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const params: Record<string, string | number | string[]> = { timestamp, folder }
    if (tags) params.tags = tags

    const signature = cloudinary.utils.api_sign_request(
      params,
      this.config.get<string>('cloudinary.apiSecret')!,
    )

    return {
      signature,
      timestamp,
      apiKey: this.config.get<string>('cloudinary.apiKey')!,
      cloudName: this.config.get<string>('cloudinary.cloudName')!,
    }
  }

  private buildTransformation(options: CloudinaryTransformOptions) {
    return {
      width: options.width,
      height: options.height,
      quality: options.quality,
      fetch_format: options.format,
      crop: options.crop,
      gravity: options.gravity,
    }
  }
}
