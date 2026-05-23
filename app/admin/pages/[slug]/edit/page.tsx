import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import PageEditorClient from "./PageEditorClient";

export const dynamic = "force-dynamic";

const DEFAULT_CONTENT: Record<string, string> = {
  privacy: `# سياسة الخصوصية\n\nنحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفق نظام حماية البيانات الشخصية (PDPL).\n\n## البيانات التي نجمعها\n\nنجمع فقط البيانات اللازمة لتقديم خدماتنا القانونية.\n\n## استخدام البيانات\n\nتُستخدم بياناتك حصراً للتواصل معك وتقديم الاستشارات القانونية المطلوبة.\n\n## حقوقك\n\nيحق لك الاطلاع على بياناتك أو تعديلها أو طلب حذفها في أي وقت.`,
  terms: `# الشروط والأحكام\n\nباستخدامك لهذا الموقع، فإنك توافق على الشروط والأحكام التالية.\n\n## الخدمات\n\nتُقدَّم الاستشارات القانونية عبر الموقع لأغراض إعلامية فقط ولا تُغني عن التوكيل الرسمي.\n\n## المسؤولية\n\nلا يتحمل المكتب مسؤولية أي قرارات مبنية على محتوى الموقع دون تعاقد رسمي.\n\n## التعديلات\n\nنحتفظ بالحق في تعديل هذه الشروط في أي وقت مع إشعار مسبق.`,
};

async function requireAuth() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin-session")?.value) redirect("/admin/login");
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PageEditPage({ params }: PageProps) {
  await requireAuth();
  const { slug } = await params;

  const page = await prisma.page.findFirst({ where: { slug } });
  const initialContent = page?.content ?? DEFAULT_CONTENT[slug] ?? "";

  return (
    <AdminShell>
      <PageEditorClient slug={slug} initialContent={initialContent} />
    </AdminShell>
  );
}
