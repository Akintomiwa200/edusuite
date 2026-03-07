import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { School, SchoolDocument, Branch, BranchDocument, SubscriptionTier } from './schemas/school.schema'

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name)

  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
  ) {}

  // ─── Schools ────────────────────────────────────────────────────────────────

  async createSchool(dto: any) {
    const existingCode = await this.schoolModel.findOne({ code: dto.code?.toUpperCase() })
    if (existingCode) throw new ConflictException('School code already exists')

    const school = await this.schoolModel.create({
      ...dto,
      code: dto.code?.toUpperCase(),
      subscription: {
        tier: SubscriptionTier.BASIC,
        isActive: true,
        isTrial: true,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        maxStudents: 500,
        maxStaff: 50,
        maxBranches: 1,
        features: [],
        monthlyFee: 50000,
        currency: 'NGN',
      },
      settings: {
        currency: 'NGN',
        currencySymbol: '₦',
        timezone: 'Africa/Lagos',
        dateFormat: 'DD/MM/YYYY',
        gradeSystem: 'percentage',
        attendanceModel: 'daily',
        weekdays: [1, 2, 3, 4, 5],
        academicYearStartMonth: 9,
        ...dto.settings,
      },
    })

    // Create default HQ branch
    await this.branchModel.create({
      schoolId: school._id,
      name: `${school.name} - Main Campus`,
      code: `${school.code}-HQ`,
      address: school.address,
      city: school.city,
      isHeadquarters: true,
      isActive: true,
    })

    return school
  }

  async findAllSchools(query: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    tier?: SubscriptionTier
  }) {
    const { page = 1, limit = 20, search, isActive, tier } = query
    const filter: any = {}

    if (search) filter.$text = { $search: search }
    if (isActive !== undefined) filter.isActive = isActive
    if (tier) filter['subscription.tier'] = tier

    const [data, total] = await Promise.all([
      this.schoolModel
        .find(filter)
        .select('-__v')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.schoolModel.countDocuments(filter),
    ])

    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
  }

  async findById(id: string) {
    const school = await this.schoolModel.findById(id).select('-__v')
    if (!school) throw new NotFoundException('School not found')
    return school
  }

  async updateSchool(id: string, dto: any) {
    const school = await this.schoolModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
    if (!school) throw new NotFoundException('School not found')
    return school
  }

  async updateSubscription(schoolId: string, dto: {
    tier: SubscriptionTier
    endDate: Date
    maxStudents?: number
    maxStaff?: number
    maxBranches?: number
  }) {
    const tierPricing: Record<SubscriptionTier, number> = {
      [SubscriptionTier.BASIC]: 50000,
      [SubscriptionTier.PROFESSIONAL]: 150000,
      [SubscriptionTier.ENTERPRISE]: 350000,
      [SubscriptionTier.ULTIMATE]: 500000,
    }

    const school = await this.schoolModel.findByIdAndUpdate(
      schoolId,
      {
        $set: {
          'subscription.tier': dto.tier,
          'subscription.endDate': dto.endDate,
          'subscription.isActive': true,
          'subscription.isTrial': false,
          'subscription.monthlyFee': tierPricing[dto.tier],
          ...(dto.maxStudents && { 'subscription.maxStudents': dto.maxStudents }),
          ...(dto.maxStaff && { 'subscription.maxStaff': dto.maxStaff }),
          ...(dto.maxBranches && { 'subscription.maxBranches': dto.maxBranches }),
        },
      },
      { new: true },
    )
    if (!school) throw new NotFoundException('School not found')
    return school
  }

  async updateSettings(schoolId: string, settings: any) {
    const school = await this.schoolModel.findByIdAndUpdate(
      schoolId,
      { $set: { settings } },
      { new: true },
    )
    if (!school) throw new NotFoundException('School not found')
    return school
  }

  async setCurrentTerm(schoolId: string, termData: {
    currentTermName: string
    currentTermNumber: 1 | 2 | 3
    academicYear: string
    termStartDate: Date
    termEndDate: Date
  }) {
    const school = await this.schoolModel.findByIdAndUpdate(
      schoolId,
      { $set: { currentTerm: termData } },
      { new: true },
    )
    if (!school) throw new NotFoundException('School not found')
    return school
  }

  async getSchoolStats(schoolId: string) {
    const school = await this.findById(schoolId)
    const branches = await this.branchModel.countDocuments({ schoolId, isActive: true })

    return {
      school,
      stats: {
        activeBranches: branches,
        subscriptionStatus: school.subscription.isActive ? 'active' : 'inactive',
        isTrial: school.subscription.isTrial,
        daysUntilExpiry: school.subscription.endDate
          ? Math.ceil((new Date(school.subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      },
    }
  }

  // ─── Branches ────────────────────────────────────────────────────────────────

  async createBranch(schoolId: string, dto: any) {
    const school = await this.findById(schoolId)
    const branchCount = await this.branchModel.countDocuments({ schoolId, isActive: true })

    if (branchCount >= school.subscription.maxBranches) {
      throw new BadRequestException(
        `Your subscription allows maximum ${school.subscription.maxBranches} branches. Please upgrade to add more.`,
      )
    }

    const existing = await this.branchModel.findOne({
      schoolId,
      code: dto.code?.toUpperCase(),
    })
    if (existing) throw new ConflictException('Branch code already exists in this school')

    return this.branchModel.create({ ...dto, schoolId, code: dto.code?.toUpperCase() })
  }

  async getBranches(schoolId: string) {
    return this.branchModel.find({ schoolId, isActive: true }).sort({ isHeadquarters: -1, name: 1 })
  }

  async updateBranch(branchId: string, dto: any) {
    const branch = await this.branchModel.findByIdAndUpdate(branchId, { $set: dto }, { new: true })
    if (!branch) throw new NotFoundException('Branch not found')
    return branch
  }

  async checkFeatureAccess(schoolId: string, feature: string): Promise<boolean> {
    const school = await this.findById(schoolId)
    if (!school.subscription.isActive) return false

    const tierHierarchy: Record<SubscriptionTier, number> = {
      [SubscriptionTier.BASIC]: 1,
      [SubscriptionTier.PROFESSIONAL]: 2,
      [SubscriptionTier.ENTERPRISE]: 3,
      [SubscriptionTier.ULTIMATE]: 4,
    }

    const featureTierMap: Record<string, SubscriptionTier> = {
      fees: SubscriptionTier.PROFESSIONAL,
      accounting: SubscriptionTier.PROFESSIONAL,
      payroll: SubscriptionTier.ENTERPRISE,
      loc: SubscriptionTier.ENTERPRISE,
      social: SubscriptionTier.ENTERPRISE,
      gamification: SubscriptionTier.ULTIMATE,
      advancedAnalytics: SubscriptionTier.ULTIMATE,
    }

    const requiredTier = featureTierMap[feature]
    if (!requiredTier) return true // No restriction

    return tierHierarchy[school.subscription.tier] >= tierHierarchy[requiredTier]
  }
}
