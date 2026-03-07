// ============================================================
// ENUMS
// ============================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  ACCOUNTANT = 'ACCOUNTANT',
  LIBRARIAN = 'LIBRARIAN',
  HR_MANAGER = 'HR_MANAGER',
  COUNSELOR = 'COUNSELOR',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum LeaveType {
  SICK = 'SICK',
  ANNUAL = 'ANNUAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  EMERGENCY = 'EMERGENCY',
  STUDY = 'STUDY',
  UNPAID = 'UNPAID',
  COMPENSATORY = 'COMPENSATORY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  RECALLED = 'RECALLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL = 'PARTIAL',
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

export enum SalaryStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum LiveClassStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
  RECORDING = 'RECORDING',
}

export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  GRADED = 'GRADED',
}

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  LATE = 'LATE',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
}

export enum ExamType {
  CONTINUOUS_ASSESSMENT = 'CA',
  MID_TERM = 'MID_TERM',
  END_OF_TERM = 'END_OF_TERM',
  MOCK = 'MOCK',
  ENTRANCE = 'ENTRANCE',
}

export enum TermName {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
}

export enum NotificationType {
  GENERAL = 'GENERAL',
  ACADEMIC = 'ACADEMIC',
  FINANCIAL = 'FINANCIAL',
  ATTENDANCE = 'ATTENDANCE',
  LEAVE = 'LEAVE',
  EXAM = 'EXAM',
  SOCIAL = 'SOCIAL',
  LIVE_CLASS = 'LIVE_CLASS',
  SYSTEM = 'SYSTEM',
}

export enum PostVisibility {
  PRIVATE = 'PRIVATE',
  FRIENDS = 'FRIENDS',
  CLASS = 'CLASS',
  BRANCH = 'BRANCH',
  SCHOOL = 'SCHOOL',
  PUBLIC = 'PUBLIC',
}

export enum ProctoringEventType {
  FACE_DETECTED = 'FACE_DETECTED',
  MULTIPLE_FACES = 'MULTIPLE_FACES',
  NO_FACE = 'NO_FACE',
  PHONE_DETECTED = 'PHONE_DETECTED',
  TAB_SWITCH = 'TAB_SWITCH',
  COPY_PASTE = 'COPY_PASTE',
  FULLSCREEN_EXIT = 'FULLSCREEN_EXIT',
  NOISE_DETECTED = 'NOISE_DETECTED',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  VISITING = 'VISITING',
}

// ============================================================
// BASE INTERFACES
// ============================================================

export interface BaseDocument {
  _id: string
  createdAt: Date
  updatedAt: Date
}

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
  statusCode: number
}

// ============================================================
// USER & AUTH TYPES
// ============================================================

export interface IUser extends BaseDocument {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  schoolId: string
  branchId?: string
  phone?: string
  profilePicture?: string
  cloudinaryPublicId?: string
  isActive: boolean
  isEmailVerified: boolean
  lastLogin?: Date
  deviceTokens?: string[]
  settings?: UserSettings
}

export interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthPayload {
  sub: string
  email: string
  role: UserRole
  schoolId: string
  branchId?: string
  iat?: number
  exp?: number
}

export interface LoginDto {
  email: string
  password: string
  deviceToken?: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  schoolId: string
  branchId?: string
  phone?: string
}

// ============================================================
// SCHOOL & BRANCH TYPES
// ============================================================

export interface ISchool extends BaseDocument {
  name: string
  code: string
  logo?: string
  logoPublicId?: string
  address: IAddress
  email: string
  phone: string
  website?: string
  isActive: boolean
  subscriptionPlan: SubscriptionPlan
  subscriptionExpiry: Date
  settings: SchoolSettings
  branches: string[]
}

export interface IBranch extends BaseDocument {
  schoolId: string
  name: string
  code: string
  address: IAddress
  email: string
  phone: string
  principalId?: string
  isActive: boolean
  settings: BranchSettings
}

