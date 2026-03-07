# EduSuite 2.0 — Complete Multi-Branch School Management Ecosystem

> **Stack:** Next.js 15 · NestJS 11 · Expo SDK 52 · MongoDB · Redis · WebRTC (Mediasoup) · Cloudinary · OpenAI

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     MONOREPO (Turborepo)                 │
├─────────────────────────────────────────────────────────┤
│  apps/                                                   │
│  ├── web/          → Next.js 15 (All user dashboards)   │
│  ├── api/          → NestJS 11 (REST + GraphQL + WS)    │
│  └── mobile/       → Expo SDK 52 (iOS + Android)        │
│  packages/                                               │
│  └── shared-types/ → TypeScript types across all apps   │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web Frontend** | Next.js 15 (App Router) | SSR, RSC, Server Actions |
| **Mobile** | Expo SDK 52 + Expo Router | iOS & Android native apps |
| **Backend** | NestJS 11 (Monorepo) | REST API + GraphQL + WebSockets |
| **Database** | MongoDB 8 + Mongoose | All data storage |
| **Cache** | Redis 7 | Sessions, queues, real-time |
| **Queue** | RabbitMQ + Bull | Async jobs, notifications |
| **File Storage** | **Cloudinary** | Images, videos, documents |
| **Video** | WebRTC + Mediasoup SFU | Live classes (custom Zoom) |
| **AI** | OpenAI GPT-4o + TensorFlow.js | Grading, proctoring, predictions |
| **Payments** | Paystack + Flutterwave | School fees & payroll |
| **Notifications** | Firebase + Twilio + Nodemailer | Push, SMS, Email |
| **Containerization** | Docker + Kubernetes | Deployment & scaling |
| **CI/CD** | GitHub Actions | Test, build, deploy |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- MongoDB Atlas account (or local Docker)
- Cloudinary account (free tier works)

