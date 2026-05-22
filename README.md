# 🏥 Universal Medical Co-Pilot & Report Translator

> **المساعد الطبي الشامل** — جسر ذكي بين المصطلحات الطبية المعقدة والمريض العادي

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2d3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🌟 Overview

**Universal Medical Co-Pilot** is a production-ready, enterprise-grade SaaS platform that acts as an intelligent bridge between complex medical terminology and ordinary patients. Powered by AI, it provides:

- 🩺 **Virtual Doctor Chat** — Context-aware medical consultation with SOAP protocol
- 📋 **Report Translator** — Dual-view medical report analysis (Clinical + Patient)
- 🔬 **Vision-Lesion Engine** — CNN-based skin lesion classification with Grad-CAM heatmaps
- 📊 **Lab Marker Gauges** — Interactive visual gauges for blood work results
- 📖 **Medical Glossary** — 25+ jargon-to-plain-language tooltips
- 🔒 **Enterprise Security** — AES-256 encryption, JWT RBAC, rate limiting

⚠️ **Health Guardrail**: This system NEVER prescribes medication dosages or claims 100% definitive diagnosis. It is an educational and guidance tool only.

---

## 🚀 Features

### 1. AI Doctor Chat (العيادة)
- Full SOAP protocol (Subjective → Objective → Assessment → Plan)
- Progressive differential diagnosis with context-aware probing
- Red flag detection with emergency warnings
- Arabic-first interface with Egyptian dialect support
- Symptom checker with body-part mapping
- Multi-turn conversation with medical context memory

### 2. Multimodal Report Ingestion
- **Text input** — Direct symptom description
- **PDF upload** — OCR-based extraction (Tesseract.js)
- **Image upload** — Vision engine for skin lesions, X-rays
- **Lab result parsing** — Automatic marker extraction and range comparison

### 3. Dual-View Report Translator
- **Clinical View** — For healthcare professionals (detailed, technical)
- **Patient View** — Simplified with analogies, gauges, and plain language
- Interactive horizontal gauges (Red/Amber/Green ranges)
- Urgency badges: Normal → Elevated → Urgent → Critical
- Glossary tooltips with wavy underline detection

### 4. Vision-Lesion Engine
- Simulated EfficientNet-B4 CNN classifier
- Grad-CAM heatmap overlay for explainable AI (XAI)
- Confidence scoring and classification labels
- Supports dermatology and radiology images

### 5. Security & Compliance
- **AES-256** encryption at rest for uploaded files
- **JWT** access/refresh token rotation with RBAC (Admin/Doctor/Patient)
- **Rate limiting** — Token bucket (30 req/min default)
- **XSS prevention** — HTML sanitization on all inputs
- **NoSQL injection prevention** — Key sanitization
- **Secure file purge** — Overwrite + delete after processing

### 6. Real-Time Streaming
- WebSocket service on port 3003
- 7-step pipeline progress streaming
- Token-by-token chat streaming
- Live status updates for report processing

---

## 📁 Project Structure

```
universal-medical-copilot/
├── prisma/
│   └── schema.prisma              # Database schema (User, ChatSession, ChatMessage, MedicalReport)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Main entry point
│   │   ├── globals.css            # Global styles
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts   # User registration
│   │       │   ├── login/route.ts      # Login with JWT
│   │       │   └── refresh/route.ts    # Token rotation
│   │       ├── chat/route.ts           # AI chat endpoint
│   │       ├── consult/route.ts        # Multimodal consultation
│   │       └── reports/route.ts        # Report fetching
│   ├── components/
│   │   ├── medical/
│   │   │   ├── MedicalDashboard.tsx    # Main shell + sidebar
│   │   │   ├── MedicalChat.tsx         # Doctor chat interface
│   │   │   ├── PatientReportViewer.tsx # Dual-view report display
│   │   │   ├── MedicalGauge.tsx        # Lab marker gauge slider
│   │   │   ├── MedicalGlossaryTooltip.tsx # Jargon hover tooltips
│   │   │   ├── UrgencyBadge.tsx        # Color-coded urgency level
│   │   │   ├── GradCamOverlay.tsx      # XAI heatmap visualization
│   │   │   ├── ProgressStreamer.tsx    # Real-time pipeline progress
│   │   │   ├── ChatBubble.tsx          # Message bubble component
│   │   │   ├── SymptomChecker.tsx      # Symptom selection tool
│   │   │   └── AuthForm.tsx            # Login/Register form
│   │   └── ui/                         # shadcn/ui components
│   ├── lib/
│   │   ├── ai-pipeline-server.ts      # AI/LLM integration (server-only)
│   │   ├── ai-pipeline-client.ts      # Client-side pipeline types
│   │   ├── medical-glossary.ts        # 25+ medical term definitions
│   │   ├── auth.ts                    # JWT + bcrypt utilities
│   │   ├── encryption.ts              # AES-256 file encryption
│   │   ├── db.ts                      # Prisma client singleton
│   │   └── utils.ts                   # Utility functions
│   ├── stores/
│   │   └── medical-store.ts           # Zustand global state
│   └── hooks/
│       ├── use-websocket.ts           # WebSocket connection hook
│       ├── use-toast.ts               # Toast notifications
│       └── use-mobile.ts              # Mobile detection
├── mini-services/
│   └── medical-ws/
│       └── index.ts                   # WebSocket service (port 3003)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| **State** | Zustand 5 |
| **Backend** | Next.js API Routes (App Router) |
| **Database** | Prisma 6 + SQLite |
| **AI/LLM** | z-ai-web-dev-sdk (GLM) |
| **Auth** | JWT (jsonwebtoken) + bcrypt |
| **Encryption** | AES-256 (Web Crypto API) |
| **Real-time** | WebSocket (ws + socket.io-client) |
| **Icons** | Lucide React |
| **Language** | TypeScript 5 |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/universal-medical-copilot.git
cd universal-medical-copilot

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database
bun run db:push
bun run db:generate

# Start the development server
bun run dev
```