export interface IAddress {
  street: string
  city: string
  state: string
  country: string
  postalCode?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export type SubscriptionPlan = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE'

export interface SchoolSettings {
  academicYear: {
    start: string
    end: string
  }
  gradingSystem: GradingSystem
  currency: string
  timezone: string
  features: {
    socialFeed: boolean
    gamification: boolean
    aiFeatures: boolean
    webrtc: boolean
    library: boolean
    hostel: boolean
    transport: boolean
  }
}

export interface BranchSettings {
  maxStudentsPerClass: number
  workingDays: number[]
  schoolHours: {
    start: string
    end: string
  }
  periods: number
  periodDuration: number
}

export interface GradingSystem {
  type: 'PERCENTAGE' | 'LETTER' | 'GPA' | 'CUSTOM'
  grades: GradeScale[]
}

export interface GradeScale {
  grade: string
  minScore: number
  maxScore: number
  points?: number
  description?: string
}

// ============================================================
// ACADEMIC TYPES
// ============================================================

export interface IAcademicYear extends BaseDocument {
  schoolId: string
  name: string
  startDate: Date
  endDate: Date
  isCurrent: boolean
  terms: string[]
}

export interface ITerm extends BaseDocument {
  schoolId: string
  branchId: string
  academicYearId: string
  name: TermName
  startDate: Date
  endDate: Date
  isCurrent: boolean
  midTermBreak?: {
    start: Date
    end: Date
  }
}

export interface IClass extends BaseDocument {
  schoolId: string
  branchId: string
  name: string
  level: number
  section?: string
  academicYearId: string
  classTeacherId?: string
  room?: string
  maxStudents: number
  currentStudents: number
}

export interface ISubject extends BaseDocument {
  schoolId: string
  name: string
  code: string
  description?: string
  classIds: string[]
  teacherIds: string[]
  hoursPerWeek: number
  isElective: boolean
  passMark: number
}

export interface ITimetable extends BaseDocument {
  schoolId: string
  branchId: string
  classId: string
  termId: string
  schedule: TimetableDay[]
  isActive: boolean
  generatedByAI: boolean
}

export interface TimetableDay {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6
  periods: TimetablePeriod[]
}

export interface TimetablePeriod {
  periodNumber: number
  startTime: string
  endTime: string
  subjectId?: string
  teacherId?: string
  room?: string
  isBreak: boolean
  breakName?: string
}

// ============================================================
// STUDENT TYPES
// ============================================================

export interface IStudent extends BaseDocument {
  userId: string
  schoolId: string
  branchId: string
  admissionNumber: string
  admissionDate: Date
  classId: string
  termId: string
  parentIds: string[]
  dateOfBirth: Date
  gender: Gender
  bloodGroup?: BloodGroup
  genotype?: string
  allergies?: string[]
  medicalNotes?: string
  address: IAddress
  previousSchool?: string
  faceEncodings?: number[][]
  gamification: StudentGamification
  isActive: boolean
}

export interface StudentGamification {
  xp: number
  level: number
  badges: Badge[]
  streaks: number
  rank?: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  awardedAt: Date
}

// ============================================================
// TEACHER TYPES
// ============================================================

export interface ITeacher extends BaseDocument {
  userId: string
  schoolId: string
  branchId: string
  staffId: string
  qualification: string[]
  specializations: string[]
  subjectIds: string[]
  classIds: string[]
  dateHired: Date
  employmentType: EmploymentType
  salaryGradeId?: string
  leaveBalance: LeaveBalance[]
  isActive: boolean
}

export interface LeaveBalance {
  leaveType: LeaveType
  totalDays: number
  usedDays: number
  pendingDays: number
  year: number
}

// ============================================================
// PARENT TYPES
// ============================================================

export interface IParent extends BaseDocument {
  userId: string
  schoolId: string
  studentIds: string[]
  occupation?: string
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER'
  alternatePhone?: string
  canPickup: boolean
}

// ============================================================
// ATTENDANCE TYPES
// ============================================================

export interface IAttendance extends BaseDocument {
  schoolId: string
  branchId: string
  classId: string
  subjectId?: string
  termId: string
  date: Date
  takenById: string
  records: AttendanceRecord[]
  type: 'CLASS' | 'SUBJECT' | 'EVENT'
}

export interface AttendanceRecord {
  studentId: string
  status: AttendanceStatus
  timeIn?: Date
  timeOut?: Date
  remark?: string
  verifiedByFace: boolean
}

export interface StaffAttendance extends BaseDocument {
  schoolId: string
  branchId: string
  userId: string
  date: Date
  checkIn?: Date
  checkOut?: Date
  status: AttendanceStatus
  verificationMethod: 'MANUAL' | 'BIOMETRIC' | 'FACE' | 'QR'
  location?: {
    lat: number
    lng: number
  }
}

// ============================================================
// FINANCIAL TYPES
// ============================================================

export interface IFeeStructure extends BaseDocument {
  schoolId: string
  branchId: string
  classId?: string
  termId: string
  name: string
  items: FeeItem[]
  totalAmount: number
  dueDate: Date
  isActive: boolean
}

export interface FeeItem {
  name: string
  amount: number
  isOptional: boolean
  category: 'TUITION' | 'UNIFORM' | 'BOOKS' | 'TRANSPORT' | 'HOSTEL' | 'OTHER'
}

export interface IStudentFee extends BaseDocument {
  schoolId: string
  studentId: string
  feeStructureId: string
  termId: string
  totalAmount: number
  amountPaid: number
  balance: number
  status: FeeStatus
  dueDate: Date
  discount?: FeeDiscount
  payments: FeePayment[]
  waiverId?: string
}

export interface FeeDiscount {
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  reason: string
  approvedById: string
}

export interface FeePayment {
  amount: number
  date: Date
  method: 'CARD' | 'BANK_TRANSFER' | 'CASH' | 'PAYSTACK' | 'FLUTTERWAVE' | 'WALLET'
  reference: string
  status: PaymentStatus
  gateway?: string
  gatewayRef?: string
  receiptUrl?: string
}

export interface ISalaryGrade extends BaseDocument {
  schoolId: string
  name: string
  level: number
  basicSalary: number
  allowances: Allowance[]
  deductions: Deduction[]
}

export interface Allowance {
  name: string
  type: 'FIXED' | 'PERCENTAGE'
  value: number
}

export interface Deduction {
  name: string
  type: 'FIXED' | 'PERCENTAGE'
  value: number
  mandatory: boolean
}

export interface ISalaryPayment extends BaseDocument {
  schoolId: string
  userId: string
  salaryGradeId: string
  month: number
  year: number
  basicSalary: number
  allowances: Record<string, number>
  deductions: Record<string, number>
  grossPay: number
  netPay: number
  status: SalaryStatus
  paymentDate?: Date
  bankName?: string
  accountNumber?: string
  transactionReference?: string
  payslipUrl?: string
}

// ============================================================
// HR / LEAVE TYPES
// ============================================================

export interface ILeaveRequest extends BaseDocument {
  schoolId: string
  branchId: string
  userId: string
  leaveType: LeaveType
  startDate: Date
  endDate: Date
  durationDays: number
  reason: string
  documentUrl?: string
  documentPublicId?: string
  status: LeaveStatus
  approvedById?: string
  approvalDate?: Date
  rejectionReason?: string
  substituteTeacherId?: string
  handoverNotes?: string
  substituteApproved?: boolean
}

// ============================================================
// EXAM & GRADES TYPES
// ============================================================

export interface IExam extends BaseDocument {
  schoolId: string
  branchId: string
  classId: string
  subjectId: string
  termId: string
  title: string
  type: ExamType
  date: Date
  startTime: string
  endTime: string
  totalMarks: number
  passMark: number
  duration: number
  venue?: string
  instructions?: string
  invigilatorIds: string[]
  isPublished: boolean
  aiProctoringEnabled: boolean
}

export interface IResult extends BaseDocument {
  schoolId: string
  studentId: string
  examId: string
  subjectId: string
  termId: string
  classId: string
  score: number
  grade: string
  gradePoints: number
  remarks?: string
  gradedById: string
  gradedAt: Date
  aiGraded: boolean
  scannedImageUrl?: string
}

export interface IReportCard extends BaseDocument {
  schoolId: string
  studentId: string
  classId: string
  termId: string
  academicYearId: string
  subjects: SubjectReport[]
  totalScore: number
  average: number
  grade: string
  position: number
  totalStudents: number
  attendance: {
    present: number
    absent: number
    total: number
    percentage: number
  }
  teacherComment?: string
  principalComment?: string
  isPublished: boolean
  publishedAt?: Date
}

export interface SubjectReport {
  subjectId: string
  subjectName: string
  ca: number
  midTerm: number
  exam: number
  total: number
  grade: string
  position: number
  teacherComment?: string
}

// ============================================================
// ASSIGNMENT TYPES
// ============================================================

export interface IAssignment extends BaseDocument {
  schoolId: string
  classId: string
  subjectId: string
  teacherId: string
  termId: string
  title: string
  description: string
  attachments?: AssignmentAttachment[]
  dueDate: Date
  totalMarks: number
  passMark: number
  status: AssignmentStatus
  allowLateSubmission: boolean
  latePenalty?: number
  rubric?: AssignmentRubric[]
}

export interface AssignmentAttachment {
  name: string
  url: string
  publicId: string
  type: 'PDF' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER'
  size: number
}

export interface AssignmentRubric {
  criterion: string
  maxScore: number
  description: string
}

export interface ISubmission extends BaseDocument {
  assignmentId: string
  studentId: string
  content?: string
  attachments?: AssignmentAttachment[]
  submittedAt: Date
  status: SubmissionStatus
  score?: number
  grade?: string
  feedback?: string
  gradedById?: string
  gradedAt?: Date
  isLate: boolean
  latePenaltyApplied?: number
  aiAnalysis?: AIGradingResult
}

// ============================================================
// LIVE CLASS / WEBRTC TYPES
// ============================================================

export interface ILiveClass extends BaseDocument {
  schoolId: string
  branchId: string
  classId: string
  subjectId: string
  teacherId: string
  termId: string
  title: string
  description?: string
  scheduledStart: Date
  scheduledEnd: Date
  actualStart?: Date
  actualEnd?: Date
  roomName: string
  roomPassword?: string
  recordingUrl?: string
  recordingPublicId?: string
  recordingStatus: 'NONE' | 'RECORDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  aiProctoringEnabled: boolean
  status: LiveClassStatus
  maxParticipants: number
  allowChat: boolean
  allowRaiseHand: boolean
  allowScreenShare: boolean
  attendance: LiveClassAttendance[]
}

export interface LiveClassAttendance {
  studentId: string
  joinedAt: Date
  leftAt?: Date
  duration: number
}

export interface IProctoringLog extends BaseDocument {
  schoolId: string
  liveClassId?: string
  examId?: string
  studentId: string
  eventType: ProctoringEventType
  confidenceScore: number
  screenshotUrl?: string
  screenshotPublicId?: string
  actionTaken: 'WARNING' | 'LOGGED' | 'FLAGGED' | 'DISCONNECTED'
  metadata?: Record<string, unknown>
}

// ============================================================
// SOCIAL TYPES
// ============================================================

export interface ISocialPost extends BaseDocument {
  schoolId: string
  authorId: string
  content: string
  mediaUrls?: PostMedia[]
  visibility: PostVisibility
  groupId?: string
  classId?: string
  branchId?: string
  tags?: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  isFlagged: boolean
  flaggedReason?: string
  flaggedById?: string
  isModerated: boolean
  moderatedAt?: Date
  isPinned: boolean
}

export interface PostMedia {
  url: string
  publicId: string
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  thumbnail?: string
}

export interface IComment extends BaseDocument {
  postId: string
  authorId: string
  content: string
  parentId?: string
  likesCount: number
  isFlagged: boolean
  replies?: string[]
}

export interface ISocialGroup extends BaseDocument {
  schoolId: string
  name: string
  description?: string
  coverImage?: string
  coverPublicId?: string
  adminIds: string[]
  memberIds: string[]
  type: 'CLASS' | 'SUBJECT' | 'CLUB' | 'GENERAL'
  isPrivate: boolean
  requireApproval: boolean
  pendingMemberIds: string[]
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export interface INotification extends BaseDocument {
  schoolId: string
  recipientId: string
  senderId?: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  isRead: boolean
  readAt?: Date
  channels: ('PUSH' | 'EMAIL' | 'SMS' | 'IN_APP')[]
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
}

// ============================================================
// LIBRARY TYPES
// ============================================================

export interface IBook extends BaseDocument {
  schoolId: string
  branchId: string
  title: string
  author: string[]
  isbn?: string
  category: string[]
  publisher?: string
  publishedYear?: number
  edition?: string
  description?: string
  coverImage?: string
  coverPublicId?: string
  totalCopies: number
  availableCopies: number
  location?: string
  isDigital: boolean
  digitalUrl?: string
  digitalPublicId?: string
}

export interface IBookLoan extends BaseDocument {
  schoolId: string
  bookId: string
  borrowerId: string
  borrowerType: 'STUDENT' | 'TEACHER'
  issuedById: string
  issuedAt: Date
  dueDate: Date
  returnedAt?: Date
  returnedTo?: string
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST'
  fineAmount?: number
  finePaid?: boolean
}

// ============================================================
// TRANSPORT TYPES
// ============================================================

export interface ITransportRoute extends BaseDocument {
  schoolId: string
  branchId: string
  name: string
  description?: string
  stops: RouteStop[]
  vehicleId?: string
  driverId?: string
  estimatedDuration: number
  distanceKm: number
  feePerTerm: number
}

export interface RouteStop {
  name: string
  coordinates: { lat: number; lng: number }
  pickupTime: string
  dropTime: string
  order: number
}

// ============================================================
// AI TYPES
// ============================================================

export interface AIGradingResult {
  score: number
  maxScore: number
  percentage: number
  grade: string
  feedback: string
  strengths: string[]
  improvements: string[]
  confidence: number
}

export interface PredictionResult {
  studentId: string
  predictedScore: number
  predictedGrade: string
  confidence: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendations: string[]
  factors: PredictionFactor[]
}

export interface PredictionFactor {
  factor: string
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  weight: number
  description: string
}

export interface FaceVerificationResult {
  verified: boolean
  confidence: number
  studentId?: string
  message: string
}

export interface ContentModerationResult {
  allowed: boolean
  confidence: number
  categories: {
    harassment: boolean
    violence: boolean
    hate: boolean
    selfHarm: boolean
    sexual: boolean
  }
  action: 'ALLOW' | 'FLAG' | 'BLOCK'
  reason?: string
}

// ============================================================
// CLOUDINARY TYPES
// ============================================================

export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  url: string
  format: string
  resourceType: 'image' | 'video' | 'raw' | 'auto'
  size: number
  width?: number
  height?: number
  duration?: number
  thumbnailUrl?: string
}

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
  gravity?: string
}

