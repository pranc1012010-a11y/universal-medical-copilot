// ============================================================
// AI Pipeline — Client-Safe Module
// Types, Symptom Profiles, OCR, Vision Engine, Glossary
// This file is safe to import in client components (NO Node.js deps)
// ============================================================

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

// ── Clinical Protocols Data ──────────────────────────────────

export interface SymptomProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  followUpQuestions: string[];
  differentialDiagnoses: { condition: string; probability: string; redFlags: string[] }[];
  relatedSpecialties: string[];
  urgencyIfRedFlag: 'elevated' | 'urgent' | 'critical';
}

export const SYMPTOM_PROFILES: SymptomProfile[] = [
  {
    id: 'headache',
    nameAr: 'صداع',
    nameEn: 'Headache',
    icon: '🤕',
    followUpQuestions: [
      'فين بالظبت مكان الألم؟ قدام، ورا، على جنب، ولا حواليك كله؟',
      'من إمتى عندك الصداع ده؟ وإيه اللي بيخلي يزيد أو يقل؟',
      'هل الألم ده نابض (زي النبض)، ضاغط (زي الحبل)، ولا طاعن (زي الإبرة)؟',
      'هل معاه حاجة تانية؟ زي غمظة في العين، غيان، حساسية من النور، أو ضعف في حاجة؟',
      'هل جاتك كده فجأة صداع جامد جداً (أقوى صداع في حياتك)؟',
      'هل عندك حرارة أو رقبتك بتمسك؟',
    ],
    differentialDiagnoses: [
      { condition: 'صداع توتري (Tension Headache)', probability: 'High', redFlags: ['No red flags needed'] },
      { condition: 'شقيقة / مايجراين (Migraine)', probability: 'Moderate', redFlags: ['New onset after age 50', 'Visual aura >1 hour'] },
      { condition: 'صداع عنقودي (Cluster Headache)', probability: 'Low', redFlags: ['Unilateral severe periorbital pain'] },
      { condition: 'ارتفاع ضغط الدم (Hypertension)', probability: 'Moderate', redFlags: ['BP >180/120', 'Visual changes'] },
      { condition: 'نزيف تحت العنكبوتية (Subarachnoid Hemorrhage)', probability: 'Low', redFlags: ['Thunderclap headache', 'Neck stiffness'] },
      { condition: 'ورم في المخ (Brain Tumor)', probability: 'Very Low', redFlags: ['Progressive worsening', 'Morning headaches with vomiting'] },
    ],
    relatedSpecialties: ['طب الأعصاب (Neurology)', 'طب عام (General Medicine)'],
    urgencyIfRedFlag: 'critical',
  },
  {
    id: 'chest-pain',
    nameAr: 'ألم في الصدر',
    nameEn: 'Chest Pain',
    icon: '❤️‍🩹',
    followUpQuestions: [
      'وصفلي الألم: ضاغط؟ حارق؟ طاعن؟ ولا زي الوزن على الصدر؟',
      'هل الألم بيروح للذراع الشمال، الرقبة، أو الفك؟',
      'هل بيحصل مع المجهود وبيريح مع الراحة؟',
      'هل معاه ضيق نفس أو عرق بارد؟',
      'هل عندك تاريخ قلب أو ضغط أو سكر أو كوليسترول؟',
      'هل بتدخن؟ وعمرك كام؟',
    ],
    differentialDiagnoses: [
      { condition: 'ذبحة صدرية مستقرة (Stable Angina)', probability: 'High', redFlags: ['Pain at rest'] },
      { condition: 'احتشاء عضلة القلب (MI)', probability: 'Moderate', redFlags: ['Crushing pain >20min', 'Diaphoresis'] },
      { condition: 'ارتداد مرئي (GERD)', probability: 'High', redFlags: ['Worse after meals'] },
      { condition: 'تمزق الأبهر (Aortic Dissection)', probability: 'Very Low', redFlags: ['Tearing pain to back'] },
    ],
    relatedSpecialties: ['أمراض القلب (Cardiology)', 'طب الطوارئ (Emergency)'],
    urgencyIfRedFlag: 'critical',
  },
  {
    id: 'fatigue',
    nameAr: 'إرهاق وتعب',
    nameEn: 'Fatigue',
    icon: '😴',
    followUpQuestions: [
      'من إمتى وأنت حاسس بالإرهاق ده؟ هل هو مستمر ولا بييجي ويروح؟',
      'هل وزنك اختلف في الفترة الأخيرة؟',
      'هل بتنام كويس؟ كام ساعة في اليوم؟',
      'هل عندك ضيق نفس مع المجهود؟',
      'هل شعرك بيقع أو جلدك بيبقى ناشف؟',
      'هل عندك تاريخ عائلي لقصور الغدة الدرقية أو أنيميا؟',
    ],
    differentialDiagnoses: [
      { condition: 'أنيميا نقص الحديد', probability: 'High', redFlags: ['Hair loss', 'Pale skin'] },
      { condition: 'قصور الغدة الدرقية', probability: 'Moderate', redFlags: ['Weight gain', 'Cold intolerance'] },
      { condition: 'السكري نوع 2', probability: 'Moderate', redFlags: ['Polyuria', 'Polydipsia'] },
      { condition: 'اكتئاب', probability: 'Moderate', redFlags: ['Anhedonia', 'Low mood'] },
    ],
    relatedSpecialties: ['الباطنة (Internal Medicine)', 'غدد صم (Endocrinology)'],
    urgencyIfRedFlag: 'elevated',
  },
  {
    id: 'skin-lesion',
    nameAr: 'طفح جلدي / بقعة',
    nameEn: 'Skin Rash / Lesion',
    icon: '🩹',
    followUpQuestions: [
      'من إمتى ظهرت البقعة/الطفح ده؟',
      'هل فيه حكة أو ألم في المنطقة دي؟',
      'هل الطفح انتشر لأماكن تانية في الجسم؟',
      'هل استخدمت أي كريمات أو أدوية جديدة قبل ما يظهر؟',
      'هل عندك حساسية معروفة؟',
      'هل فيه حرارة أو تورم أو صديد في المنطقة؟',
    ],
    differentialDiagnoses: [
      { condition: 'التهاب جلد تماسي', probability: 'High', redFlags: ['New irritant exposure'] },
      { condition: 'أكزيما', probability: 'Moderate', redFlags: ['Atopy history'] },
      { condition: 'ملانوما', probability: 'Low', redFlags: ['ABCDE rule changes'] },
    ],
    relatedSpecialties: ['جلدية (Dermatology)', 'طب عام (General Medicine)'],
    urgencyIfRedFlag: 'urgent',
  },
  {
    id: 'abdominal-pain',
    nameAr: 'ألم في البطن',
    nameEn: 'Abdominal Pain',
    icon: '🤢',
    followUpQuestions: [
      'فين بالظبت مكان الألم في البطن؟',
      'هل الألم بيروح لمكان تاني؟',
      'إيه طبيعة الألم؟ حارق، مغص، طاعن، ولا ضاغط؟',
      'هل فيه حاجة بتخليه يزيد؟ (بعد الأكل، الحركة، التبول)',
      'هل معاه غيان أو قيء أو إسهال أو إمساك؟',
      'هل لون البراز أو البول اختلف؟',
    ],
    differentialDiagnoses: [
      { condition: 'قرحة معدة', probability: 'Moderate', redFlags: ['Black stools', 'Vomiting blood'] },
      { condition: 'التهاب الزائدة', probability: 'Moderate', redFlags: ['RLQ pain', 'Fever'] },
      { condition: 'حصوات مرارة', probability: 'Moderate', redFlags: ['RUQ pain', 'Jaundice'] },
    ],
    relatedSpecialties: ['جراحة عامة (General Surgery)', 'جهاز هضمي (GI)'],
    urgencyIfRedFlag: 'urgent',
  },
  {
    id: 'breathing',
    nameAr: 'ضيق نفس',
    nameEn: 'Shortness of Breath',
    icon: '😮‍💨',
    followUpQuestions: [
      'ضيق النفس ده بيحصل إمتى؟ مع المجهود ولا وأنت نايم؟',
      'هل بيحصل فجأة ولا تدريجياً؟',
      'هل معاه كحة؟ هل فيها بلغم أو دم؟',
      'هل بتحس بصفارة في الصدر؟',
      'هل عندك تاريخ ربو أو حساسية صدر؟',
      'هل بتدخن؟',
    ],
    differentialDiagnoses: [
      { condition: 'ربو (Asthma)', probability: 'High', redFlags: ['Not responding to inhaler'] },
      { condition: 'انسداد رئوي مزمن (COPD)', probability: 'Moderate', redFlags: ['Smoking history'] },
      { condition: 'التهاب رئوي', probability: 'Moderate', redFlags: ['Fever', 'Productive cough'] },
      { condition: 'انصمام رئوي', probability: 'Low', redFlags: ['Sudden onset', 'Leg swelling'] },
    ],
    relatedSpecialties: ['صدرية (Pulmonology)', 'قلب (Cardiology)'],
    urgencyIfRedFlag: 'critical',
  },
  {
    id: 'joint-pain',
    nameAr: 'ألم في المفاصل',
    nameEn: 'Joint Pain',
    icon: '🦴',
    followUpQuestions: [
      'أي مفصل اللي بيوجعك؟ مفصل واحد ولا أكتر؟',
      'هل المفصل متورم أو أحمر أو سخن؟',
      'هل الألم أسوأ الصبح (تيبس صباحي) ولا مع الحركة؟',
      'هل عندك حرارة مع ألم المفاصل؟',
      'هل عندك تاريخ نقرس أو روماتيزم في العائلة؟',
    ],
    differentialDiagnoses: [
      { condition: 'التهاب مفاصل عظمي', probability: 'High', redFlags: ['Joint deformity'] },
      { condition: 'روماتويدي', probability: 'Moderate', redFlags: ['Morning stiffness >1hr'] },
      { condition: 'نقرس (Gout)', probability: 'Moderate', redFlags: ['1st MTP joint', 'Sudden onset'] },
    ],
    relatedSpecialties: ['روماتيزم (Rheumatology)', 'عظام (Orthopedics)'],
    urgencyIfRedFlag: 'urgent',
  },
  {
    id: 'dizziness',
    nameAr: 'دوخة / دوارة',
    nameEn: 'Dizziness / Vertigo',
    icon: '😵‍💫',
    followUpQuestions: [
      'هل بتحس إن الدنيا بلف حواليك ولا بتحس إنك هتغماز؟',
      'هل الدوخة دي بتحصل لما تقف فجأة ولا وأنت نايم؟',
      'كم مدة الدوخة؟ ثواني، دقائق، ولا ساعات؟',
      'هل معاه طنين في الودان أو ضعف سمع؟',
      'هل عندك ضغط دم عالي أو بتاخد أدوية ليه؟',
    ],
    differentialDiagnoses: [
      { condition: 'دوار وضعي حميد (BPPV)', probability: 'High', redFlags: ['Position-triggered'] },
      { condition: 'دوار منيير', probability: 'Moderate', redFlags: ['Hearing loss', 'Tinnitus'] },
      { condition: 'هبوط ضغط قيامي', probability: 'Moderate', redFlags: ['Position change related'] },
      { condition: 'سكتة دماغية', probability: 'Very Low', redFlags: ['Facial droop', 'Limb weakness'] },
    ],
    relatedSpecialties: ['أنف وأذن وحنجرة (ENT)', 'أعصاب (Neurology)'],
    urgencyIfRedFlag: 'critical',
  },
];

