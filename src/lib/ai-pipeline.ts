// ============================================================
// AI Pipeline — LLM Integration, Vision Engine, OCR Simulator
// Core intelligence layer for the Medical Co-Pilot
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';

// ── Types ────────────────────────────────────────────────────
export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConsultationResult {
  response: string;
  labMarkers: LabMarker[];
  radiologyFindings: RadiologyFinding[];
  urgencyFlag: 'normal' | 'elevated' | 'urgent' | 'critical';
  recommendedSpecialty: string | null;
  gradCamData: GradCamData | null;
  clinicalView: ClinicalViewData | null;
  patientView: PatientViewData | null;
}

export interface LabMarker {
  name: string;
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  status: 'low' | 'normal' | 'high' | 'critical';
}

export interface RadiologyFinding {
  term: string;
  definition: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface GradCamData {
  imageUrl: string;
  heatmapCoords: { x: number; y: number; width: number; height: number; intensity: number }[];
  classification: string;
  confidence: number;
}

export interface ClinicalViewData {
  summary: string;
  metrics: { name: string; value: string; reference: string; flag: string }[];
  latinTerms: string[];
  rawFindings: string;
}

export interface PatientViewData {
  summary: string;
  analogies: string[];
  urgencyLevel: string;
  recommendedAction: string;
  safetyNote: string;
  targetSpecialty: string;
}

// ── Simulated OCR Engine ────────────────────────────────────
export function simulateOCR(fileName: string): string {
  const isLabReport = fileName.toLowerCase().includes('lab') || fileName.toLowerCase().includes('blood');
  const isRadiology = fileName.toLowerCase().includes('mri') || fileName.toLowerCase().includes('ct') || fileName.toLowerCase().includes('xray');
  const isPathology = fileName.toLowerCase().includes('pathology') || fileName.toLowerCase().includes('biopsy');

  if (isLabReport) {
    return `
COMPLETE BLOOD COUNT (CBC)
─────────────────────────────────────
Hemoglobin:        10.2 g/dL     (Ref: 12.0 - 16.0)   LOW
WBC Count:         14.5 x10³/µL  (Ref: 4.5 - 11.0)    HIGH
RBC Count:         3.8 x10⁶/µL   (Ref: 4.0 - 5.5)     LOW
Platelet Count:    180 x10³/µL   (Ref: 150 - 400)      NORMAL
MCV:               78 fL         (Ref: 80 - 100)       LOW
MCH:               25 pg         (Ref: 27 - 33)        LOW
ESR:               45 mm/hr      (Ref: 0 - 20)         HIGH

COMPREHENSIVE METABOLIC PANEL
─────────────────────────────────────
Glucose:           105 mg/dL     (Ref: 70 - 100)       ELEVATED
Creatinine:        1.8 mg/dL     (Ref: 0.6 - 1.2)      HIGH
BUN:               28 mg/dL      (Ref: 7 - 20)         HIGH
Sodium:            140 mEq/L     (Ref: 136 - 145)      NORMAL
Potassium:         4.2 mEq/L     (Ref: 3.5 - 5.0)     NORMAL
ALT:               55 U/L        (Ref: 7 - 56)         NORMAL
AST:               48 U/L        (Ref: 10 - 40)        ELEVATED

LIPID PANEL
─────────────────────────────────────
Total Cholesterol: 245 mg/dL     (Ref: < 200)          HIGH
HDL:               35 mg/dL      (Ref: > 40)           LOW
LDL:               165 mg/dL     (Ref: < 100)          HIGH
Triglycerides:     220 mg/dL     (Ref: < 150)          HIGH
    `.trim();
  }

  if (isRadiology) {
    return `
MRI BRAIN WITH CONTRAST
─────────────────────────────────────
CLINICAL INDICATION: Headaches, visual disturbances

FINDINGS:
- A 1.8 cm well-circumscribed lesion is identified in the right frontal lobe
  with associated perilesional edema
- Mild midline shift of approximately 2mm to the left
- Ventricular system is within normal limits
- No evidence of acute hemorrhage or infarction
- Mucosal thickening noted in bilateral maxillary sinuses

IMPRESSION:
1. Right frontal lobe lesion with surrounding edema — neoplastic etiology
   cannot be excluded. Recommend neurosurgical consultation and biopsy.
2. Mild midline shift secondary to mass effect
3. Bilateral maxillary sinus mucosal thickening — likely chronic sinusitis
    `.trim();
  }

  if (isPathology) {
    return `
SKIN LESION BIOPSY — LEFT FOREARM
─────────────────────────────────────
SPECIMEN: Shave biopsy, left forearm
CLINICAL HISTORY: Irregular pigmented lesion, 6mm diameter

MICROSCOPIC DESCRIPTION:
- Sections show an asymmetric melanocytic proliferation
- Nests of atypical melanocytes present at the dermoepidermal junction
- Moderate cytologic atypia with occasional mitotic figures (1/mm²)
- Pagetoid spread noted in the lower epidermis
- Breslow thickness: 0.8 mm
- Clark Level: III
- Margins: Positive at lateral aspect

DIAGNOSIS:
Superficial spreading melanoma, Breslow 0.8mm, Clark Level III,
with positive lateral margins. Recommend wide local excision.
    `.trim();
  }

  // Default general report
  return `
GENERAL MEDICAL REPORT
─────────────────────────────────────
Patient presents with complaints of persistent fatigue,
intermittent headaches, and unexplained weight loss over
the past 3 months. Family history notable for hypertension
and Type 2 Diabetes. Current medications: Lisinopril 10mg daily.

VITAL SIGNS:
- Blood Pressure: 148/92 mmHg (ELEVATED)
- Heart Rate: 88 bpm (Normal)
- Temperature: 37.1°C (Normal)
- Respiratory Rate: 18/min (Normal)
- SpO2: 97% (Normal)

ASSESSMENT:
1. Uncontrolled hypertension — consider medication adjustment
2. Fatigue workup recommended: CBC, TSH, Iron Studies
3. Weight loss evaluation: Consider metabolic panel and imaging
    `.trim();
  }

// ── Simulated Vision/Lesion Engine (Grad-CAM) ──────────────
export function simulateVisionEngine(imageType: string): GradCamData {
  const classifications: Record<string, { classification: string; confidence: number }> = {
    'skin': { classification: 'Suspected Melanocytic Nevus — Differential: Melanoma vs. Atypical Nevus', confidence: 0.82 },
    'rash': { classification: 'Erythematous Papular Eruption — Consider: Contact Dermatitis vs. Drug Reaction', confidence: 0.75 },
    'lesion': { classification: 'Irregular Pigmented Lesion — Recommend Dermatological Evaluation', confidence: 0.88 },
    'wound': { classification: 'Partial-thickness Wound — No signs of acute infection', confidence: 0.79 },
  };

  const key = Object.keys(classifications).find(k => imageType.toLowerCase().includes(k)) || 'skin';
  const result = classifications[key];

  // Generate simulated Grad-CAM heatmap coordinates
  const heatmapCoords = [];
  const gridSize = 5;
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      heatmapCoords.push({
        x: 20 + x * 12,
        y: 20 + y * 12,
        width: 12,
        height: 12,
        intensity: Math.random() * 0.8 + 0.2, // Random intensity 0.2-1.0
      });
    }
  }
  // Make center area hotter (realistic for lesion focus)
  heatmapCoords[12].intensity = 0.95;
  heatmapCoords[13].intensity = 0.98;
  heatmapCoords[17].intensity = 0.92;
  heatmapCoords[18].intensity = 0.96;

  return {
    imageUrl: '/placeholder-lesion.jpg',
    heatmapCoords,
    classification: result.classification,
    confidence: result.confidence,
  };
}