// ============================================================
// WEBSOCKET TYPES
// ============================================================

export interface WebSocketMessage<T = unknown> {
  event: string
  data: T
  timestamp: Date
  roomId?: string
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate'
  payload: unknown
  fromId: string
  toId?: string
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalParents: number
  totalClasses: number
  attendanceToday: number
  feesCollectedThisMonth: number
  pendingLeaveRequests: number
  activeLiveClasses: number
  upcomingExams: number
  libraryBooksOut: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}

// ============================================================
// ADDITIONAL TYPES FROM PRD v2.5
// ============================================================

// ─── Extended User Roles ───────────────────────────────────
export enum ExtendedUserRole {
  REGIONAL_DIRECTOR = 'REGIONAL_DIRECTOR',
  BRANCH_ACADEMIC_HEAD = 'BRANCH_ACADEMIC_HEAD',
  BRANCH_HR_OFFICER = 'BRANCH_HR_OFFICER',
  BRANCH_ACCOUNTING_OFFICER = 'BRANCH_ACCOUNTING_OFFICER',
  CLEANER = 'CLEANER',
  SECURITY_OFFICER = 'SECURITY_OFFICER',
  DRIVER = 'DRIVER',
  NURSE = 'NURSE',
  LIBRARIAN = 'LIBRARIAN',
  ICT_SUPPORT = 'ICT_SUPPORT',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  CATERING_STAFF = 'CATERING_STAFF',
  STORE_KEEPER = 'STORE_KEEPER',
  MAINTENANCE_STAFF = 'MAINTENANCE_STAFF',
  ADMIN_ASSISTANT = 'ADMIN_ASSISTANT',
  SPORTS_MASTER = 'SPORTS_MASTER',
  ALUMNI = 'ALUMNI',
}

