// ============================================================
// Medical Glossary Database — Jargon-to-Plain-Language Mapper
// Used by the Interactive Medical Glossary Tooltip system
// ============================================================

export interface GlossaryEntry {
  term: string;
  plainLanguage: string;
  category: 'condition' | 'procedure' | 'medication' | 'anatomy' | 'lab' | 'imaging';
  severity?: 'info' | 'warning' | 'critical';
}

export const MEDICAL_GLOSSARY: Record<string, GlossaryEntry> = {
  // ── Lab & Blood Terms ────────────────────────────────────
  'hemoglobin': {
    term: 'Hemoglobin (Hb)',
    plainLanguage: 'A protein in your red blood cells that carries oxygen throughout your body. Think of it as tiny delivery trucks carrying oxygen from your lungs to every cell.',
    category: 'lab',
  },
  'wbc': {
    term: 'WBC (White Blood Cell Count)',
    plainLanguage: 'White blood cells are your body\'s infection-fighting soldiers. A high count often means your body is battling an infection, while a low count may mean your immune defenses are weakened.',
    category: 'lab',
  },
  'rbc': {
    term: 'RBC (Red Blood Cell Count)',
    plainLanguage: 'Red blood cells are the delivery vehicles that carry oxygen from your lungs to all parts of your body. Low levels can make you feel tired and weak.',
    category: 'lab',
  },
  'platelets': {
    term: 'Platelets',
    plainLanguage: 'Tiny cell fragments that help your blood clot when you get a cut. Without enough platelets, even small cuts could bleed for a long time.',
    category: 'lab',
  },
  'glucose': {
    term: 'Glucose',
    plainLanguage: 'The main sugar in your blood and your body\'s primary source of energy. Like fuel for a car — too much or too little can cause problems.',
    category: 'lab',
  },
  'creatinine': {
    term: 'Creatinine',
    plainLanguage: 'A waste product from normal muscle activity that your kidneys filter out. High levels suggest your kidneys may not be filtering waste properly.',
    category: 'lab',
    severity: 'warning',
  },
  'troponin': {
    term: 'Troponin',
    plainLanguage: 'A protein released when heart muscle is damaged. Think of it as an alarm signal from your heart — elevated levels may indicate a heart attack.',
    category: 'lab',
    severity: 'critical',
  },
  'tsh': {
    term: 'TSH (Thyroid Stimulating Hormone)',
    plainLanguage: 'A hormone that tells your thyroid gland how much thyroid hormone to make. Like a thermostat controlling your metabolism — too high or too low affects your energy, weight, and mood.',
    category: 'lab',
  },
  'hdl': {
    term: 'HDL (High-Density Lipoprotein)',
    plainLanguage: 'Often called "good cholesterol." Think of HDL as a garbage truck that removes excess cholesterol from your blood vessels and takes it to the liver for disposal.',
    category: 'lab',
  },
  'ldl': {
    term: 'LDL (Low-Density Lipoprotein)',
    plainLanguage: 'Often called "bad cholesterol." Like sticky plaque that can build up inside your blood vessel walls, narrowing them and making it harder for blood to flow.',
    category: 'lab',
    severity: 'warning',
  },
  'esr': {
    term: 'ESR (Erythrocyte Sedimentation Rate)',
    plainLanguage: 'A test that measures how quickly red blood cells settle at the bottom of a test tube. A faster rate can signal inflammation somewhere in your body.',
    category: 'lab',
  },
  'inr': {
    term: 'INR (International Normalized Ratio)',
    plainLanguage: 'A measure of how long it takes your blood to clot compared to normal. Used to monitor blood-thinning medications — like checking if a faucet is flowing too freely or too slowly.',
    category: 'lab',
  },

  // ── Radiology & Imaging Terms ────────────────────────────
  'mri': {
    term: 'MRI (Magnetic Resonance Imaging)',
    plainLanguage: 'A scan that uses powerful magnets and radio waves to create detailed pictures of your insides — like taking a 3D photograph of your organs without any radiation.',
    category: 'imaging',
  },
  'ct scan': {
    term: 'CT Scan (Computed Tomography)',
    plainLanguage: 'A scan that takes X-ray images from multiple angles to create cross-sectional pictures — like slicing a loaf of bread to see what\'s inside each slice.',
    category: 'imaging',
  },
  'x-ray': {
    term: 'X-Ray',
    plainLanguage: 'A quick imaging test that uses a small amount of radiation to create pictures of your bones and some tissues — like shining a light through your hand to see the shadows of your bones.',
    category: 'imaging',
  },
  'ultrasound': {
    term: 'Ultrasound',
    plainLanguage: 'A scan that uses sound waves (like a bat\'s sonar) to create live images of your organs and tissues. Completely safe — no radiation involved.',
    category: 'imaging',
  },
  'lesion': {
    term: 'Lesion',
    plainLanguage: 'An area of abnormal tissue. Think of it as a spot or mark that shouldn\'t be there — it could be harmless or need further checking.',
    category: 'imaging',
    severity: 'warning',
  },
  'nodule': {
    term: 'Nodule',
    plainLanguage: 'A small, round lump of tissue. Like a tiny marble under the surface — most are benign, but some need to be checked by a specialist.',
    category: 'imaging',
    severity: 'warning',
  },
  'mass': {
    term: 'Mass',
    plainLanguage: 'An abnormal lump or growth in the body. Unlike a nodule, a mass is usually larger and may require further tests to determine if it\'s benign or concerning.',
    category: 'imaging',
    severity: 'critical',
  },
  'opacity': {
    term: 'Opacity (on imaging)',
    plainLanguage: 'An area that appears white or cloudy on an X-ray or CT scan, where it should look dark (air-filled). Like fog on a window — it means something solid is blocking the view.',
    category: 'imaging',
  },
  'edema': {
    term: 'Edema',
    plainLanguage: 'Swelling caused by excess fluid trapped in your body\'s tissues. Like a sponge that has soaked up too much water — it can make areas look puffy.',
    category: 'condition',
    severity: 'warning',
  },
  'effusion': {
    term: 'Effusion',
    plainLanguage: 'A buildup of fluid in a body space where it shouldn\'t be — like water collecting in the space around your lungs or heart.',
    category: 'condition',
    severity: 'warning',
  },

  // ── Condition Terms ──────────────────────────────────────
  'hypertension': {
    term: 'Hypertension',
    plainLanguage: 'High blood pressure — your heart is working too hard to pump blood through your vessels, like water pipes under too much pressure.',
    category: 'condition',
    severity: 'warning',
  },
  'hypotension': {
    term: 'Hypotension',
    plainLanguage: 'Low blood pressure — your blood isn\'t pushing hard enough through your vessels, which can make you feel dizzy or faint.',
    category: 'condition',
  },
  'anemia': {
    term: 'Anemia',
    plainLanguage: 'A condition where your blood doesn\'t have enough healthy red blood cells to carry adequate oxygen. Like having too few delivery trucks on the road — your body gets less oxygen than it needs.',
    category: 'condition',
  },
  'thrombocytopenia': {
    term: 'Thrombocytopenia',
    plainLanguage: 'A condition where you have too few platelets (clotting cells). This means you might bruise easily or bleed longer from small cuts.',
    category: 'condition',
    severity: 'warning',
  },
  'leukocytosis': {
    term: 'Leukocytosis',
    plainLanguage: 'An elevated white blood cell count, usually meaning your body is fighting an infection or inflammation somewhere.',
    category: 'condition',
  },
  'stenosis': {
    term: 'Stenosis',
    plainLanguage: 'An abnormal narrowing of a blood vessel, valve, or other passage in the body. Like a highway that narrows from 3 lanes to 1 — traffic backs up.',
    category: 'condition',
    severity: 'warning',
  },
  'arrhythmia': {
    term: 'Arrhythmia',
    plainLanguage: 'An irregular heartbeat — your heart may beat too fast, too slow, or with an uneven rhythm, like a drummer who can\'t keep a steady beat.',
    category: 'condition',
    severity: 'critical',
  },

  // ── Procedure Terms ──────────────────────────────────────
  'biopsy': {
    term: 'Biopsy',
    plainLanguage: 'A procedure where a small sample of tissue is taken from your body and examined under a microscope — like taking a tiny piece of a puzzle to see the full picture.',
    category: 'procedure',
  },
  'endoscopy': {
    term: 'Endoscopy',
    plainLanguage: 'A procedure where a thin, flexible tube with a camera is inserted into your body to look inside — like a tiny explorer going into a cave with a flashlight.',
    category: 'procedure',
  },
  'angiography': {
    term: 'Angiography',
    plainLanguage: 'An imaging test that uses a special dye and X-rays to see how blood flows through your arteries — like adding food coloring to water to trace where it goes.',
    category: 'procedure',
  },
};

// ── Glossary Lookup Function ────────────────────────────────
export function lookupGlossaryTerm(term: string): GlossaryEntry | null {
  const normalized = term.toLowerCase().trim();
  return MEDICAL_GLOSSARY[normalized] || null;
}

// ── Find Glossary Terms in Text ─────────────────────────────
export function findGlossaryTermsInText(text: string): { term: string; entry: GlossaryEntry; index: number }[] {
  const results: { term: string; entry: GlossaryEntry; index: number }[] = [];
  const lowerText = text.toLowerCase();

  for (const [key, entry] of Object.entries(MEDICAL_GLOSSARY)) {
    let searchIndex = 0;
    while (true) {
      const idx = lowerText.indexOf(key, searchIndex);
      if (idx === -1) break;
      results.push({ term: key, entry, index: idx });
      searchIndex = idx + key.length;
    }
  }

  // Sort by position in text
  return results.sort((a, b) => a.index - b.index);
}

// ── Get all terms as array ──────────────────────────────────
export function getAllGlossaryTerms(): GlossaryEntry[] {
  return Object.values(MEDICAL_GLOSSARY);
}