// ── Parse Lab Markers from OCR Text ─────────────────────────
export function parseLabMarkers(ocrText: string): LabMarker[] {
  const markers: LabMarker[] = [];

  // Regex patterns for lab values
  const labPattern = /([A-Za-z\s\/%]+?):\s+([\d.]+)\s+([a-zA-Z\/µ³%]+)\s+\(Ref:\s*([\d.]+)\s*[-–]\s*([\d.]+)\)\s*(\w+)/g;
  let match;

  while ((match = labPattern.exec(ocrText)) !== null) {
    const name = match[1].trim();
    const value = parseFloat(match[2]);
    const unit = match[3].trim();
    const refLow = parseFloat(match[4]);
    const refHigh = parseFloat(match[5]);
    const statusText = match[6].trim().toUpperCase();

    let status: LabMarker['status'] = 'normal';
    if (statusText.includes('HIGH') || statusText.includes('ELEVATED')) {
      status = value > refHigh * 1.3 ? 'critical' : 'high';
    } else if (statusText.includes('LOW')) {
      status = value < refLow * 0.7 ? 'critical' : 'low';
    }

    markers.push({ name, value, unit, refLow, refHigh, status });
  }

  return markers;
}

// ── Generate System Prompt for AI Doctor ─────────────────────
function buildMedicalSystemPrompt(context?: string): string {
  return `You are an elite Virtual Physician assistant for the Universal Medical Co-Pilot platform. Your role is to:

1. INTERPRET and TRANSLATE medical terminology into plain, empathetic language
2. Ask PROACTIVE, CONTEXT-AWARE probing questions (e.g., if a user mentions headaches, ask about localized pain, vision changes, duration, and triggers)
3. EDUCATE patients about their lab results, imaging findings, and conditions
4. TRIAGE patients to the appropriate medical specialist when needed

CRITICAL HEALTH GUARDRAILS — You MUST follow these rules:
- NEVER prescribe specific medication dosages
- NEVER claim a 100% definitive diagnosis
- ALWAYS remind patients this is an educational tool, not a substitute for professional medical care
- ALWAYS interpret, translate, educate, and triage — never diagnose definitively
- If findings suggest urgency, clearly recommend seeking immediate medical attention

${context ? `\nCurrent conversation context:\n${context}\n` : ''}

Respond with empathy, clarity, and medical accuracy. Use analogies to explain complex concepts.`;
}