// ─── Leave Types (full 19 types) ─────────────────────────
export enum FullLeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  EMERGENCY_SICK = 'EMERGENCY_SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  BEREAVEMENT = 'BEREAVEMENT',
  STUDY = 'STUDY',
  EXAMINATION = 'EXAMINATION',
  UNPAID = 'UNPAID',
  SABBATICAL = 'SABBATICAL',
  CASUAL = 'CASUAL',
  HALF_DAY = 'HALF_DAY',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  RELIGIOUS = 'RELIGIOUS',
  WEDDING = 'WEDDING',
  CHILDCARE = 'CHILDCARE',
  HOSPITALIZATION = 'HOSPITALIZATION',
  QUARANTINE = 'QUARANTINE',
  JURY_DUTY = 'JURY_DUTY',
}

// ─── Leave Management Types ───────────────────────────────
export interface ILeaveRequest {
  _id: string
  schoolId: string
  branchId: string
  userId: string
  leaveType: FullLeaveType
  startDate: Date
  endDate: Date
  durationDays: number
  halfDayPart?: 'MORNING' | 'AFTERNOON'
  reason: string
  documentUrl?: string
  handoverNotes?: string
  substituteTeacherId?: string
  substituteConfirmed: boolean
  status: string
  approvalHistory: IApprovalEntry[]
  finalApprovedById?: string
  finalApprovalDate?: Date
  rejectionReason?: string
  hasConflict: boolean
  conflictDetails: string[]
  payDeductionDays: number
  createdAt: Date
  updatedAt: Date
}

