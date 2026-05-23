import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

async function requireAuth() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin-session")?.value) redirect("/admin/login");
}

const editablePages = [
  { title: "سياسة الخصوصية", slug: "privacy", href: "/privacy-policy", desc: "تحديث محتوى صفحة سياسة الخصوصية وفق المتطلبات النظامية (نظام حماية البيانات PDPL)." },
  { title: "الشروط والأحكام", slug: "terms", href: "/terms", desc: "تعديل شروط وأحكام استخدام الموقع والخدمات المقدمة." },
];

export default async function PagesAdminPage() {
  await requireAuth();

  return (
    <AdminShell>
      <div style={{ padding: "32px 24px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "26px", fontWeight: 900, color: "#1A2744", marginBottom: "8px" }}>
          الصفحات القانونية
        </h1>
        <p style={{ color: "#6B6B6B", marginBottom: "32px", fontSize: "14px" }}>
          تعديل صفحات الخصوصية والشروط
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {editablePages.map((page) => (
            <div key={page.slug} style={{ background: "white", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 4px 24px rgba(26,39,68,0.06)", border: "1px solid #E5E5E0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "19px", fontWeight: 700, color: "#1A2744", marginBottom: "6px" }}>
                  {page.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#6B6B6B" }}>{page.desc}</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Link href={page.href} target="_blank" style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F3F4F6", color: "#6B6B6B", padding: "8px 14px", borderRadius: "8px", textDecoration: "none", fontSize: "13px" }}>
                  <ExternalLink size={13} /> عرض
                </Link>
                <Link href={`/admin/pages/${page.slug}/edit`} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#C9A84C", color: "#1A2744", padding: "8px 18px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
                  تعديل
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24px", background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: "12px", padding: "16px 20px", fontSize: "14px", color: "#065F46" }}>
          <strong>✓</strong> المحتوى محفوظ في قاعدة البيانات — انقر <strong>تعديل</strong> لتحديث أي صفحة فوراً.
        </div>
      </div>
    </AdminShell>
  );
}
