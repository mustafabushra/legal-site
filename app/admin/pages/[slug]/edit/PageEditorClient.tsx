"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Save, CheckCircle, AlertCircle } from "lucide-react";

const SLUG_TITLES: Record<string, string> = {
  privacy: "سياسة الخصوصية",
  terms: "الشروط والأحكام",
};

const SLUG_LIVE: Record<string, string> = {
  privacy: "/privacy-policy",
  terms: "/terms",
};

interface Props {
  slug: string;
  initialContent: string;
}

export default function PageEditorClient({ slug, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const title = SLUG_TITLES[slug] ?? slug;
  const liveHref = SLUG_LIVE[slug] ?? `/${slug}`;

  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "حدث خطأ");
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
      setStatus("error");
    }
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto", direction: "rtl", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Link href="/admin/pages" style={{ color: "#6B6B6B", textDecoration: "none", fontSize: "13px" }}>
              الصفحات القانونية
            </Link>
            <span style={{ color: "#D1D5DB" }}>›</span>
            <span style={{ fontSize: "13px", color: "#1A2744", fontWeight: 600 }}>{title}</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#1A2744" }}>
            تعديل: {title}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            href={liveHref}
            target="_blank"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "#F3F4F6", color: "#6B6B6B", padding: "10px 16px",
              borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600,
            }}
          >
            <ExternalLink size={14} /> عرض الصفحة
          </Link>
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: status === "saved" ? "#059669" : "#C9A84C",
              color: status === "saved" ? "white" : "#1A2744",
              fontWeight: 700, padding: "10px 24px", borderRadius: "8px",
              border: "none", cursor: status === "saving" ? "not-allowed" : "pointer",
              fontSize: "14px", opacity: status === "saving" ? 0.7 : 1,
              transition: "background 0.2s",
            }}
          >
            {status === "saving" ? (
              "جارٍ الحفظ..."
            ) : status === "saved" ? (
              <><CheckCircle size={15} /> تم الحفظ</>
            ) : (
              <><Save size={15} /> حفظ التغييرات</>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {status === "error" && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px",
          padding: "12px 18px", marginBottom: "16px", display: "flex", alignItems: "center",
          gap: "8px", color: "#991B1B", fontSize: "14px", fontWeight: 600,
        }}>
          <AlertCircle size={16} /> {errorMsg || "فشل الحفظ — يرجى المحاولة مجدداً"}
        </div>
      )}

      {/* Editor */}
      <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 24px rgba(26,39,68,0.06)", border: "1px solid #E5E5E0", overflow: "hidden" }}>
        <div style={{
          padding: "12px 20px",
          background: "#F9FAFB",
          borderBottom: "1px solid #E5E5E0",
          display: "flex", alignItems: "center", gap: "8px",
          fontSize: "13px", color: "#6B6B6B",
        }}>
          <span>Markdown / HTML</span>
          <span style={{ marginRight: "auto", fontSize: "12px", color: "#9CA3AF" }}>
            {content.length} حرف
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            width: "100%",
            minHeight: "520px",
            padding: "24px",
            fontSize: "14px",
            lineHeight: "1.8",
            color: "#1A2744",
            border: "none",
            outline: "none",
            resize: "vertical",
            fontFamily: "'Noto Kufi Arabic', monospace",
            direction: "rtl",
            boxSizing: "border-box",
            background: "white",
          }}
          placeholder="أدخل محتوى الصفحة هنا (Markdown أو HTML)..."
          spellCheck={false}
        />
      </div>

      {/* Info */}
      <div style={{ marginTop: "16px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "14px 18px", fontSize: "13px", color: "#1E40AF" }}>
        <strong>تلميح:</strong> يمكنك استخدام Markdown (# عنوان، **غامق**، - قائمة) أو HTML مباشرةً. سيتم عرض المحتوى في صفحة{" "}
        <Link href={liveHref} target="_blank" style={{ color: "#1E40AF", fontWeight: 700 }}>
          {title}
        </Link>{" "}
        بعد الحفظ.
      </div>
    </div>
  );
}
