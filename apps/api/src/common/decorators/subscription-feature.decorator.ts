import { SetMetadata } from '@nestjs/common'

export const SUBSCRIPTION_FEATURE_KEY = 'subscriptionFeature'
export const RequireFeature = (feature: string) => SetMetadata(SUBSCRIPTION_FEATURE_KEY, feature)