export interface IApprovalEntry {
  level: string
  approverId: string
  action: 'APPROVED' | 'REJECTED' | 'NOTED'
  comment?: string
  date: Date
}

export interface ILeaveBalance {
  userId: string
  schoolId: string
  leaveType: FullLeaveType
  year: number
  totalDays: number
  usedDays: number
  pendingDays: number
  carriedOverDays: number
  encashedDays: number
  availableDays: number // computed: total + carried - used - pending
}

export interface ILeavePolicy {
  schoolId: string
  leaveType: FullLeaveType
  name: string
  defaultDays: number
  isPaid: boolean
  payPercentage: number
  applicableRoles: string[]
  requiresDocument: boolean
  documentRequiredAfterDays: number
  accrues: boolean
  accrualRatePerMonth: number
  maxCarryOverDays: number
  allowEncashment: boolean
  blackoutPeriods: string[]
  minStaffingPercent: number
  approvalLevels: string[]
  isActive: boolean
}

export interface ISubstituteAssignment {
  _id: string
  leaveRequestId: string
  schoolId: string
  originalTeacherId: string
  substituteTeacherId: string
  startDate: Date
  endDate: Date
  classIds: string[]
  subjectIds: string[]
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  dailyRate: number
  totalPayment: number
  paymentProcessed: boolean
}

// ─── Health & Medical ─────────────────────────────────────
export interface IStudentHealth {
  studentId: string
  schoolId: string
  bloodGroup?: string
  genotype?: string
  allergies: string[]
  chronicConditions: string[]
  medicalConditions: IMedicalCondition[]
  medications: IStudentMedication[]
  familyDoctorName?: string
  familyDoctorPhone?: string
  preferredHospital?: string
  insuranceProvider?: string
  insurancePolicyNumber?: string
  immunizations: IImmunization[]
  lastDentalCheckup?: Date
  lastVisionTest?: Date
  wearsGlasses: boolean
  hasSpecialNeeds: boolean
  emergencyContacts: IEmergencyContact[]
}

export interface IMedicalCondition {
  condition: string
  severity: 'MILD' | 'MODERATE' | 'SEVERE'
  emergencyProtocol: string
  medications: string[]
}

export interface IStudentMedication {
  name: string
  dosage: string
  frequency: string
  schedule: string[]
  prescribedBy: string
  endDate?: Date
  parentConsent: boolean
}

export interface IImmunization {
  vaccineName: string
  dateGiven?: Date
  nextDue?: Date
  status: 'COMPLETE' | 'DUE' | 'OVERDUE' | 'EXEMPTED'
}

export interface IEmergencyContact {
  name: string
  relationship: string
  phone: string
  alternatePhone?: string
}

