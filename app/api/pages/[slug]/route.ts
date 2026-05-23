import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function requireAdmin(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  return null;
}

const DEFAULT_CONTENT: Record<string, string> = {
  privacy: `# سياسة الخصوصية\n\nنحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفق نظام حماية البيانات الشخصية (PDPL).\n\n## البيانات التي نجمعها\n\nنجمع فقط البيانات اللازمة لتقديم خدماتنا القانونية.\n\n## استخدام البيانات\n\nتُستخدم بياناتك حصراً للتواصل معك وتقديم الاستشارات القانونية المطلوبة.\n\n## حقوقك\n\nيحق لك الاطلاع على بياناتك أو تعديلها أو طلب حذفها في أي وقت.`,
  terms: `# الشروط والأحكام\n\nباستخدامك لهذا الموقع، فإنك توافق على الشروط والأحكام التالية.\n\n## الخدمات\n\nتُقدَّم الاستشارات القانونية عبر الموقع لأغراض إعلامية فقط ولا تُغني عن التوكيل الرسمي.\n\n## المسؤولية\n\nلا يتحمل المكتب مسؤولية أي قرارات مبنية على محتوى الموقع دون تعاقد رسمي.\n\n## التعديلات\n\nنحتفظ بالحق في تعديل هذه الشروط في أي وقت مع إشعار مسبق.`,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await prisma.page.findFirst({ where: { slug } });
  const content = page?.content ?? DEFAULT_CONTENT[slug] ?? "";
  return NextResponse.json({ slug, content, exists: !!page });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const { slug } = await params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 }); }

  const content = (body as { content?: unknown }).content;
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "المحتوى مطلوب" }, { status: 422 });
  }

  const page = await prisma.page.upsert({
    where: { slug },
    update: { content: content.trim() },
    create: { slug, content: content.trim() },
  });

  return NextResponse.json({ success: true, slug: page.slug });
}
