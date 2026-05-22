// ============================================================
// Medical Co-Pilot WebSocket Service
// Real-time streaming: progress updates, token-by-token chat
// ============================================================

import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ── Active connections and session tracking ──────────────────
interface ClientSession {
  socketId: string
  userId: string | null
  currentSessionId: string | null
}

const activeClients = new Map<string, ClientSession>()

// ── Progress Step Definitions ────────────────────────────────
interface ProgressStep {
  id: number
  label: string
  percentage: number
}

const CONSULTATION_STEPS: ProgressStep[] = [
  { id: 1, label: 'Receiving your medical data...', percentage: 10 },
  { id: 2, label: 'Extracting raw text via OCR...', percentage: 30 },
  { id: 3, label: 'Analyzing biomarkers and lab values...', percentage: 50 },
  { id: 4, label: 'Weighing visual biomarkers...', percentage: 60 },
  { id: 5, label: 'Cross-referencing medical knowledge base...', percentage: 75 },
  { id: 6, label: 'Translating medical jargon to plain language...', percentage: 90 },
  { id: 7, label: 'Generating your personalized report...', percentage: 100 },
]

// ── Simulated streaming text ─────────────────────────────────
const STREAM_RESPONSES: Record<string, string> = {
  default: `Based on the information you've shared, here's my analysis:

Your symptoms warrant careful evaluation. I'd like to ask a few follow-up questions to better understand your situation.

1. Can you describe when these symptoms first started?
2. Are there any specific triggers you've noticed?
3. Do you have any pre-existing conditions or family history I should know about?

⚠️ Remember: This is educational guidance only. Please consult a healthcare professional for a proper diagnosis.`,

  headache: `I understand you're dealing with headaches — let me help you understand what might be happening.

Headaches can arise from many causes, ranging from simple tension to more complex neurological factors. Here are the key categories:

• **Tension Headaches**: The most common type — feels like a tight band around your head, often related to stress, poor posture, or eye strain.
• **Migraine**: Often one-sided, with throbbing pain, possible nausea, and sensitivity to light/sound.
• **Cluster Headaches**: Severe, sharp pain usually around one eye, occurring in clusters.

**Follow-up Questions:**
1. Is the pain on one side or both sides of your head?
2. How would you describe the pain — throbbing, sharp, or pressing?
3. Do you experience any visual changes before or during the headache?
4. How long do these headaches typically last?

⚠️ If you experience a sudden, severe "thunderclap" headache, seek emergency care immediately.`,

  lab: `Let me break down your lab results in plain language:

**Key Findings:**
Your blood work shows several markers outside the normal range. Here's what each means:

🔴 **Hemoglobin (10.2 g/dL)** — Below normal. This means your blood has fewer oxygen-carrying cells than expected. Think of it as having too few delivery trucks on the road.

🔴 **WBC Count (14.5)** — Above normal. Your immune system is actively fighting something — like extra soldiers deployed for battle.

🟡 **Glucose (105 mg/dL)** — Slightly elevated. Your blood sugar is a bit above the ideal range.

🟢 **Platelets (180)** — Normal. Your blood clotting system is working properly.

**Recommended Action:**
I'd suggest scheduling an appointment with your primary care doctor within the next 1-2 weeks to discuss these results and determine if any follow-up testing is needed.

⚠️ This is an educational interpretation, not a medical diagnosis. Always consult your physician for clinical decisions.`,
}

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`)
  activeClients.set(socket.id, {
    socketId: socket.id,
    userId: null,
    currentSessionId: null,
  })

  // ── Authentication ──────────────────────────────────────
  socket.on('auth', (data: { userId: string }) => {
    const client = activeClients.get(socket.id)
    if (client) {
      client.userId = data.userId
      console.log(`[WS] User authenticated: ${data.userId}`)
    }
  })

  // ── Join a consultation session ─────────────────────────
  socket.on('join-session', (data: { sessionId: string }) => {
    const client = activeClients.get(socket.id)
    if (client) {
      client.currentSessionId = data.sessionId
      socket.join(`session:${data.sessionId}`)
      console.log(`[WS] Client ${socket.id} joined session: ${data.sessionId}`)
    }
  })

  // ── Start a consultation with progress streaming ────────
  socket.on('start-consultation', async (data: {
    sessionId: string
    type: 'text' | 'image' | 'pdf'
    message?: string
  }) => {
    console.log(`[WS] Consultation started: ${data.type} for session ${data.sessionId}`)
    socket.join(`session:${data.sessionId}`)

    // Step 1: Stream progress steps with delays
    for (const step of CONSULTATION_STEPS) {
      // Skip irrelevant steps for text-only
      if (data.type === 'text' && (step.id === 2 || step.id === 4)) continue

      io.to(`session:${data.sessionId}`).emit('progress', {
        step: step.id,
        label: step.label,
        percentage: step.percentage,
      })

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800))
    }

    // Step 2: Stream AI response token by token
    const responseKey = data.message?.toLowerCase().includes('headache') ? 'headache'
      : data.type !== 'text' ? 'lab'
      : 'default'

    const responseText = STREAM_RESPONSES[responseKey] || STREAM_RESPONSES.default
    const tokens = responseText.split(/(?<=\s)|(?=[.,!?;:\n])/)

    for (let i = 0; i < tokens.length; i++) {
      io.to(`session:${data.sessionId}`).emit('chat-token', {
        token: tokens[i],
        isLast: i === tokens.length - 1,
        index: i,
        total: tokens.length,
      })

      // Variable speed: faster for spaces/punctuation, slower for words
      const delay = /^[\s.,!?;:]$/.test(tokens[i]) ? 20 : 30 + Math.random() * 40
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    io.to(`session:${data.sessionId}`).emit('consultation-complete', {
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
    })
  })

  // ── Typing indicator ────────────────────────────────────
  socket.on('typing', (data: { sessionId: string; isTyping: boolean }) => {
    const client = activeClients.get(socket.id)
    if (client) {
      socket.to(`session:${data.sessionId}`).emit('user-typing', {
        userId: client.userId,
        isTyping: data.isTyping,
      })
    }
  })

  // ── Disconnect ──────────────────────────────────────────
  socket.on('disconnect', () => {
    activeClients.delete(socket.id)
    console.log(`[WS] Client disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`[WS] Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[WS] Medical WebSocket server running on port ${PORT}`)
})

// ── Graceful Shutdown ────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[WS] Received SIGTERM, shutting down...')
  httpServer.close(() => {
    console.log('[WS] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[WS] Received SIGINT, shutting down...')
  httpServer.close(() => {
    console.log('[WS] Server closed')
    process.exit(0)
  })
})