export interface IClinicVisit {
  _id: string
  schoolId: string
  branchId: string
  patientId: string
  patientType: 'STUDENT' | 'STAFF'
  visitDate: Date
  complaint: string
  assessment: string
  treatmentGiven: string[]
  medicationsDispensed: { name: string; dosage: string; quantity: number }[]
  restedInClinic: boolean
  parentNotified: boolean
  outcome: 'SENT_HOME' | 'REFERRED_HOSPITAL' | 'RETURNED_CLASS' | 'STILL_IN_CLINIC' | 'AMBULANCE_CALLED'
  attendedById: string
  followUpRequired: boolean
}

// ─── Transport ────────────────────────────────────────────
export interface IVehicle {
  _id: string
  schoolId: string
  branchId: string
  registrationNumber: string
  make: string
  model: string
  year: number
  type: 'BUS' | 'MINIBUS' | 'VAN' | 'CAR' | 'COASTER'
  seatingCapacity: number
  insuranceExpiry?: Date
  roadworthinessExpiry?: Date
  lastServiceDate?: Date
  nextServiceDueDate?: Date
  gpsDeviceId?: string
  currentLatitude?: number
  currentLongitude?: number
  assignedDriverId?: string
  assignedRouteId?: string
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE' | 'DECOMMISSIONED'
}

export interface ITransportRoute {
  _id: string
  schoolId: string
  branchId: string
  name: string
  direction: 'MORNING' | 'AFTERNOON' | 'BOTH'
  stops: IRouteStop[]
  vehicleId?: string
  driverId?: string
  feePerTerm: number
  capacity: number
  enrolledStudentIds: string[]
  isActive: boolean
}

export interface IRouteStop {
  name: string
  address?: string
  latitude?: number
  longitude?: number
  pickupTime: string
  dropoffTime: string
  order: number
  landmark?: string
}

// ─── Hostel ───────────────────────────────────────────────
export interface IHostelBlock {
  _id: string
  schoolId: string
  branchId: string
  name: string
  gender: 'BOYS' | 'GIRLS' | 'MIXED'
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  houseParentId?: string
  isActive: boolean
}

export interface IHostelAllocation {
  _id: string
  studentId: string
  blockId: string
  roomId: string
  bedNumber: string
  termId: string
  checkInDate: Date
  status: 'ACTIVE' | 'CHECKED_OUT' | 'TRANSFERRED'
  feeAmount: number
  feePaid: boolean
}

export interface IHostelExeat {
  _id: string
  studentId: string
  allocationId: string
  departureDate: Date
  expectedReturnDate: Date
  actualReturnDate?: Date
  destination: string
  escortName: string
  escortRelationship: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE'
}

// ─── Sports ───────────────────────────────────────────────
export interface ISportsTeam {
  _id: string
  schoolId: string
  branchId: string
  name: string
  sport: string
  gender: 'MALE' | 'FEMALE' | 'MIXED'
  ageGroup?: string
  coachId?: string
  roster: ITeamRosterEntry[]
  isActive: boolean
}

export interface ITeamRosterEntry {
  studentId: string
  jerseyNumber?: number
  position?: string
  isCaptain: boolean
  joinDate: Date
}

export interface IMatchFixture {
  _id: string
  schoolId: string
  sport: string
  homeTeamId: string
  awayTeamName: string
  matchDate: Date
  venue: string
  competitionType: 'FRIENDLY' | 'LEAGUE' | 'CUP' | 'INTER_HOUSE' | 'INTER_SCHOOL'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED'
  homeScore?: number
  awayScore?: number
  result?: 'HOME' | 'AWAY' | 'DRAW'
  manOfMatchId?: string
}

export interface IHouse {
  _id: string
  schoolId: string
  branchId: string
  name: string
  color: string
  motto?: string
  houseMasterId?: string
  captainId?: string
  totalPoints: number
  memberIds: string[]
}

// ─── Events ───────────────────────────────────────────────
export interface ISchoolEvent {
  _id: string
  schoolId: string
  title: string
  description?: string
  type: string
  startDate: Date
  endDate: Date
  venue?: string
  audience: string
  organizerId: string
  estimatedBudget: number
  approvedBudget: number
  status: string
  requiresRsvp: boolean
  rsvpDeadline?: Date
  maxCapacity: number
  rsvpResponses: IEventRsvp[]
  tasks: IEventTask[]
  runOfShow: IRunOfShowItem[]
}

export interface IEventRsvp {
  userId: string
  response: 'YES' | 'NO' | 'MAYBE'
  respondedAt: Date
  guestCount: number
}