### 1. Clone & install
```bash
git clone https://github.com/your-org/edusuite.git
cd edusuite
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start infrastructure (Docker)
```bash
npm run docker:dev
# Starts: MongoDB, Redis, RabbitMQ
# Optional tools: npm run docker:dev -- --profile dev-tools
```

### 4. Run all apps
```bash
npm run dev
# Runs all apps in parallel via Turborepo
```

### 5. Access the apps
| App | URL |
|-----|-----|
| Web Dashboard | http://localhost:3000 |
| API (REST) | http://localhost:4000/api/v1 |
| API Docs (Swagger) | http://localhost:4000/api/docs |
| GraphQL Playground | http://localhost:4000/graphql |
| MongoDB Express | http://localhost:8081 |
| Redis Commander | http://localhost:8082 |
| RabbitMQ Console | http://localhost:15672 |
| MailHog (Email) | http://localhost:8025 |

---

## 📁 Project Structure

```
edusuite/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # JWT + Refresh tokens + OTP
│   │       │   ├── users/      # User management
│   │       │   ├── schools/    # Multi-school/branch
│   │       │   ├── students/   # Student profiles + gamification
│   │       │   ├── teachers/   # Teacher management
│   │       │   ├── parents/    # Parent portal
│   │       │   ├── academic/   # Classes, subjects, timetables
│   │       │   ├── attendance/ # Face-verified attendance
│   │       │   ├── financial/  # Fees, salary, payroll
│   │       │   ├── hr/         # Leave management
│   │       │   ├── exams/      # Exams + AI grading
│   │       │   ├── assignments/# Assignments + submissions
│   │       │   ├── live-class/ # WebRTC (Mediasoup SFU)
│   │       │   ├── social/     # Social feed + groups
│   │       │   ├── notifications/ # Push + Email + SMS
│   │       │   ├── ai/         # AI service (GPT-4o + TF.js)
│   │       │   ├── library/    # Library management
│   │       │   ├── transport/  # Transport routes
│   │       │   └── dashboard/  # Analytics & stats
│   │       └── common/         # Guards, filters, interceptors
│   │
│   ├── web/                    # Next.js 15 Web App
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/     # Login, Register, Forgot password
│   │       │   └── (dashboard)/
│   │       │       ├── admin/   # School admin dashboard
│   │       │       ├── teacher/ # Teacher dashboard
│   │       │       ├── student/ # Student portal
│   │       │       └── parent/  # Parent portal
│   │       ├── components/     # Reusable UI components
│   │       ├── lib/
│   │       │   ├── api/        # Axios client with token refresh
│   │       │   ├── webrtc/     # Mediasoup-client wrapper
│   │       │   └── graphql/    # Apollo client
│   │       └── stores/         # Zustand state management
│   │
│   └── mobile/                 # Expo React Native
│       └── src/
│           ├── app/            # Expo Router (file-based routing)
│           │   ├── (auth)/
│           │   ├── (teacher)/
│           │   ├── (student)/
│           │   └── (parent)/
│           ├── services/
│           │   ├── notifications/  # Expo Notifications
│           │   └── api/            # Shared API client
│           └── stores/             # Zustand + MMKV
│
├── packages/
│   └── shared-types/           # TypeScript types (all apps)
│
├── docker/
│   ├── docker-compose.dev.yml  # Dev infrastructure
│   └── init/mongo-init.js      # MongoDB init script
│
└── k8s/                        # Kubernetes manifests
```

---

## 🌟 Key Features

### 🎓 Academic Management
- Multi-branch school hierarchy
- Academic year + terms management
- Classes, subjects, timetables (AI-generated)
- Grading systems (percentage, letter, GPA)
- Report cards with AI-generated comments

### 👥 User Roles
`SUPER_ADMIN` → `SCHOOL_ADMIN` → `BRANCH_ADMIN` → `PRINCIPAL` → `TEACHER` → `STUDENT` → `PARENT`

### 📊 Attendance
- QR code scanning
- **AI face verification** (using GPT-4o Vision)
- Staff biometric attendance
- Real-time attendance analytics

### 💰 Financial Suite
- Student fee management (Paystack + Flutterwave)
- Automated fee reminders
- Salary & payroll processing
- Financial reports & receipts (PDF via Cloudinary)

### 👔 HR / Leave Management
- Multiple leave types (sick, annual, maternity, etc.)
- Leave balance tracking
- Substitute teacher assignment
- Document upload via **Cloudinary**

### 📹 Live Classes (Custom WebRTC)
- **Mediasoup SFU** — scalable, no third-party dependency
- Screen sharing, chat, raise hand, polls
- Cloud recording (stored in **Cloudinary**)
- AI proctoring with real-time alerts

### 🤖 AI Features (GPT-4o + TensorFlow.js)
- **Result Scanning** — OCR + AI grading of handwritten answers
- **Live Proctoring** — detect phones, multiple faces, suspicious activity
- **Performance Prediction** — ML-based risk assessment
- **Timetable Generation** — constraint-based AI scheduling
- **Report Card Comments** — personalized AI-written comments
- **Content Moderation** — social feed safety
- **Learning Assistant (EduBot)** — subject-specific chatbot

### 📱 Mobile Features (Expo SDK 52)
- Biometric authentication (Face ID + fingerprint)
- Push notifications (Expo Notifications + Firebase)
- Offline support (Zustand + MMKV)
- Camera attendance verification
- QR code scanning

### 🌐 Social Learning
- School social feed with content moderation
- Groups (class, subject, club)
- Gamification (XP, badges, leaderboard)

### ☁️ Cloudinary Integration
- Profile pictures (auto face-crop)
- Assignment attachments
- Exam result scans
- Proctoring screenshots
- Class recordings (video)
- Leave documents
- Signed URLs for secure access
- Client-side direct upload with signatures

---

## 🔐 Security

- JWT (15min) + Refresh Token rotation (30 days)
- Token revocation via Redis/MongoDB
- Role-Based Access Control (RBAC)
- Rate limiting (3 tiers)
- Helmet.js security headers
- Input validation with class-validator + Zod
- Data encryption at rest (MongoDB Atlas)
- CORS configuration

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 🚢 Deployment

### Docker Production
```bash
npm run docker:prod
```

### Kubernetes
```bash
npm run k8s:deploy
```

### Mobile (EAS Build)
```bash
cd apps/mobile
npm run build:android  # Android APK/AAB
npm run build:ios      # iOS IPA
```

---

## 🌍 Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy your **Cloud name**, **API Key**, and **API Secret**
3. Add to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. Create upload preset named `edusuite-uploads` in Cloudinary dashboard

---

## 📄 License

Proprietary — © 2025 EduSuite
# edusuite
