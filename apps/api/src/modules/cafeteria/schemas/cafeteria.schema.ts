import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Menu ────────────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'menu_items' })
export class MenuItem {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop()
  description?: string

  @Prop({ enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'], required: true })
  mealType: string

  @Prop({ type: [String], default: [] })
  ingredients: string[]

  @Prop()
  calories?: number

  @Prop()
  portionSize?: string

  @Prop({ default: 0 })
  costPerServing: number

  @Prop({ default: 0 })
  pricePerServing: number

  @Prop({ type: [String], default: [] })
  allergens: string[]

  @Prop({ type: [String], default: [] })
  dietaryTags: string[] // VEGETARIAN, VEGAN, HALAL, KOSHER, GLUTEN_FREE

  @Prop()
  imageUrl?: string

  @Prop({ default: true })
  isAvailable: boolean

  @Prop()
  nutritionalInfo?: {
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
  }
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem)

// ─── Weekly Menu Plan ────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'menu_plans' })
export class MenuPlan {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  weekStartDate: Date

  @Prop({ required: true })
  weekEndDate: Date

  @Prop({
    type: [
      {
        dayOfWeek: { type: Number, min: 1, max: 7 },
        date: Date,
        breakfast: [{ type: Types.ObjectId, ref: 'MenuItem' }],
        lunch: [{ type: Types.ObjectId, ref: 'MenuItem' }],
        dinner: [{ type: Types.ObjectId, ref: 'MenuItem' }],
        snack: [{ type: Types.ObjectId, ref: 'MenuItem' }],
        notes: String,
      },
    ],
    default: [],
  })
  schedule: {
    dayOfWeek: number
    date: Date
    breakfast: Types.ObjectId[]
    lunch: Types.ObjectId[]
    dinner: Types.ObjectId[]
    snack: Types.ObjectId[]
    notes?: string
  }[]

  @Prop({ enum: ['DRAFT', 'PUBLISHED', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId
}

export const MenuPlanSchema = SchemaFactory.createForClass(MenuPlan)

// ─── Meal Subscription ───────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'meal_subscriptions' })
export class MealSubscription {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Term', required: true })
  termId: Types.ObjectId

  @Prop({ default: false })
  breakfast: boolean

  @Prop({ default: true })
  lunch: boolean

  @Prop({ default: false })
  dinner: boolean

  @Prop({ default: 0 })
  balance: number // prepaid meal balance

  @Prop({ default: 0 })
  totalPaid: number

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: [String], default: [] })
  dietaryRequirements: string[]

  @Prop({ type: [String], default: [] })
  allergyAlerts: string[]
}

export const MealSubscriptionSchema = SchemaFactory.createForClass(MealSubscription)

// ─── Meal Transaction ────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'meal_transactions' })
export class MealTransaction {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'MealSubscription', required: true })
  subscriptionId: Types.ObjectId

  @Prop({ required: true })
  date: Date

  @Prop({ required: true, enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] })
  mealType: string

  @Prop({ type: [Types.ObjectId], ref: 'MenuItem', default: [] })
  itemIds: Types.ObjectId[]

  @Prop({ required: true, default: 0 })
  amount: number

  @Prop({ enum: ['DEBIT', 'CREDIT'], required: true })
  transactionType: string

  @Prop()
  balanceAfter: number

  @Prop({ enum: ['SWIPE', 'MANUAL', 'REFUND'], default: 'SWIPE' })
  method: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  processedById?: Types.ObjectId

  @Prop({ default: false })
  isSpecialMeal: boolean

  @Prop()
  notes?: string
}

export const MealTransactionSchema = SchemaFactory.createForClass(MealTransaction)
MealTransactionSchema.index({ schoolId: 1, date: -1 })
MealTransactionSchema.index({ studentId: 1, date: -1 })

// ─── Food Procurement ────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'food_procurement' })
export class FoodProcurement {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'MenuPlan', required: true })
  menuPlanId: Types.ObjectId

  @Prop({ required: true })
  weekStartDate: Date

  @Prop({
    type: [
      {
        ingredient: String,
        quantity: Number,
        unit: String,
        estimatedCost: Number,
        actualCost: Number,
        supplier: String,
        purchased: { type: Boolean, default: false },
      },
    ],
    required: true,
  })
  shoppingList: {
    ingredient: string
    quantity: number
    unit: string
    estimatedCost?: number
    actualCost?: number
    supplier?: string
    purchased: boolean
  }[]

  @Prop({ default: 0 })
  totalEstimatedCost: number

  @Prop({ default: 0 })
  totalActualCost: number

  @Prop({ enum: ['PENDING', 'APPROVED', 'PURCHASED', 'RECEIVED'], default: 'PENDING' })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedById?: Types.ObjectId
}

export const FoodProcurementSchema = SchemaFactory.createForClass(FoodProcurement)

// ─── Wastage Log ─────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'food_wastage' })
export class FoodWastage {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  date: Date

  @Prop({ required: true, enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] })
  mealType: string

  @Prop({ type: [{ menuItemId: Types.ObjectId, itemName: String, quantity: Number, unit: String, estimatedCost: Number }], required: true })
  wastedItems: { menuItemId?: Types.ObjectId; itemName: string; quantity: number; unit: string; estimatedCost?: number }[]

  @Prop({ required: true })
  totalMealsPlanned: number

  @Prop({ required: true })
  totalMealsServed: number

  @Prop()
  wastageReason?: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  loggedById: Types.ObjectId
}

export const FoodWastageSchema = SchemaFactory.createForClass(FoodWastage)