export interface IEventTask {
  title: string
  assignedToId: string
  dueDate: Date
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface IRunOfShowItem {
  time: string
  activity: string
  duration: number
  responsiblePerson?: string
}

// ─── Cafeteria ────────────────────────────────────────────
export interface IMenuItem {
  _id: string
  schoolId: string
  name: string
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  ingredients: string[]
  calories?: number
  costPerServing: number
  pricePerServing: number
  allergens: string[]
  dietaryTags: string[]
  isAvailable: boolean
}

export interface IMealSubscription {
  _id: string
  schoolId: string
  studentId: string
  termId: string
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  balance: number
  isActive: boolean
  allergyAlerts: string[]
}

// ─── Inventory / Store ────────────────────────────────────
export enum StoreCategory {
  UNIFORMS = 'UNIFORMS',
  BOOKS = 'BOOKS',
  SPORTS_EQUIPMENT = 'SPORTS_EQUIPMENT',
  SCIENCE_LAB = 'SCIENCE_LAB',
  ICT = 'ICT',
  MAINTENANCE = 'MAINTENANCE',
  CAFETERIA = 'CAFETERIA',
  CLEANING = 'CLEANING',
  MEDICAL = 'MEDICAL',
  GENERAL = 'GENERAL',
}

export interface IInventoryItem {
  _id: string
  schoolId: string
  branchId: string
  name: string
  sku: string
  category: StoreCategory
  quantityInStock: number
  reorderLevel: number
  unit: string
  unitCostPrice: number
  unitSellingPrice: number
  isForSale: boolean
  expiryDate?: Date
  variants?: { size: string; quantity: number; gender: string }[]
  isActive: boolean
}

export interface IStockMovement {
  _id: string
  schoolId: string
  itemId: string
  movementType: 'STOCK_IN' | 'STOCK_OUT' | 'RETURN' | 'ADJUSTMENT' | 'SALE' | 'DAMAGE'
  quantity: number
  quantityBefore: number
  quantityAfter: number
  processedById: string
  reason?: string
}

export interface IRequisition {
  _id: string
  schoolId: string
  requisitionNumber: string
  requestedById: string
  items: IRequisitionItem[]
  status: 'PENDING' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'ISSUED'
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  purpose: string
}

export interface IRequisitionItem {
  itemId: string
  itemName: string
  quantityRequested: number
  quantityApproved?: number
  quantityIssued?: number
  unit: string
}

// ─── Maintenance ──────────────────────────────────────────
export interface IMaintenanceRequest {
  _id: string
  schoolId: string
  ticketNumber: string
  facilityId?: string
  reportedById: string
  title: string
  description: string
  category: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  photoUrls: string[]
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'REJECTED'
  assignedToId?: string
  estimatedCost: number
  actualCost: number
  rating?: number
  slaDeadline?: Date
  slaBreach: boolean
}

// ─── ICT Support ──────────────────────────────────────────
export interface IIctAsset {
  _id: string
  schoolId: string
  assetTag: string
  name: string
  type: string
  make?: string
  model?: string
  serialNumber?: string
  warrantyExpiry?: Date
  assignedToId?: string
  status: 'ACTIVE' | 'IN_REPAIR' | 'DECOMMISSIONED' | 'STOLEN' | 'LOST'
  ipAddress?: string
}

export interface IItTicket {
  _id: string
  schoolId: string
  ticketNumber: string
  reportedById: string
  title: string
  category: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  assignedToId?: string
  slaDeadline?: Date
  slaBreach: boolean
}

// ─── Security ─────────────────────────────────────────────
export interface IVisitorLog {
  _id: string
  schoolId: string
  visitorName: string
  visitorPhone: string
  purpose: string
  personToVisitName?: string
  checkInTime: Date
  checkOutTime?: Date
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'CHECKED_OUT'
  loggedById: string
  badgeNumber?: string
}

export interface ISecurityIncident {
  _id: string
  schoolId: string
  incidentNumber: string
  incidentDate: Date
  type: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  actionTaken: string
  policeReported: boolean
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
}

// ─── Alumni ───────────────────────────────────────────────
export interface IAlumni {
  _id: string
  schoolId: string
  userId?: string
  studentId?: string
  firstName: string
  lastName: string
  graduationYear: number
  email?: string
  phone?: string
  currentEmployer?: string
  jobTitle?: string
  industry?: string
  higherEducation: IHigherEd[]
  isMentor: boolean
  totalDonations: number
  status: 'ACTIVE' | 'INACTIVE' | 'DECEASED' | 'UNVERIFIED'
  portalAccessEnabled: boolean
}

export interface IHigherEd {
  institution: string
  degree: string
  field: string
  graduationYear: number
}

// ─── Admissions ───────────────────────────────────────────
export interface IAdmissionEnquiry {
  _id: string
  schoolId: string
  parentName: string
  parentEmail: string
  parentPhone: string
  childName: string
  targetClass?: string
  status: 'NEW' | 'CONTACTED' | 'TOUR_SCHEDULED' | 'APPLIED' | 'CONVERTED' | 'LOST'
  assignedToId?: string
  followUps: IFollowUp[]
  nextFollowUpDate?: Date
}

export interface IFollowUp {
  date: Date
  type: 'CALL' | 'EMAIL' | 'SMS' | 'MEETING' | 'NOTE'
  note: string
  userId: string
  outcome?: string
  nextFollowUp?: Date
}

export interface IAdmissionApplication {
  _id: string
  schoolId: string
  applicationNumber: string
  academicYearId: string
  targetClass: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  applicationFeePaid: boolean
  entranceExamScore?: number
  interviewScore?: number
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'OFFER_MADE' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  enrolled: boolean
  studentId?: string
}

// ─── Payroll ──────────────────────────────────────────────
export interface IPayrollRecord {
  _id: string
  schoolId: string
  branchId: string
  userId: string
  month: number
  year: number
  basicSalary: number
  grossPay: number
  totalDeductions: number
  netPay: number
  incomeTax: number
  pensionEmployee: number
  pensionEmployer: number
  nhf: number
  leaveDeduction: number
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'REVERSED'
  paymentDate?: Date
  paymentReference?: string
  payslipUrl?: string
}

export interface ISalaryGrade {
  _id: string
  schoolId: string
  gradeName: string
  level: number
  basicSalary: number
  housingAllowance: number
  transportAllowance: number
  medicalAllowance: number
  applicableRoles: string[]
  isActive: boolean
}

// ─── Gamification ─────────────────────────────────────────
export enum PointCategory {
  ACADEMIC = 'ACADEMIC',
  ATTENDANCE = 'ATTENDANCE',
  BEHAVIOR = 'BEHAVIOR',
  SPORTS = 'SPORTS',
  SOCIAL = 'SOCIAL',
  SPECIAL = 'SPECIAL',
}

export interface IStudentPoints {
  studentId: string
  schoolId: string
  totalPoints: number
  availablePoints: number
  redeemedPoints: number
  termPoints: number
  housePoints: number
  badges: IStudentBadge[]
  currentRank: number
}

export interface IStudentBadge {
  name: string
  iconUrl?: string
  earnedAt: Date
  category: string
}

export interface IPointRule {
  action: string
  category: PointCategory
  points: number
  description?: string
  maxPerDay?: number
  maxPerTerm?: number
}

export interface IRewardItem {
  name: string
  description: string
  type: 'VIRTUAL' | 'PHYSICAL' | 'EXPERIENCE' | 'PRIVILEGE'
  pointsCost: number
  stock?: number
  isActive: boolean
}

// ─── Communication ────────────────────────────────────────
export interface INoticeBoard {
  _id: string
  schoolId: string
  title: string
  content: string
  type: 'ANNOUNCEMENT' | 'CLASSIFIEDS' | 'LOST_AND_FOUND' | 'NOTICE' | 'URGENT'
  targetAudience: string[]
  postedById: string
  expiryDate?: Date
  isPinned: boolean
  isActive: boolean
  viewCount: number
}

export interface IBulkMessage {
  _id: string
  schoolId: string
  subject: string
  body: string
  channel: 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP'
  targetGroup: string
  sentById: string
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED'
  totalRecipients: number
  successCount: number
  failCount: number
}

export interface IParentTeacherMeeting {
  _id: string
  schoolId: string
  teacherId: string
  studentId: string
  parentId: string
  scheduledAt: Date
  durationMinutes: number
  format: 'IN_PERSON' | 'ONLINE'
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  agenda?: string
  notes?: string
}

// ─── Audit Log ────────────────────────────────────────────
export interface IAuditLog {
  _id: string
  schoolId?: string
  userId: string
  userEmail?: string
  userRole?: string
  action: string
  module: string
  resourceType?: string
  resourceId?: string
  previousValue?: Record<string, any>
  newValue?: Record<string, any>
  ipAddress: string
  timestamp: Date
  result: 'SUCCESS' | 'FAILURE' | 'WARNING'
}

// ─── Staffing Alert ───────────────────────────────────────
export interface IStaffingAlert {
  branchId: string
  date: Date
  totalStaff: number
  onLeave: number
  available: number
  percentage: number
  status: 'RED' | 'YELLOW' | 'GREEN'
}

// ─── Library Extension (from PRD v1) ─────────────────────
export interface ILibraryFine {
  studentId: string
  bookId: string
  daysOverdue: number
  fineAmount: number
  isPaid: boolean
  paidDate?: Date
}

// ─── Extended Exam Types ──────────────────────────────────
export enum ExamTypeExtended {
  CONTINUOUS_ASSESSMENT = 'CONTINUOUS_ASSESSMENT',
  MID_TERM = 'MID_TERM',
  FINAL = 'FINAL',
  MOCK = 'MOCK',
  EXTERNAL_WAEC = 'EXTERNAL_WAEC',
  EXTERNAL_NECO = 'EXTERNAL_NECO',
  EXTERNAL_JAMB = 'EXTERNAL_JAMB',
}

// ─── Dashboard Extended Stats ─────────────────────────────
export interface IExtendedDashboardStats {
  schoolId: string
  // People
  totalStudents: number
  totalStaff: number
  totalTeachers: number
  totalParents: number
  // Operations
  staffOnLeaveToday: number
  pendingMaintenanceRequests: number
  openItTickets: number
  visitorsTodayCount: number
  // Academic
  activeClasses: number
  liveClassesNow: number
  // Financial
  feesCollectedThisMonth: number
  outstandingFeesTotal: number
  // Health
  clinicVisitsToday: number
  // Transport
  busesOnRoute: number
  // Alerts
  criticalMaintenanceRequests: number
  stockBelowReorderLevel: number
  medicationsNearExpiry: number
}