// ── LLM Chat Integration ────────────────────────────────────
export async function generateAIChatResponse(
  messages: AIChatMessage[],
  context?: string
): Promise<string> {
  try {
    const zai = await ZAI.create();

    const systemPrompt = buildMedicalSystemPrompt(context);

    const formattedMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const completion = await zai.chat.completions.create({
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || 'I apologize, I was unable to process your request. Please try again.';
  } catch (error) {
    console.error('[AI Pipeline] LLM Error:', error);
    // Fallback response when API is unavailable
    return generateFallbackResponse(messages);
  }
}

// ── Fallback Response Generator ─────────────────────────────
function generateFallbackResponse(messages: AIChatMessage[]): string {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userText = lastUserMessage?.content?.toLowerCase() || '';

  if (userText.includes('headache')) {
    return "I understand you're experiencing headaches. To help me better assess your situation, could you tell me:\n\n1. **Where exactly** is the pain located? (front, back, one side, or all over)\n2. **How long** have you been having these headaches?\n3. Have you noticed any **vision changes**, nausea, or sensitivity to light?\n4. What **triggers** seem to bring on the headaches?\n\n⚠️ *This is educational guidance only — please consult a healthcare professional for a proper diagnosis.*";
  }

  if (userText.includes('fatigue') || userText.includes('tired')) {
    return "I hear you — persistent fatigue can significantly impact your quality of life. Let me ask a few follow-up questions:\n\n1. How long have you been feeling this fatigue? Is it **constant or intermittent**?\n2. Have you noticed any **unexplained weight changes**?\n3. How is your **sleep quality** — are you getting 7-8 hours?\n4. Do you have any family history of **thyroid conditions or anemia**?\n\n⚠️ *This information is for educational purposes. Please see a doctor for proper evaluation.*";
  }

  return "Thank you for sharing that with me. I'd like to understand your situation better so I can provide the most helpful information.\n\nCould you tell me:\n1. **What specific symptoms** are you experiencing?\n2. **How long** have you been noticing these changes?\n3. Have you had any **recent lab tests or imaging** done?\n4. Is there anything that **makes it better or worse**?\n\n⚠️ *Remember: I'm an educational tool, not a replacement for professional medical advice. Always consult your doctor for diagnosis and treatment.*";
}

// ── Generate Dual-View Report Translation ────────────────────
export async function generateReportTranslation(
  ocrText: string,
  labMarkers: LabMarker[],
): Promise<{ clinicalView: ClinicalViewData; patientView: PatientViewData }> {
  // Build clinical view (for doctors)
  const clinicalMetrics = labMarkers.map(m => ({
    name: m.name,
    value: `${m.value} ${m.unit}`,
    reference: `${m.refLow} - ${m.refHigh} ${m.unit}`,
    flag: m.status === 'normal' ? 'N' : m.status === 'high' ? 'H' : m.status === 'low' ? 'L' : 'C',
  }));

  const latinTerms = ocrText.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g)?.filter(
    t => t.length > 5 && t !== ocrText
  )?.slice(0, 10) || [];

  const clinicalView: ClinicalViewData = {
    summary: `Patient presents with ${labMarkers.filter(m => m.status !== 'normal').length} abnormal lab markers out of ${labMarkers.length} total.`,
    metrics: clinicalMetrics,
    latinTerms: [...new Set(latinTerms)],
    rawFindings: ocrText,
  };

  // Build patient view (for non-technical users)
  const abnormalMarkers = labMarkers.filter(m => m.status !== 'normal');
  const hasCritical = labMarkers.some(m => m.status === 'critical');
  const hasHigh = labMarkers.some(m => m.status === 'high' || m.status === 'low');

  const analogies = abnormalMarkers.map(m => {
    if (m.name.includes('Hemoglobin')) return 'Your oxygen delivery system is running below capacity — like a delivery fleet with too few trucks.';
    if (m.name.includes('WBC')) return 'Your immune system appears activated — like extra soldiers deployed to fight a potential threat.';
    if (m.name.includes('Glucose')) return 'Your blood sugar is above the ideal range — like having too much fuel in the tank.';
    if (m.name.includes('Creatinine')) return 'Your kidneys may not be filtering waste as efficiently — like a clogged water filter.';
    if (m.name.includes('Cholesterol') || m.name.includes('LDL')) return 'Your blood vessels may have more fatty deposits than ideal — like buildup in a water pipe.';
    return `Your ${m.name} reading is ${m.status} compared to the normal range.`;
  });

  let urgencyLevel = 'Normal';
  let recommendedAction = 'Continue routine health monitoring with your primary care physician.';
  let targetSpecialty = 'Primary Care';

  if (hasCritical) {
    urgencyLevel = 'Urgent';
    recommendedAction = 'Please seek medical attention promptly. Your results show values that need immediate professional review.';
    targetSpecialty = 'Emergency Medicine / Specialist Referral';
  } else if (hasHigh) {
    urgencyLevel = 'Elevated';
    recommendedAction = 'Schedule an appointment with your doctor within the next 1-2 weeks to discuss these findings.';
    targetSpecialty = 'Internal Medicine';
  }

  const patientView: PatientViewData = {
    summary: `Out of ${labMarkers.length} tests, ${abnormalMarkers.length} showed results outside the normal range. ${hasCritical ? 'Some results need urgent attention.' : hasHigh ? 'Some results should be reviewed by your doctor.' : 'Your results are mostly within healthy ranges.'}`,
    analogies,
    urgencyLevel,
    recommendedAction,
    safetyNote: 'This report is for educational purposes only. It does not constitute a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation and treatment.',
    targetSpecialty,
  };

  return { clinicalView, patientView };
}
