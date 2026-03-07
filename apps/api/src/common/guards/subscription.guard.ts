import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SUBSCRIPTION_FEATURE_KEY } from '../decorators/subscription-feature.decorator'

export enum SubscriptionTier {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  ULTIMATE = 'ultimate',
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  [SubscriptionTier.BASIC]: 1,
  [SubscriptionTier.PROFESSIONAL]: 2,
  [SubscriptionTier.ENTERPRISE]: 3,
  [SubscriptionTier.ULTIMATE]: 4,
}

export const FEATURE_TIER_MAP: Record<string, SubscriptionTier> = {
  // Basic tier
  attendance: SubscriptionTier.BASIC,
  timetable: SubscriptionTier.BASIC,
  messaging: SubscriptionTier.BASIC,
  // Professional tier
  fees: SubscriptionTier.PROFESSIONAL,
  accounting: SubscriptionTier.PROFESSIONAL,
  reportCards: SubscriptionTier.PROFESSIONAL,
  // Enterprise tier
  payroll: SubscriptionTier.ENTERPRISE,
  loc: SubscriptionTier.ENTERPRISE,
  social: SubscriptionTier.ENTERPRISE,
  hrAdvanced: SubscriptionTier.ENTERPRISE,
  // Ultimate tier
  gamification: SubscriptionTier.ULTIMATE,
  advancedAnalytics: SubscriptionTier.ULTIMATE,
  aiFeatures: SubscriptionTier.ULTIMATE,
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string>(SUBSCRIPTION_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredFeature) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user

    // Super admin always has access
    if (user?.role === 'super_admin') return true

    const schoolSubscriptionTier: SubscriptionTier =
      request.school?.subscriptionTier || SubscriptionTier.BASIC

    const requiredTier = FEATURE_TIER_MAP[requiredFeature]
    if (!requiredTier) return true

    const schoolLevel = TIER_HIERARCHY[schoolSubscriptionTier]
    const requiredLevel = TIER_HIERARCHY[requiredTier]

    if (schoolLevel < requiredLevel) {
      throw new ForbiddenException(
        `This feature requires ${requiredTier} subscription. Your school is on ${schoolSubscriptionTier} plan. Please upgrade to access ${requiredFeature}.`,
      )
    }

    return true
  }
}