The app will be available at **http://localhost:3000**

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
ENCRYPTION_KEY="your-aes-256-encryption-key"
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (Admin/Doctor/Patient) |
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/refresh` | Refresh access token |

### Medical
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | AI doctor chat conversation |
| POST | `/api/consult` | Multimodal consultation (text/PDF/image) |
| GET | `/api/reports` | Get user's medical reports |

### WebSocket
| Event | Description |
|-------|-------------|
| `join_session` | Join a chat session |
| `send_message` | Send a chat message |
| `stream_token` | Receive token-by-token AI response |
| `pipeline_progress` | Report processing progress |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                    Frontend                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Doctor   │ │  Report  │ │   Dashboard &    │ │
│  │   Chat    │ │  Viewer  │ │    Analytics     │ │
│  └─────┬────┘ └─────┬────┘ └────────┬─────────┘ │
│        └──────┬──────┘              │            │
│         Zustand Store + WebSocket   │            │
└───────────────┬─────────────────────┘            │
                │                                   │
┌───────────────┴─────────────────────────────────┐│
│              Next.js API Routes                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ││
│  │ Auth │ │ Chat │ │Consult│ │Report│ │  WS  │ ││
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ ││
└─────┼────────┼────────┼────────┼────────┼──────┘│
      │        │        │        │        │        │
┌─────┴────────┴────────┴────────┴────────┴───────┐│
│           Security & AI Pipeline                  │
│  ┌──────────┐ ┌────────┐ ┌───────────────────┐  ││
│  │ JWT/RBAC │ │ AES-256│ │  AI Doctor Engine  │  ││
│  │ Rate Lim │ │ XSS/   │ │  OCR → Lab Parser  │  ││
│  │ NoSQL San│ │ Sanitize│ │  Vision → GradCAM │  ││
│  └──────────┘ └────────┘ └───────────────────┘  ││
└──────────────────────┬──────────────────────────┘│
                       │                            │
┌──────────────────────┴──────────────────────────┐│
│           Prisma + SQLite Database               │
│  User │ ChatSession │ ChatMessage │ MedicalReport│
└─────────────────────────────────────────────────┘
```

---

## 🔒 Security Model

1. **Authentication**: JWT access tokens (15min) + refresh tokens (7d) with rotation
2. **Authorization**: Role-based access (Admin > Doctor > Patient)
3. **Encryption**: AES-256-GCM for file uploads, keys per-user in database
4. **Rate Limiting**: Token bucket algorithm, 30 requests/minute
5. **Input Sanitization**: XSS prevention, NoSQL injection protection
6. **File Security**: Encrypted upload → process → overwrite → delete
7. **Health Guardrails**: Never prescribes, never claims definitive diagnosis

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ⚠️ Disclaimer

This platform is an **educational and guidance tool only**. It does NOT:
- Prescribe medication dosages
- Provide 100% definitive diagnoses
- Replace professional medical consultation

**Always consult a qualified healthcare provider for medical decisions.**

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for better healthcare communication
</p>
