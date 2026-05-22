// ============================================================
// GET /api/chat — Fetch Chat Sessions
// POST /api/chat — Send chat message (uses server AI module)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractBearerToken, verifyAccessToken, sanitizeInput, checkRateLimit, hasRole } from '@/lib/auth';
import { generateAIChatResponse } from '@/lib/ai-pipeline-server';
import { getSymptomProfile } from '@/lib/ai-pipeline-client';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const sessions = await db.chatSession.findMany({
      where: { userId: decoded.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[Chat] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`chat:${clientIp}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (!hasRole(decoded, ['admin', 'doctor', 'patient'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { message, sessionId, symptomId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const sanitizedMessage = sanitizeInput(message);
    const symptomProfile = symptomId ? getSymptomProfile(symptomId) : null;

    let session;
    if (sessionId) {
      session = await db.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!session || session.userId !== decoded.userId) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    }

    if (!session) {
      session = await db.chatSession.create({
        data: {
          userId: decoded.userId,
          title: sanitizedMessage.slice(0, 50) + (sanitizedMessage.length > 50 ? '...' : ''),
          metadata: JSON.stringify({ mode: 'consultation', symptomId: symptomProfile?.id || null }),
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    await db.chatMessage.create({
      data: { sessionId: session.id, role: 'user', content: sanitizedMessage, messageType: 'text' },
    });

    const chatHistory = session.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const aiResponse = await generateAIChatResponse(
      [...chatHistory, { role: 'user' as const, content: sanitizedMessage }],
      session.contextSummary || undefined,
      symptomProfile || undefined,
    );

    await db.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: aiResponse,
        messageType: 'text',
        metadata: JSON.stringify({ model: 'virtual-physician', symptomContext: symptomProfile?.id || null }),
      },
    });

    return NextResponse.json({ sessionId: session.id, aiResponse });
  } catch (error) {
    console.error('[Chat] POST Error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
