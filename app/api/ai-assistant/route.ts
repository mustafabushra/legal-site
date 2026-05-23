import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { AI_CONFIG } from "@/lib/ai-config";
import {
  rateLimiters, getIP, tooManyRequests,
  sanitizeText, containsPromptInjection,
  AIRequestSchema,
} from "@/lib/security";
import { prisma } from "@/lib/db";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

type Slot = { date: string; time: string; meetLink?: string | null };
async function buildSystemPrompt(): Promise<{ prompt: string; slots: Slot[] }> {
  let sources: { title: string; content: string }[] = [];
  let slots: Slot[] = [];

  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    const allSlots = await prisma.appointment.findMany({
      where: { available: true, date: { gte: today } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    // Filter out slots that have already passed today
    slots = allSlots.filter(s =>
      s.date > today || (s.date === today && s.time > currentTime)
    );

    sources = await prisma.knowledgeSource.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[AI] DB error in buildSystemPrompt:", err);
  }

  const meetLink = process.env.MEET_LINK ?? "https://meet.google.com";
  let context = AI_CONFIG.systemPrompt.replace("MEET_LINK_PLACEHOLDER", meetLink);

  if (sources.length > 0) {
    context += "\n\n## معلومات المكتب (أجب فقط من هذه المصادر):\n";
    sources.forEach(s => {
      context += `\n### ${s.title}\n${s.content}\n`;
    });
    context += "\n**مهم جداً:** لا تجاوب على أي سؤال بمعلومات خارج هذه المصادر. إذا لم تجد الجواب قل: \"هذا الموضوع يحتاج تواصل مباشر مع المحامي.\"\n";
  }

  const DAYS_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  if (slots.length > 0) {
    context += "\n## المواعيد المتاحة (اعرضها بالضبط للعميل):\n";
    slots.slice(0, 5).forEach(s => {
      const dayName = DAYS_AR[new Date(s.date).getDay()] ?? "";
      const type = s.meetLink ? "مكالمة فيديو 🎥" : "حضور شخصي 🏢";
      context += `• يوم ${dayName} ${s.date} الساعة ${s.time} — ${type}\n`;
    });
    context += "\nاعرض هذه المواعيد للعميل وخلّيه يختار، ثم أكّد الموعد بالصيغة المحددة أعلاه.\n";
    context += "بعد تأكيد الموعد: إذا كان الموعد مكالمة فيديو، أخبر العميل أن رابط الاجتماع سيُرسل له على جواله.\n";
  } else {
    context += "\n## المواعيد: لا توجد مواعيد متاحة حالياً. أخبر العميل: \"المواعيد محجوزة هذا الأسبوع، لكن سيتواصل معك أحد المستشارين اليوم لتحديد موعد مناسب.\"\n";
  }

  context += `
## قواعد جمع بيانات العميل (إلزامية):
- في أول رسالة بعد فهم طلب العميل، اسأل عن اسمه ورقم جواله
- لا تقدم استشارة مفصلة قبل الحصول على الاسم والرقم
- عند الحصول على الرقم، أكد له أن أحد المستشارين سيتواصل معه
- الرقم يجب أن يكون سعودياً يبدأ بـ 05 أو 966

## تذكير نهائي — اللغة:
أجب بالعربية فقط بدون استثناء. ممنوع تماماً استخدام أي حرف من لغة أخرى في ردودك.
`;

  return { prompt: context, slots };
}

function appendKnownData(prompt: string, leadData?: { name?: string; phone?: string }): string {
  if (!leadData?.name && !leadData?.phone) return prompt;
  let note = "\n## بيانات العميل المجموعة مسبقاً في هذه المحادثة (لا تسأل عنها مجدداً):\n";
  if (leadData.name)  note += `- الاسم: ${leadData.name}\n`;
  if (leadData.phone) note += `- رقم الجوال: ${leadData.phone}\n`;
  note += "استخدم هذه البيانات مباشرة ولا تطلبها من العميل مرة أخرى.\n";
  return prompt + note;
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = rateLimiters.ai(ip);
  if (!rl.allowed) return tooManyRequests();

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 }); }

  const parsed = AIRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "رسالة غير صالحة" }, { status: 400 });
  }

  const { messages, sessionId, leadData } = parsed.data;

  const cleanMessages = messages.map((m) => ({
    role:    m.role,
    content: sanitizeText(m.content, 1000),
  }));

  const lastUserMsg = cleanMessages.filter((m) => m.role === "user").at(-1)?.content ?? "";

  if (containsPromptInjection(lastUserMsg)) {
    return NextResponse.json({ error: "رسالتك تحتوي على محتوى غير مسموح به." }, { status: 400 });
  }

  if (lastUserMsg.length > 1000) {
    return NextResponse.json({ error: "الرسالة طويلة جداً، يرجى اختصارها." }, { status: 400 });
  }

  try {
    const { prompt: rawPrompt, slots } = await buildSystemPrompt();
    const systemPrompt = appendKnownData(rawPrompt, leadData);

    // Keep only last 10 messages to avoid Groq token overflow
    const trimmedMessages = cleanMessages.slice(-10);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let completion;
    try {
      completion = await getGroq().chat.completions.create({
        model: AI_CONFIG.model,
        max_tokens: AI_CONFIG.max_tokens,
        temperature: AI_CONFIG.temperature ?? 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          ...trimmedMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
      }, { signal: controller.signal as AbortSignal });
    } finally {
      clearTimeout(timeoutId);
    }

    const reply = (completion.choices[0]?.message?.content ?? "").trim();

    // Extract phone number from conversation
    const phoneMatch =
      lastUserMsg.match(/(?:\+966|00966|0)(5\d{8})/) ||
      reply.match(/(?:\+966|00966|0)(5\d{8})/);

    // Extract name — look for patterns like "اسمي X" or "أنا X"
    const nameMatch = lastUserMsg.match(/(?:اسمي|أنا|انا)\s+([^\s،,\.]{2,20})/);

    const knownPhone = leadData?.phone ?? null;
    const knownName  = leadData?.name  ?? null;

    if (sessionId && (phoneMatch || nameMatch || knownName || knownPhone)) {
      try {
        const existing = await prisma.lead.findFirst({
          where: { conversation: { contains: sessionId } },
        });

        const phone = phoneMatch ? `0${phoneMatch[1]}` : knownPhone;
        const name  = nameMatch ? nameMatch[1] : knownName;

        if (!existing) {
          await prisma.lead.create({
            data: {
              phone,
              name,
              email:        leadData?.email ? sanitizeText(leadData.email, 200) : null,
              service:      leadData?.service ? sanitizeText(leadData.service, 200) : null,
              conversation: JSON.stringify({ sessionId }),
              status:       "new",
            },
          });
        } else if (phone || name) {
          await prisma.lead.update({
            where: { id: existing.id },
            data: {
              ...(phone && !existing.phone ? { phone } : {}),
              ...(name  && !existing.name  ? { name }  : {}),
            },
          });
        }
      } catch { /* non-critical */ }
    }

    // Auto-book appointment if user confirmed a slot
    const bookingMatch = reply.match(/تم تأكيد موعدك.*?(\d{4}-\d{2}-\d{2}).*?(\d{2}:\d{2})/);
    if (bookingMatch && (leadData?.name ?? knownName) && (leadData?.phone ?? knownPhone)) {
      try {
        const slot = await prisma.appointment.findFirst({
          where: { date: bookingMatch[1], time: bookingMatch[2], available: true },
        });
        if (slot) {
          await prisma.appointment.update({
            where: { id: slot.id },
            data: { available: false, clientName: leadData?.name ?? knownName, clientPhone: leadData?.phone ?? knownPhone, service: leadData?.service },
          });
        }
      } catch { /* non-critical */ }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[AI] reply length:", reply.length);
    }

    return NextResponse.json({
      reply,
      leadCaptured: !!(phoneMatch || nameMatch),
      availableSlots: slots.length > 0 && reply.includes("المواعيد") ? slots.slice(0, 5).map(s => ({ date: s.date, time: s.time, meetLink: s.meetLink ?? undefined })) : [],
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ reply: "عذراً، الشبكة بطيئة الآن. يرجى المحاولة مرة أخرى بعد لحظات.", leadCaptured: false, availableSlots: [] });
    }
    console.error("[AI] route error:", error);
    return NextResponse.json({ error: "فشل الاتصال بالمساعد، يرجى المحاولة مرة أخرى" }, { status: 500 });
  }
}
