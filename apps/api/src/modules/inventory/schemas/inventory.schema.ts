import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

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

// ─── Inventory Item ──────────────────────────────────────────────────────────

export type InventoryItemDocument = InventoryItem & Document

@Schema({ timestamps: true, collection: 'inventory_items' })
export class InventoryItem {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true, index: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop()
  description?: string

  @Prop({ required: true, unique: true })
  sku: string

  @Prop({ required: true, enum: Object.values(StoreCategory) })
  category: StoreCategory

  @Prop()
  subCategory?: string

  @Prop({ required: true, default: 0 })
  quantityInStock: number

  @Prop({ required: true, default: 0 })
  reorderLevel: number

  @Prop({ required: true })
  unit: string // pieces, kg, litres, boxes

  @Prop({ default: 0 })
  unitCostPrice: number

  @Prop({ default: 0 })
  unitSellingPrice: number // for items sold to students

  @Prop({ default: false })
  isForSale: boolean // can be sold to parents/students

  @Prop()
  supplier?: string

  @Prop()
  supplierContact?: string

  @Prop()
  expiryDate?: Date

  @Prop()
  batchNumber?: string

  @Prop()
  location?: string // shelf/rack/room

  @Prop()
  imageUrl?: string

  @Prop()
  imagePublicId?: string

  @Prop({ default: true })
  isActive: boolean

  // For uniform items
  @Prop({
    type: [
      {
        size: String,
        quantity: Number,
        gender: { type: String, enum: ['MALE', 'FEMALE', 'UNISEX'] },
      },
    ],
    default: [],
  })
  variants: { size: string; quantity: number; gender: string }[]
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem)
InventoryItemSchema.index({ schoolId: 1, category: 1, isActive: 1 })
InventoryItemSchema.index({ name: 'text', description: 'text' })

// ─── Stock Movement ──────────────────────────────────────────────────────────

export type StockMovementDocument = StockMovement & Document

@Schema({ timestamps: true, collection: 'stock_movements' })
export class StockMovement {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'InventoryItem', required: true, index: true })
  itemId: Types.ObjectId

  @Prop({ required: true, enum: ['STOCK_IN', 'STOCK_OUT', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'SALE', 'DAMAGE', 'EXPIRY'] })
  movementType: string

  @Prop({ required: true })
  quantity: number

  @Prop({ required: true })
  quantityBefore: number

  @Prop({ required: true })
  quantityAfter: number

  @Prop()
  unitCost?: number

  @Prop()
  totalCost?: number

  @Prop()
  reference?: string // PO number, requisition ID, etc.

  @Prop({ type: Types.ObjectId, ref: 'User' })
  issuedToId?: Types.ObjectId

  @Prop()
  issuedToDepartment?: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  processedById: Types.ObjectId

  @Prop()
  reason?: string

  @Prop()
  supplierInvoice?: string

  @Prop()
  deliveryNoteUrl?: string
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement)
StockMovementSchema.index({ itemId: 1, createdAt: -1 })

// ─── Requisition ─────────────────────────────────────────────────────────────

export type RequisitionDocument = Requisition & Document

@Schema({ timestamps: true, collection: 'requisitions' })
export class Requisition {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  requisitionNumber: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedById: Types.ObjectId

  @Prop()
  department?: string

  @Prop({
    type: [
      {
        itemId: { type: Types.ObjectId, ref: 'InventoryItem' },
        itemName: String,
        quantityRequested: Number,
        quantityApproved: Number,
        quantityIssued: Number,
        unit: String,
        notes: String,
      },
    ],
    required: true,
  })
  items: {
    itemId: Types.ObjectId
    itemName: string
    quantityRequested: number
    quantityApproved?: number
    quantityIssued?: number
    unit: string
    notes?: string
  }[]

  @Prop({ enum: ['PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'ISSUED', 'CANCELLED'], default: 'PENDING' })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedById?: Types.ObjectId

  @Prop()
  approvalDate?: Date

  @Prop()
  approvalComment?: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  issuedById?: Types.ObjectId

  @Prop()
  issuanceDate?: Date

  @Prop()
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  @Prop()
  purpose: string
}

export const RequisitionSchema = SchemaFactory.createForClass(Requisition)

// ─── Inventory Service ───────────────────────────────────────────────────────