// ── Get Symptom Profile ──────────────────────────────────────
export function getSymptomProfile(id: string): SymptomProfile | null {
  return SYMPTOM_PROFILES.find(s => s.id === id) || null;
}

export function getAllSymptomProfiles(): SymptomProfile[] {
  return SYMPTOM_PROFILES;
}

// ── Detect Symptoms from Text ────────────────────────────────
export function detectSymptomsFromText(text: string): SymptomProfile[] {
  const lowerText = text.toLowerCase();
  const detected: SymptomProfile[] = [];

  const keywordMap: Record<string, string[]> = {
    'headache': ['headache', 'head pain', 'صداع', 'وجع راس', 'موجع راسي'],
    'chest-pain': ['chest pain', 'chest tightness', 'ألم صدر', 'وجع صدر', 'ضغط على الصدر'],
    'fatigue': ['fatigue', 'tired', 'exhausted', 'إرهاق', 'تعب', 'خمول', 'ملخ'],
    'skin-lesion': ['rash', 'lesion', 'skin', 'طفح', 'بقعة', 'حبوب', 'حكة', 'جلد'],
    'abdominal-pain': ['stomach pain', 'abdominal', 'belly', 'ألم بطن', 'مغص', 'وجع بطن', 'معدة'],
    'breathing': ['shortness of breath', 'breathing difficulty', 'ضيق نفس', 'صعوبة تنفس'],
    'joint-pain': ['joint pain', 'arthritis', 'ألم مفاصل', 'وجع مفاصل', 'روماتيزم'],
    'dizziness': ['dizziness', 'vertigo', 'dizzy', 'دوخة', 'دوارة', 'دنيا بتلف'],
  };

  for (const [symptomId, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      const profile = getSymptomProfile(symptomId);
      if (profile) detected.push(profile);
    }
  }

  return detected;
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

LIPID PANEL
─────────────────────────────────────
Total Cholesterol: 245 mg/dL     (Ref: < 200)          HIGH
HDL:               35 mg/dL      (Ref: > 40)           LOW
LDL:               165 mg/dL     (Ref: < 100)          HIGH
Triglycerides:     220 mg/dL     (Ref: < 150)          HIGH

THYROID PANEL
─────────────────────────────────────
TSH:               8.5 mIU/L    (Ref: 0.4 - 4.0)      HIGH
Free T4:           0.6 ng/dL    (Ref: 0.8 - 1.8)      LOW

IRON STUDIES
─────────────────────────────────────
Serum Iron:        35 µg/dL     (Ref: 60 - 170)       LOW
Ferritin:          12 ng/mL     (Ref: 15 - 200)       LOW
    `.trim();
  }

  if (isRadiology) {
    return `
MRI BRAIN WITH CONTRAST
─────────────────────────────────────
CLINICAL INDICATION: Headaches, visual disturbances

FINDINGS:
- A 1.8 cm well-circumscribed lesion in right frontal lobe with perilesional edema
- Mild midline shift of approximately 2mm to the left
- No evidence of acute hemorrhage or infarction

IMPRESSION:
1. Right frontal lobe lesion — neoplastic etiology cannot be excluded
2. Recommend neurosurgical consultation
    `.trim();
  }

  if (isPathology) {
    return `
SKIN LESION BIOPSY — LEFT FOREARM
─────────────────────────────────────
MICROSCOPIC DESCRIPTION:
- Asymmetric melanocytic proliferation
- Moderate cytologic atypia with mitotic figures (1/mm²)
- Breslow thickness: 0.8 mm, Clark Level: III
- Margins: Positive at lateral aspect

DIAGNOSIS: Superficial spreading melanoma, Breslow 0.8mm
    `.trim();
  }

  return `
GENERAL MEDICAL REPORT
─────────────────────────────────────
VITAL SIGNS:
- Blood Pressure: 148/92 mmHg (ELEVATED)
- Heart Rate: 88 bpm (Normal)
- Temperature: 37.1°C (Normal)
- SpO2: 97% (Normal)

ASSESSMENT:
1. Uncontrolled hypertension — consider medication adjustment
2. Fatigue workup recommended: CBC, TSH, Iron Studies
    `.trim();
}

// ── Simulated Vision/Lesion Engine ──────────────────────────
export function simulateVisionEngine(imageType: string): GradCamData {
  const classifications: Record<string, { classification: string; confidence: number }> = {
    'skin': { classification: 'يشتبه في وحمة صبغية — التشخيص التفريقي: ملانوما مقابل وحمة غير نموذجية', confidence: 0.82 },
    'rash': { classification: 'طفح حطاطي محمر — يُحتمل: التهاب جلد تماسي مقابل تفاعل دوائي', confidence: 0.75 },
    'lesion': { classification: 'آفة صبغية غير منتظمة — يُنصح بتقييم طبيب جلدية', confidence: 0.88 },
    'wound': { classification: 'جرح جزئي السُمك — لا توجد علامات التهاب حاد', confidence: 0.79 },
  };

  const key = Object.keys(classifications).find(k => imageType.toLowerCase().includes(k)) || 'skin';
  const result = classifications[key];

  const heatmapCoords = [];
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      heatmapCoords.push({
        x: 20 + x * 12, y: 20 + y * 12,
        width: 12, height: 12,
        intensity: Math.random() * 0.8 + 0.2,
      });
    }
  }
  heatmapCoords[12].intensity = 0.95;
  heatmapCoords[13].intensity = 0.98;

  return { imageUrl: '/placeholder-lesion.jpg', heatmapCoords, classification: result.classification, confidence: result.confidence };
}

// ── Parse Lab Markers ────────────────────────────────────────
export function parseLabMarkers(ocrText: string): LabMarker[] {
  const markers: LabMarker[] = [];
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

// ── Generate Dual-View Report Translation ────────────────────
export async function generateReportTranslation(
  ocrText: string,
  labMarkers: LabMarker[],
): Promise<{ clinicalView: ClinicalViewData; patientView: PatientViewData }> {
  const clinicalMetrics = labMarkers.map(m => ({
    name: m.name,
    value: `${m.value} ${m.unit}`,
    reference: `${m.refLow} - ${m.refHigh} ${m.unit}`,
    flag: m.status === 'normal' ? 'N' : m.status === 'high' ? 'H' : m.status === 'low' ? 'L' : 'C',
  }));

  const latinTerms = ocrText.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g)?.filter(t => t.length > 5)?.slice(0, 10) || [];

  const clinicalView: ClinicalViewData = {
    summary: `${labMarkers.filter(m => m.status !== 'normal').length} مؤشر غير طبيعي من ${labMarkers.length}`,
    metrics: clinicalMetrics,
    latinTerms: [...new Set(latinTerms)],
    rawFindings: ocrText,
  };

  const abnormalMarkers = labMarkers.filter(m => m.status !== 'normal');
  const hasCritical = labMarkers.some(m => m.status === 'critical');
  const hasHigh = labMarkers.some(m => m.status === 'high' || m.status === 'low');

  const analogies = abnormalMarkers.map(m => {
    if (m.name.includes('Hemoglobin')) return 'نظام توصيل الأكسجين عندك أقل من الطبيعي — زي أسطول شاحنات قلّت عربياته';
    if (m.name.includes('WBC')) return 'جهازك المناعي نشيط — زي الجنود اللي اتعملوا إنذار';
    if (m.name.includes('Glucose')) return 'السكر في دمك أعلى من المعدل — زي وقود زيادة في العربية';
    if (m.name.includes('Creatinine')) return 'الكلى ممكن مش بتفرز كويس — زي فلتر مية مسدود';
    if (m.name.includes('Cholesterol') || m.name.includes('LDL')) return 'الأوعية فيها ترسبات دهنية — زي الأوساخ في المواسير';
    if (m.name.includes('TSH')) return 'الغدة الدرقية شغالة أقل — زي الترموستات العطلان';
    if (m.name.includes('Ferritin') || m.name.includes('Iron')) return 'مخزون الحديد نازل — زي المخزن اللي خلصت منه البضاعة';
    return `قراءة ${m.name} عندك ${m.status === 'high' ? 'مرتفعة' : 'منخفضة'}`;
  });

  let urgencyLevel = 'طبيعي';
  let recommendedAction = 'استمر في المتابعة الدورية مع طبيبك.';
  let targetSpecialty = 'طب عام';

  if (hasCritical) {
    urgencyLevel = 'عاجل';
    recommendedAction = 'روح المستشفى أو اتصل بالطوارئ فوراً!';
    targetSpecialty = 'طب الطوارئ / إحالة لأخصائي';
  } else if (hasHigh) {
    urgencyLevel = 'مرتفع';
    recommendedAction = 'احجز موعد مع دكتورك في خلال 1-2 أسبوع.';
    targetSpecialty = 'الباطنة';
  }

  const patientView: PatientViewData = {
    summary: `من ${labMarkers.length} تحليل، ${abnormalMarkers.length} غير طبيعي. ${hasCritical ? 'بعض النتائج عاجلة!' : hasHigh ? 'بعض النتائج محتاجة مراجعة.' : 'نتائجك في الغالب طبيعية.'}`,
    analogies,
    urgencyLevel,
    recommendedAction,
    safetyNote: 'هذا التقرير لأغراض تعليمية فقط. لا يُشكّل تشخيصاً طبياً. لا نصف أدوية أبداً. استشر طبيباً مختصاً.',
    targetSpecialty,
  };

  return { clinicalView, patientView };
}
