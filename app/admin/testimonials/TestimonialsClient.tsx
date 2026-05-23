"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Star, Plus, Trash2, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  active: boolean;
  createdAt: string;
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
        >
          <Star
            size={22}
            fill={i <= value ? "#C9A84C" : "transparent"}
            color={i <= value ? "#C9A84C" : "#ccc"}
          />
        </button>
      ))}
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= rating ? "#C9A84C" : "transparent"} color={i <= rating ? "#C9A84C" : "#ccc"} />
      ))}
    </div>
  );
}

export default function TestimonialsClient() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials?admin=true");
      const data = await res.json();
      setTestimonials(data.testimonials ?? []);
    } catch {
      showToast("فشل تحميل التوصيات", false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role: role || undefined, content, rating }),
      });
      if (!res.ok) throw new Error();
      showToast("تمت إضافة التوصية بنجاح", true);
      setName(""); setRole(""); setContent(""); setRating(5);
      fetchTestimonials();
    } catch {
      showToast("فشل إضافة التوصية", false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !t.active }),
      });
      if (!res.ok) throw new Error();
      showToast(t.active ? "تم إخفاء التوصية" : "تم تفعيل التوصية", true);
      fetchTestimonials();
    } catch {
      showToast("فشل تحديث الحالة", false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه التوصية؟")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("تم حذف التوصية", true);
      fetchTestimonials();
    } catch {
      showToast("فشل الحذف", false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #E5E5E0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'IBM Plex Arabic', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    direction: "rtl",
  };

  return (
    <AdminShell>
      <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
              background: toast.ok ? "#1A2744" : "#DC2626",
              color: "white", padding: "12px 24px", borderRadius: "10px",
              fontSize: "14px", zIndex: 9999, display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {toast.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {toast.msg}
          </div>
        )}

        {/* Page header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "26px", fontWeight: 900, color: "#1A2744", marginBottom: "6px" }}>
            التوصيات
          </h1>
          <p style={{ color: "#6B6B6B", fontSize: "14px" }}>
            إدارة توصيات العملاء المعروضة في الصفحة الرئيسية
          </p>
        </div>

        {/* Add form */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "17px", fontWeight: 700, color: "#1A2744", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={18} color="#C9A84C" />
            إضافة توصية جديدة
          </h2>
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  الاسم *
                </label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسم العميل"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  المسمى الوظيفي (اختياري)
                </label>
                <input
                  style={inputStyle}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="مثال: مدير شركة"
                />
              </div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                نص التوصية *
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب نص التوصية هنا..."
                required
              />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                التقييم
              </label>
              <StarSelector value={rating} onChange={setRating} />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "#C9A84C", color: "#1A2744", border: "none",
                borderRadius: "8px", padding: "10px 24px", fontSize: "14px",
                fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "'IBM Plex Arabic', sans-serif",
                display: "flex", alignItems: "center", gap: "8px",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={16} />}
              إضافة التوصية
            </button>
          </form>
        </div>

        {/* Testimonials list */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "17px", fontWeight: 700, color: "#1A2744", marginBottom: "18px" }}>
            جميع التوصيات ({testimonials.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#6B6B6B" }}>
              <Loader2 size={32} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ fontSize: "14px" }}>جارٍ التحميل...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#6B6B6B" }}>
              <Star size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ fontSize: "15px", fontWeight: 600 }}>لا توجد توصيات بعد</p>
              <p style={{ fontSize: "13px", marginTop: "6px", opacity: 0.7 }}>أضف أول توصية من النموذج أعلاه</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  style={{
                    border: "1px solid",
                    borderColor: t.active ? "#E5E5E0" : "#FEE2E2",
                    borderRadius: "12px",
                    padding: "18px",
                    background: t.active ? "#FAFAF8" : "#FFF5F5",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Noto Kufi Arabic', serif", fontWeight: 700, fontSize: "15px", color: "#1A2744" }}>
                          {t.name}
                        </span>
                        {t.role && (
                          <span style={{ fontSize: "12px", color: "#6B6B6B", background: "#F0F0EC", borderRadius: "6px", padding: "2px 8px" }}>
                            {t.role}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "11px", fontWeight: 600,
                            color: t.active ? "#15803D" : "#DC2626",
                            background: t.active ? "#DCFCE7" : "#FEE2E2",
                            borderRadius: "999px", padding: "2px 10px",
                          }}
                        >
                          {t.active ? "نشط" : "مخفي"}
                        </span>
                      </div>
                      <StarRow rating={t.rating} />
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggle(t)}
                        title={t.active ? "إخفاء" : "تفعيل"}
                        style={{
                          background: t.active ? "#FEF3C7" : "#DCFCE7",
                          border: "none", borderRadius: "8px",
                          width: "36px", height: "36px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          color: t.active ? "#92400E" : "#15803D",
                        }}
                      >
                        {t.active ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        title="حذف"
                        style={{
                          background: "#FEE2E2", border: "none", borderRadius: "8px",
                          width: "36px", height: "36px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", color: "#DC2626",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7", fontStyle: "italic" }}>
                    "{t.content}"
                  </p>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    {new Date(t.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AdminShell>
  );
}
