import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import OpenAI from 'openai'
import * as tf from '@tensorflow/tfjs-node'
import { createWorker } from 'tesseract.js'
import {
  AIGradingResult,
  PredictionResult,
  FaceVerificationResult,
  ContentModerationResult,
  ProctoringEventType,
} from '@edusuite/shared-types'
import { CloudinaryService } from '../../common/services/cloudinary.service'

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name)
  private openai: OpenAI
  private objectDetectionModel: tf.GraphModel | null = null
  private faceDetectionModel: tf.GraphModel | null = null

  constructor(
    private config: ConfigService,
    private cloudinaryService: CloudinaryService,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.get<string>('ai.openaiApiKey') })
  }

  async onModuleInit() {
    try {
      // Load TensorFlow models asynchronously (don't block startup)
      this.loadModels().catch((err) => this.logger.warn('TF models failed to load', err))
    } catch (err) {
      this.logger.warn('AI service init warning', err)
    }
  }

  private async loadModels() {
    this.logger.log('Loading TensorFlow models...')
    // COCO-SSD for object detection (proctoring)
    const cocoSsd = await import('@tensorflow-models/coco-ssd')
    // Cast to any since we're using the detection API
    this.objectDetectionModel = (await cocoSsd.load()) as unknown as tf.GraphModel
    this.logger.log('TensorFlow models loaded ✓')
  }

  // ══════════════════════════════════════════════
  //  1. AI RESULT GRADING (scan & grade exams)
  // ══════════════════════════════════════════════

  async scanAndGradeResult(
    imageBuffer: Buffer,
    options: {
      subject: string
      expectedAnswers?: string
      rubric?: { criterion: string; maxScore: number; description: string }[]
      studentId: string
      resultId: string
    },
  ): Promise<AIGradingResult & { scannedImageUrl: string }> {
    // 1. Upload scan to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadResultScan(
      { buffer: imageBuffer } as Express.Multer.File,
      options.resultId,
    )

    // 2. OCR with Tesseract
    const extractedText = await this.performOCR(imageBuffer)
    this.logger.log(`OCR extracted: ${extractedText.substring(0, 100)}...`)

    // 3. Grade with GPT-4o Vision
    const gradingResult = await this.gradeWithAI({
      extractedText,
      imageUrl: uploadResult.secureUrl,
      subject: options.subject,
      expectedAnswers: options.expectedAnswers,
      rubric: options.rubric,
    })

    return { ...gradingResult, scannedImageUrl: uploadResult.secureUrl }
  }

  private async gradeWithAI(params: {
    extractedText: string
    imageUrl: string
    subject: string
    expectedAnswers?: string
    rubric?: { criterion: string; maxScore: number; description: string }[]
  }): Promise<AIGradingResult> {
    const prompt = `
You are an expert ${params.subject} teacher grading a student's exam answer.

OCR-extracted student answer:
"""
${params.extractedText}
"""

${params.expectedAnswers ? `Expected answer/marking scheme:\n"""\n${params.expectedAnswers}\n"""` : ''}

${
  params.rubric
    ? `Rubric:\n${params.rubric.map((r) => `- ${r.criterion} (${r.maxScore} marks): ${r.description}`).join('\n')}`
    : 'Grade out of 100 marks.'
}

Please analyze the student's answer (also referring to the image provided) and respond ONLY with valid JSON:
{
  "score": <number>,
  "maxScore": <number>,
  "percentage": <number>,
  "grade": "<letter grade>",
  "feedback": "<detailed constructive feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<area1>", "<area2>"],
  "confidence": <0-1 confidence in your grading>
}
`

    const response = await this.openai.chat.completions.create({
      model: this.config.get<string>('ai.openaiModel', 'gpt-4o')!,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: params.imageUrl, detail: 'high' } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result as AIGradingResult
  }

  // ══════════════════════════════════════════════
  //  2. LIVE EXAM PROCTORING
  // ══════════════════════════════════════════════

  async analyzeExamFrame(
    imageBuffer: Buffer,
    sessionId: string,
  ): Promise<{
    events: ProctoringEventType[]
    suspiciousActivity: boolean
    confidence: number
    screenshotUrl?: string
    details: string[]
  }> {
    const events: ProctoringEventType[] = []
    const details: string[] = []
    let screenshotUrl: string | undefined

    if (!this.objectDetectionModel) {
      return { events, suspiciousActivity: false, confidence: 0, details: ['AI model not loaded'] }
    }

    // Decode image for TF
    const imageTensor = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D

    // Run object detection
    const cocoSsd = this.objectDetectionModel as unknown as {
      detect: (t: tf.Tensor3D) => Promise<{ class: string; score: number }[]>
    }
    const predictions = await cocoSsd.detect(imageTensor)
    imageTensor.dispose()

    let personCount = 0
    let phoneDetected = false

    for (const pred of predictions) {
      if (pred.score < 0.6) continue

      switch (pred.class) {
        case 'person':
          personCount++
          break
        case 'cell phone':
        case 'remote':
          phoneDetected = true
          events.push(ProctoringEventType.PHONE_DETECTED)
          details.push(`Phone/device detected (${(pred.score * 100).toFixed(0)}% confidence)`)
          break
        case 'book':
        case 'laptop':
        case 'tv':
          details.push(`Unauthorized material: ${pred.class}`)
          break
      }
    }

    if (personCount > 1) {
      events.push(ProctoringEventType.MULTIPLE_FACES)
      details.push(`${personCount} people detected`)
    }

    if (personCount === 0) {
      events.push(ProctoringEventType.NO_FACE)
      details.push('No person detected in frame')
    }

    const suspiciousActivity = events.length > 0 || phoneDetected

    // Upload screenshot if suspicious
    if (suspiciousActivity) {
      try {
        const result = await this.cloudinaryService.uploadProctoringScreenshot(
          imageBuffer,
          sessionId,
          Date.now(),
        )
        screenshotUrl = result.secureUrl
      } catch {
        // Non-critical
      }
    }

    return {
      events,
      suspiciousActivity,
      confidence: predictions.length > 0 ? 0.85 : 0.5,
      screenshotUrl,
      details,
    }
  }

  // ══════════════════════════════════════════════
  //  3. STUDENT PERFORMANCE PREDICTION
  // ══════════════════════════════════════════════

  async predictStudentPerformance(data: {
    studentId: string
    recentScores: number[]
    attendanceRate: number
    assignmentCompletionRate: number
    behaviorScore: number
    historicalData?: { score: number; attendance: number; assignment: number; finalScore: number }[]
  }): Promise<PredictionResult> {
    const { studentId, recentScores, attendanceRate, assignmentCompletionRate, behaviorScore } = data

    const avgRecentScore = recentScores.length
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : 0

    // Simple weighted prediction model
    const weights = {
      recentScore: 0.45,
      attendance: 0.25,
      assignment: 0.20,
      behavior: 0.10,
    }

    const predictedScore = Math.min(
      100,
      Math.max(
        0,
        avgRecentScore * weights.recentScore * 100 +
          attendanceRate * weights.attendance * 100 +
          assignmentCompletionRate * weights.assignment * 100 +
          behaviorScore * weights.behavior,
      ),
    )

    // TF model if historical data is available
    let tfPrediction = predictedScore
    if (data.historicalData && data.historicalData.length >= 5) {
      tfPrediction = await this.runTFPrediction(data.historicalData, [
        avgRecentScore / 100,
        attendanceRate,
        assignmentCompletionRate,
        behaviorScore / 100,
      ])
      tfPrediction = Math.min(100, Math.max(0, tfPrediction * 100))
    }

    const finalPrediction = Math.round((predictedScore + tfPrediction) / 2)

    const riskLevel =
      finalPrediction < 40
        ? 'CRITICAL'
        : finalPrediction < 55
          ? 'HIGH'
          : finalPrediction < 70
            ? 'MEDIUM'
            : 'LOW'

    const recommendations: string[] = []
    if (attendanceRate < 0.8) recommendations.push('Improve attendance — attending < 80% of classes')
    if (assignmentCompletionRate < 0.7) recommendations.push('Submit all assignments on time')
    if (avgRecentScore < 50) recommendations.push('Seek tutoring support immediately')
    if (behaviorScore < 60) recommendations.push('Address behavioral concerns with counselor')
    if (riskLevel === 'CRITICAL') recommendations.push('Urgent parent-teacher meeting required')

    const grade = this.scoreToGrade(finalPrediction)

    return {
      studentId,
      predictedScore: finalPrediction,
      predictedGrade: grade,
      confidence: data.historicalData ? 0.85 : 0.70,
      riskLevel,
      recommendations,
      factors: [
        { factor: 'Recent Scores', impact: avgRecentScore > 60 ? 'POSITIVE' : 'NEGATIVE', weight: 0.45, description: `Average recent score: ${avgRecentScore.toFixed(1)}%` },
        { factor: 'Attendance', impact: attendanceRate > 0.8 ? 'POSITIVE' : 'NEGATIVE', weight: 0.25, description: `Attendance rate: ${(attendanceRate * 100).toFixed(1)}%` },
        { factor: 'Assignments', impact: assignmentCompletionRate > 0.7 ? 'POSITIVE' : 'NEGATIVE', weight: 0.20, description: `Completion: ${(assignmentCompletionRate * 100).toFixed(1)}%` },
        { factor: 'Behavior', impact: behaviorScore > 70 ? 'POSITIVE' : 'NEUTRAL', weight: 0.10, description: `Behavior score: ${behaviorScore}` },
      ],
    }
  }

  private async runTFPrediction(
    trainingData: { score: number; attendance: number; assignment: number; finalScore: number }[],
    inputFeatures: number[],
  ): Promise<number> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 16, activation: 'relu', inputShape: [4] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ],
    })

    model.compile({ optimizer: tf.train.adam(0.01), loss: 'meanSquaredError' })

    const xs = tf.tensor2d(
      trainingData.map((d) => [d.score / 100, d.attendance, d.assignment, 0.8]),
    )
    const ys = tf.tensor2d(trainingData.map((d) => [d.finalScore / 100]))

    await model.fit(xs, ys, { epochs: 50, verbose: 0 })

    const prediction = model.predict(tf.tensor2d([inputFeatures])) as tf.Tensor
    const value = (await prediction.data())[0]

    xs.dispose()
    ys.dispose()
    prediction.dispose()
    model.dispose()

    return value
  }

  // ══════════════════════════════════════════════
  //  4. CONTENT MODERATION (Social Posts)
  // ══════════════════════════════════════════════

  async moderateContent(text: string, imageUrls?: string[]): Promise<ContentModerationResult> {
    const response = await this.openai.moderations.create({ input: text })
    const result = response.results[0]

    const categories = {
      harassment: result.categories.harassment,
      violence: result.categories.violence,
      hate: result.categories.hate,
      selfHarm: result.categories['self-harm'],
      sexual: result.categories.sexual,
    }

    const flagged = result.flagged

    return {
      allowed: !flagged,
      confidence: 0.95,
      categories,
      action: flagged ? 'BLOCK' : 'ALLOW',
      reason: flagged
        ? Object.entries(categories)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ')
        : undefined,
    }
  }

  // ══════════════════════════════════════════════
  //  5. INTELLIGENT TIMETABLE GENERATION
  // ══════════════════════════════════════════════

  async generateTimetable(input: {
    classId: string
    subjects: { subjectId: string; name: string; teacherId: string; hoursPerWeek: number }[]
    constraints: {
      workingDays: number[]
      periods: number
      periodDuration: number
      teacherLeaves?: string[]
      doublePeriodsAllowed: boolean
    }
  }) {
    const { subjects, constraints } = input
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].filter((_, i) =>
      constraints.workingDays.includes(i + 1),
    )

    const prompt = `
You are an expert school timetable scheduler.

Class needs ${constraints.periods} periods per day, ${days.length} days a week.
Available subjects (teacher, weekly hours):
${subjects.map((s) => `- ${s.name} (teacherId: ${s.teacherId}) → ${s.hoursPerWeek} hrs/week`).join('\n')}

Rules:
1. Each teacher can only teach ONE period at a time across all classes
2. No teacher should teach more than 4 consecutive periods
3. Core subjects (Math, English, Science) should be in morning periods
4. PE/Arts should be in afternoon periods
5. ${constraints.doublePeriodsAllowed ? 'Double periods allowed for science labs' : 'No double periods'}

Respond ONLY with JSON timetable:
{
  "schedule": {
    "Monday": [{"period": 1, "subjectId": "", "subjectName": "", "teacherId": "", "startTime": "08:00", "endTime": "08:45"}, ...],
    "Tuesday": [...],
    ...
  }
}
`

    const response = await this.openai.chat.completions.create({
      model: this.config.get<string>('ai.openaiModel', 'gpt-4o')!,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  // ══════════════════════════════════════════════
  //  6. SMART REPORT CARD COMMENTS
  // ══════════════════════════════════════════════

  async generateReportComment(data: {
    studentName: string
    subjects: { name: string; score: number; grade: string }[]
    attendance: number
    behavior: string
    role: 'teacher' | 'principal'
  }): Promise<string> {
    const avg = data.subjects.reduce((a, b) => a + b.score, 0) / data.subjects.length

    const prompt = `
Write a ${data.role === 'principal' ? 'principal' : 'class teacher'} comment for a student report card.

Student: ${data.studentName}
Average score: ${avg.toFixed(1)}%
Attendance: ${(data.attendance * 100).toFixed(0)}%
Behavior: ${data.behavior}
Subject breakdown: ${data.subjects.map((s) => `${s.name}: ${s.score}% (${s.grade})`).join(', ')}

Requirements:
- 2-3 sentences maximum
- Constructive, encouraging, and professional
- Specific to the student's actual performance
- ${avg >= 70 ? 'Positive tone, acknowledging achievement' : avg >= 50 ? 'Encouraging improvement' : 'Motivating but realistic about need for improvement'}
- No generic statements

Respond with ONLY the comment text, no JSON.
`

    const response = await this.openai.chat.completions.create({
      model: this.config.get<string>('ai.openaiModel', 'gpt-4o')!,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    })

    return response.choices[0].message.content?.trim() || ''
  }

  // ══════════════════════════════════════════════
  //  7. AI CHATBOT / LEARNING ASSISTANT
  // ══════════════════════════════════════════════

  async askLearningAssistant(data: {
    question: string
    subject: string
    studentLevel: string
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
  }): Promise<{ answer: string; followUpQuestions: string[] }> {
    const systemPrompt = `You are EduBot, an intelligent learning assistant for ${data.studentLevel} students.
You help students understand ${data.subject} concepts clearly and encouragingly.
- Explain things simply with examples
- Ask follow-up questions to check understanding
- Never do homework for students; guide them to discover answers
- Keep responses concise (max 200 words)
- End with 2-3 thought-provoking follow-up questions`

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(data.conversationHistory || []),
      { role: 'user', content: data.question },
    ]

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
    })

    const content = response.choices[0].message.content || ''

    // Extract follow-up questions (lines that end with ?)
    const lines = content.split('\n')
    const followUpQuestions = lines.filter((l) => l.trim().endsWith('?')).slice(0, 3)
    const answer = lines.filter((l) => !followUpQuestions.includes(l.trim())).join('\n').trim()

    return { answer, followUpQuestions }
  }

  // ══════════════════════════════════════════════
  //  8. FACE VERIFICATION (Attendance)
  // ══════════════════════════════════════════════

  async verifyFaceForAttendance(
    capturedImageBuffer: Buffer,
    storedFaceUrl: string,
  ): Promise<FaceVerificationResult> {
    // In production, integrate face-api.js or AWS Rekognition
    // For now, use GPT-4o Vision for comparison
    const capturedBase64 = capturedImageBuffer.toString('base64')

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Compare these two face images. Are they the same person? Respond with JSON: {"match": boolean, "confidence": number (0-1), "reason": string}',
              },
              { type: 'image_url', image_url: { url: storedFaceUrl } },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${capturedBase64}` } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 100,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        verified: result.match && result.confidence > 0.85,
        confidence: result.confidence,
        message: result.reason,
      }
    } catch {
      return { verified: false, confidence: 0, message: 'Face verification failed' }
    }
  }

  // ══════════════════════════════════════════════
  //  Helpers
  // ══════════════════════════════════════════════

  private async performOCR(imageBuffer: Buffer): Promise<string> {
    try {
      const worker = await createWorker('eng')
      const { data } = await worker.recognize(imageBuffer)
      await worker.terminate()
      return data.text
    } catch (err) {
      this.logger.error('OCR failed', err)
      return ''
    }
  }

  private scoreToGrade(score: number): string {
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }
}
