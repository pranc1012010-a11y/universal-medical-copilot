// ============================================================
// POST /api/consult — Multi-Modal Consultation Endpoint
// Accepts text, images, PDFs; orchestrates AI pipeline
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractBearerToken, verifyAccessToken, sanitizeInput, checkRateLimit, hasRole } from '@/lib/auth';
import { simulateOCR, simulateVisionEngine, parseLabMarkers, generateReportTranslation } from '@/lib/ai-pipeline-client';
import { generateAIChatResponse } from '@/lib/ai-pipeline-server';
import { encryptBuffer, secureFilePurge } from '@/lib/encryption';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // ── Rate Limiting ────────────────────────────────────
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`consult:${clientIp}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before making another request.' },
        { status: 429 }
      );
    }

    // ── Authentication & RBAC ────────────────────────────
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please provide a valid Bearer token.' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired access token.' },
        { status: 401 }
      );
    }

    // RBAC: All authenticated roles can consult
    if (!hasRole(decoded, ['admin', 'doctor', 'patient'])) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access this resource.' },
        { status: 403 }
      );
    }

    // ── Parse Request ────────────────────────────────────
    const formData = await request.formData();
    const message = formData.get('message') as string | null;
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    const fileType = formData.get('fileType') as string | null; // 'pdf' | 'image' | null

    let ocrText: string | null = null;
    let labMarkers: Awaited<ReturnType<typeof parseLabMarkers>> = [];
    let gradCamData: Awaited<ReturnType<typeof simulateVisionEngine>> | null = null;
    let encryptedFilePath: string | null = null;
    let reportType = 'general';
    let recommendedSpecialty: string | null = null;

    // ── File Processing Pipeline ─────────────────────────
    if (file) {
      const uploadsDir = join(process.cwd(), 'tmp', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const fileName = sanitizeInput(file.name || 'uploaded-file');
      const tempPath = join(uploadsDir, `${Date.now()}-${fileName}`);

      // Write file to temporary storage
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(tempPath, buffer);

      // Encrypt file at rest
      const encrypted = encryptBuffer(buffer);
      encryptedFilePath = join(uploadsDir, `encrypted-${Date.now()}-${fileName}`);
      await writeFile(encryptedFilePath, encrypted);

      if (fileType === 'pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        // ── PDF OCR Pipeline ────────────────────────────
        reportType = 'lab';
        ocrText = simulateOCR(fileName);
        labMarkers = parseLabMarkers(ocrText);

        // Determine specialty from markers
        if (labMarkers.some(m => m.name.includes('Creatinine') || m.name.includes('BUN'))) {
          recommendedSpecialty = 'Nephrology';
        } else if (labMarkers.some(m => m.name.includes('Troponin'))) {
          recommendedSpecialty = 'Cardiology';
        } else if (labMarkers.some(m => m.name.includes('TSH'))) {
          recommendedSpecialty = 'Endocrinology';
        }
      } else if (fileType === 'image' || /\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
        // ── Vision/Lesion Pipeline ──────────────────────
        reportType = 'radiology';
        gradCamData = simulateVisionEngine(fileName);
        ocrText = `Image Analysis Results:\nClassification: ${gradCamData.classification}\nConfidence: ${(gradCamData.confidence * 100).toFixed(1)}%`;
        recommendedSpecialty = 'Dermatology';
      }

      // ── Secure File Purge — Remove raw files after extraction ──
      await secureFilePurge(tempPath);
      await secureFilePurge(encryptedFilePath);
    }

    // ── Chat Session Management ──────────────────────────
    let chatSession;
    if (sessionId) {
      chatSession = await db.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!chatSession) {
      chatSession = await db.chatSession.create({
        data: {
          userId: decoded.userId,
          title: message ? message.slice(0, 50) + '...' : 'New Consultation',
          metadata: JSON.stringify({ mode: 'consultation', specialization: recommendedSpecialty }),
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    // Save user message
    await db.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message || (file ? `Uploaded: ${file.name}` : ''),
        messageType: file ? (fileType === 'pdf' ? 'document' : 'image') : 'text',
        attachments: file ? JSON.stringify([{
          type: fileType,
          name: file.name,
          size: file.size,
        }]) : '[]',
      },
    });

    // ── AI Response Generation ───────────────────────────
    const chatHistory = chatSession.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Build enhanced message with OCR context
    let enhancedMessage = message || '';
    if (ocrText) {
      enhancedMessage += `\n\n[Medical Report Data]:\n${ocrText}`;
    }

    const aiResponse = await generateAIChatResponse(
      [...chatHistory, { role: 'user', content: enhancedMessage }],
      chatSession.contextSummary || undefined,
    );

    // Save AI response
    await db.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: aiResponse,
        messageType: 'text',
        metadata: JSON.stringify({
          model: 'virtual-physician',
          processingTime: Date.now(),
          hasFileAnalysis: !!file,
        }),
      },
    });

    // ── Generate Report if File was Analyzed ─────────────
    let medicalReport = null;
    if (file && (labMarkers.length > 0 || gradCamData)) {
      const urgencyFlag = determineUrgency(labMarkers);

      let clinicalView = null;
      let patientView = null;

      if (labMarkers.length > 0) {
        const translation = await generateReportTranslation(ocrText || '', labMarkers);
        clinicalView = translation.clinicalView;
        patientView = translation.patientView;
      }

      medicalReport = await db.medicalReport.create({
        data: {
          userId: decoded.userId,
          sessionId: chatSession.id,
          reportType,
          sourceFileName: file.name,
          rawExtractedText: ocrText,
          clinicalView: clinicalView ? JSON.stringify(clinicalView) : null,
          patientView: patientView ? JSON.stringify(patientView) : null,
          labMarkers: JSON.stringify(labMarkers),
          radiologyFindings: gradCamData ? JSON.stringify([{
            term: gradCamData.classification,
            definition: 'AI-assisted classification of visual findings',
            severity: gradCamData.confidence > 0.85 ? 'critical' : 'warning',
          }]) : '[]',
          urgencyFlag,
          recommendedSpecialty,
          glossaryTerms: JSON.stringify(extractGlossaryTerms(ocrText || '')),
          gradCamData: gradCamData ? JSON.stringify(gradCamData) : null,
          aiConfidence: gradCamData?.confidence || 0.75,
          safetyDisclaimer: true,
        },
      });
    }

    // ── Build Response ───────────────────────────────────
    return NextResponse.json({
      sessionId: chatSession.id,
      aiResponse,
      labMarkers,
      gradCamData,
      medicalReport: medicalReport ? {
        id: medicalReport.id,
        urgencyFlag: medicalReport.urgencyFlag,
        recommendedSpecialty: medicalReport.recommendedSpecialty,
        clinicalView: medicalReport.clinicalView ? JSON.parse(medicalReport.clinicalView) : null,
        patientView: medicalReport.patientView ? JSON.parse(medicalReport.patientView) : null,
      } : null,
    });

  } catch (error) {
    console.error('[Consult] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during consultation processing.' },
      { status: 500 }
    );
  }
}

// ── Helper: Determine Urgency ────────────────────────────
function determineUrgency(markers: { status: string }[]): 'normal' | 'elevated' | 'urgent' | 'critical' {
  if (markers.some(m => m.status === 'critical')) return 'critical';
  if (markers.filter(m => m.status !== 'normal').length >= 3) return 'urgent';
  if (markers.some(m => m.status !== 'normal')) return 'elevated';
  return 'normal';
}

// ── Helper: Extract Glossary Terms ───────────────────────
function extractGlossaryTerms(text: string): Record<string, string> {
  const terms: Record<string, string> = {};
  const keywordMap: Record<string, string> = {
    'hemoglobin': 'Oxygen-carrying protein in blood',
    'WBC': 'Infection-fighting blood cells',
    'RBC': 'Oxygen-transporting blood cells',
    'platelets': 'Blood clotting cells',
    'glucose': 'Blood sugar',
    'creatinine': 'Kidney function marker',
    'lesion': 'Abnormal tissue area',
    'edema': 'Fluid swelling',
    'effusion': 'Fluid buildup in body cavity',
    'stenosis': 'Abnormal narrowing',
  };

  const lowerText = text.toLowerCase();
  for (const [term, definition] of Object.entries(keywordMap)) {
    if (lowerText.includes(term.toLowerCase())) {
      terms[term] = definition;
    }
  }
  return terms;
}
