// ============================================================
// AI Pipeline — Server-Only Module (uses z-ai-web-dev-sdk)
// This file is ONLY imported by API routes (server-side)
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import type { AIChatMessage, SymptomProfile } from './ai-pipeline-client';

// ── ELITE DOCTOR SYSTEM PROMPT ──────────────────────────────
function buildDoctorSystemPrompt(context?: string, symptomProfile?: SymptomProfile): string {
  const symptomContext = symptomProfile ? `
CURRENT SYMPTOM: ${symptomProfile.nameEn} (${symptomProfile.nameAr})
DIFFERENTIAL DIAGNOSES:
${symptomProfile.differentialDiagnoses.map(d => `- ${d.condition} (Probability: ${d.probability})`).join('\n')}
RED FLAGS: ${symptomProfile.differentialDiagnoses.flatMap(d => d.redFlags).filter(r => r !== 'No red flags needed').join(', ')}
FOLLOW-UP QUESTIONS (ask 2-3 at a time, naturally):
${symptomProfile.followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
SPECIALTIES: ${symptomProfile.relatedSpecialties.join(', ')}
` : '';

  return `أنت طبيب بشري محترف وذو خبرة واسعة. تعمل في منصة "المساعد الطبي الشامل". أنت طبيب حقيقي بكل معنى الكلمة.

## أسلوبك:
1. **تبدأ بالسلام والتعاطف** — مثل أي طبيب في العيادة
2. **تأخذ التاريخ المرضي بشكل منظم** — الشكوى ← تاريخ المرض ← التاريخ السابق ← الأدوية ← الحساسية ← العائلي ← الاجتماعي
3. **تسأل أسئلة استكشافية ذكية ومتسلسلة** — سؤالين أو ثلاثة كل مرة
4. **تبني التشخيص التفريقي تدريجياً** — كل إجابة تضيق دائرة الاحتمالات
5. **تشرح بلغة بسيطة** — تشبيهات من الحياة اليومية
6. **تحذر من العلامات الخطرة (Red Flags)** — وتوجه للطوارئ لو لاحظت أي علامة
7. **تتحدث بالعربية المصرية البسيطة** — زي ما الدكتور بيتكلم في العيادة

## بروتوكول SOAP:
- **S (Subjective)**: الأعراض والشكاوى
- **O (Objective)**: العلامات الحيوية، التحاليل
- **A (Assessment)**: التشخيص التفريقي
- **P (Plan)**: الفحوصات، التوجيه، النصائح

## قواعد صارمة:
- ⚠️ لا تصف أدوية بجرعات محددة أبداً
- ⚠️ لا تدّعي تشخيص نهائي 100%
- ⚠️ ذكّر دائماً أن هذا توجيه تعليمي
- ⚠️ لو علامات خطرة، قل بوضوح "روح الطواري دلوقتي"
- ✅ فسّر، ترجم، ثقّف، وجّه للتخصص المناسب

${symptomContext}

${context ? `\nسياق المحادثة:\n${context}\n` : ''}

رد بتعاطف ووضح ودقة طبية. استخدم تشبيهات. تكلم زي الدكتور المصري — بسيط، دافي، محترف.`;
}

// ── LLM Chat Integration ────────────────────────────────────
export async function generateAIChatResponse(
  messages: AIChatMessage[],
  context?: string,
  symptomProfile?: SymptomProfile
): Promise<string> {
  try {
    const zai = await ZAI.create();
    const systemPrompt = buildDoctorSystemPrompt(context, symptomProfile);

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
      max_tokens: 1536,
    });

    return completion.choices[0]?.message?.content || 'أنا آسف، لم أستطع معالجة طلبك. حاول تاني.';
  } catch (error) {
    console.error('[AI Pipeline] LLM Error:', error);
    return generateFallbackResponse(messages, symptomProfile);
  }
}

// ── Fallback Response ────────────────────────────────────────
function generateFallbackResponse(messages: AIChatMessage[], symptomProfile?: SymptomProfile): string {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userText = lastUserMessage?.content?.toLowerCase() || '';

  if (messages.length <= 1) {
    return `أهلاً بيك! 😊 أنا الدكتور المساعد بتاعك.

قبل ما نبدأ، عايز أعرف:
1. **اسمك وعُمرك** إيه؟
2. **الشكوى الرئيسية** — إيه اللي جابك النهاردة؟
3. هل عندك **أمراض مزمنة** معروفة؟ (سكر، ضغط، قلب...)

⚠️ *أنا أداة تعليمية وتوجيهية — مش بديل عن زيارة الطبيب الحقيقي.*`;
  }

  if (symptomProfile) {
    const firstQuestions = symptomProfile.followUpQuestions.slice(0, 3);
    return `فاهم، خليني أسألك كام سؤال عشان أفهم أحسن:\n\n${firstQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n⚠️ *لو الأعراض شديدة، روح الطوارئ فوراً.*`;
  }

  if (userText.includes('صداع') || userText.includes('headache')) {
    return `فاهم — الصداع ده مزعج. خليني أسألك:\n\n1. **فين مكان الألم؟** قدام، ورا، جنب، ولا حواليك؟\n2. **من إمتى؟** وإيه اللي بيزيده أو بيقلله؟\n3. **هل معاه حاجة تانية؟** غمظة عين، غيان، حساسية نور؟\n\n⚠️ *لو الصداع جاء فجأة و جامد جداً — روح المستشفى فوراً.*`;
  }

  if (userText.includes('إرهاق') || userText.includes('تعب') || userText.includes('fatigue')) {
    return `فاهم — الإرهاق المستمر بيأثر على حياتك. خليني أسألك:\n\n1. **من إمتى؟** مستمر ولا بييجي ويروح؟\n2. **وزنك اختلف** من غير سبب؟\n3. **بتنام كويس؟** كام ساعة؟\n\n⚠️ *لازم تشوف دكتور عشان يعمل تحاليل.*`;
  }

  if (userText.includes('صدر') || userText.includes('chest')) {
    return `⚠️ **ألم الصدر مش بيستهانة أبداً!**\n\n1. **الألم ضاغط ولا حارق ولا طاعن؟**\n2. **بيروح للذراع الشمال أو الرقبة؟**\n3. **معاه ضيق نفس أو عرق بارد؟**\n\n🔴 **لو ضاغط ومعاه ضيق نفس — روح الطوارئ دلوقتي!**`;
  }

  return `شكراً إنك شاركتني. عايز أفهم حالتك:\n\n1. **إيه الأعراض بالظبط؟**\n2. **من إمتى بدأت؟**\n3. **عملت تحاليل أو أشعة مؤخراً؟**\n\n⚠️ *أنا أداة تعليمية — لازم تشوف طبيب.*`;
}
