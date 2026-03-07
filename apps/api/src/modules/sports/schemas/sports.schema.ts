import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Sports Team ─────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'sports_teams' })
export class SportsTeam {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  sport: string

  @Prop({ enum: ['MALE', 'FEMALE', 'MIXED'], required: true })
  gender: string

  @Prop()
  ageGroup?: string // U12, U15, U18, Senior

  @Prop({ type: Types.ObjectId, ref: 'User' })
  coachId?: Types.ObjectId

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  assistantCoachIds: Types.ObjectId[]

  @Prop({ type: [Types.ObjectId], ref: 'Student', default: [] })
  playerIds: Types.ObjectId[]

  @Prop({
    type: [
      {
        studentId: { type: Types.ObjectId, ref: 'Student' },
        jerseyNumber: Number,
        position: String,
        isCaptain: { type: Boolean, default: false },
        joinDate: Date,
      },
    ],
    default: [],
  })
  roster: {
    studentId: Types.ObjectId
    jerseyNumber?: number
    position?: string
    isCaptain: boolean
    joinDate: Date
  }[]

  @Prop()
  trainingDay?: string[]

  @Prop()
  trainingTime?: string

  @Prop()
  trainingVenue?: string

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: [String], default: [] })
  achievements: string[]
}

export const SportsTeamSchema = SchemaFactory.createForClass(SportsTeam)

// ─── Match Fixture ───────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'match_fixtures' })
export class MatchFixture {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  sport: string

  @Prop({ type: Types.ObjectId, ref: 'SportsTeam', required: true })
  homeTeamId: Types.ObjectId

  @Prop()
  awayTeamName: string

  @Prop({ type: Types.ObjectId, ref: 'SportsTeam' })
  awayTeamId?: Types.ObjectId

  @Prop({ required: true })
  matchDate: Date

  @Prop({ required: true })
  venue: string

  @Prop({ enum: ['HOME', 'AWAY', 'NEUTRAL'] })
  venueType: string

  @Prop({ enum: ['FRIENDLY', 'LEAGUE', 'CUP', 'INTER_HOUSE', 'INTER_SCHOOL'], required: true })
  competitionType: string

  @Prop()
  competitionName?: string

  @Prop()
  round?: string

  @Prop({ enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'CANCELLED'], default: 'SCHEDULED' })
  status: string

  // Result
  @Prop()
  homeScore?: number

  @Prop()
  awayScore?: number

  @Prop({ enum: ['HOME', 'AWAY', 'DRAW'] })
  result?: string

  @Prop({
    type: [
      {
        studentId: { type: Types.ObjectId, ref: 'Student' },
        eventType: { type: String, enum: ['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'POINT', 'TRY', 'RUN'] },
        minute: Number,
        description: String,
      },
    ],
    default: [],
  })
  events: {
    studentId: Types.ObjectId
    eventType: string
    minute?: number
    description?: string
  }[]

  @Prop({ type: Types.ObjectId, ref: 'Student' })
  manOfMatchId?: Types.ObjectId

  @Prop({ type: [Types.ObjectId], ref: 'Student', default: [] })
  selectedPlayers: Types.ObjectId[]

  @Prop()
  matchReport?: string

  @Prop({ type: [String], default: [] })
  photoUrls: string[]
}

export const MatchFixtureSchema = SchemaFactory.createForClass(MatchFixture)
MatchFixtureSchema.index({ schoolId: 1, matchDate: -1 })

// ─── Inter-House Competition ─────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'houses' })
export class House {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  color: string

  @Prop()
  motto?: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  houseMasterId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student' })
  captainId?: Types.ObjectId

  @Prop({ default: 0 })
  totalPoints: number

  @Prop({ type: [Types.ObjectId], ref: 'Student', default: [] })
  memberIds: Types.ObjectId[]
}

export const HouseSchema = SchemaFactory.createForClass(House)

// ─── Inter-House Points Log ──────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'house_points' })
export class HousePoints {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'House', required: true, index: true })
  houseId: Types.ObjectId

  @Prop({ required: true })
  points: number

  @Prop({ required: true })
  event: string

  @Prop()
  sport?: string

  @Prop()
  position?: number // 1st, 2nd, 3rd

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  awardedById: Types.ObjectId

  @Prop()
  academicTerm?: string

  @Prop()
  notes?: string
}

export const HousePointsSchema = SchemaFactory.createForClass(HousePoints)

// ─── Sports Equipment Inventory ──────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'sports_equipment' })
export class SportsEquipment {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  sport: string

  @Prop({ required: true, default: 0 })
  totalQuantity: number

  @Prop({ default: 0 })
  availableQuantity: number

  @Prop({ enum: ['GOOD', 'FAIR', 'POOR', 'DECOMMISSIONED'], default: 'GOOD' })
  condition: string

  @Prop()
  lastInspectionDate?: Date

  @Prop()
  notes?: string
}

export const SportsEquipmentSchema = SchemaFactory.createForClass(SportsEquipment)
