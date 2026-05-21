"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";

const SAUDI_PHONE = /^(\+966|00966|0)(5\d{8})$/;
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str: string, max = 500): string {
  return str.trim().slice(0, max).replace(/<[^>]*>/g, "").replace(/[<>"'`]/g, "");
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #E5E5E0", borderRadius: "10px",
  padding: "12px 16px", fontSize: "15px",
  fontFamily: "'IBM Plex Arabic', sans-serif",
  outline: "none", direction: "rtl",
};

export default function ContactForm() {
  const [form, setForm]           = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [consent, setConsent]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const validate = (): string => {
    if (!form.name.trim() || form.name.trim().length < 2) return "الرجاء إدخال الاسم الكامل";
    if (!SAUDI_PHONE.test(form.phone.trim())) return "رقم الجوال غير صحيح (مثال: 0555123456)";
    if (form.email && !EMAIL_RE.test(form.email)) return "البريد الإلكتروني غير صحيح";
    if (!consent) return "يجب الموافقة على سياسة الخصوصية";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         sanitize(form.name, 100),
          phone:        form.phone.trim(),
          email:        sanitize(form.email, 200),
          service:      sanitize(form.service, 200),
          message:      sanitize(form.message, 2000),
          consent:      true,
          conversation: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "حدث خطأ، يرجى المحاولة لاحقاً");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("تعذّر الاتصال بالخادم، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-contact" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Contact Info */}
      <div>
        <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "28px", fontWeight: 900, color: "#1A2744", marginBottom: "32px" }}>
          معلومات التواصل
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {[
            { icon: Phone,  label: "الهاتف",              value: "0555533554 / 0122635336",                   href: "tel:0555533554" },
            { icon: Mail,   label: "البريد الإلكتروني",   value: "alhusseinalmojan@gmail.com",                href: "mailto:alhusseinalmojan@gmail.com" },
            { icon: MapPin, label: "العنوان",              value: "جدة - شارع التحلية، خلف مبنى الرياض بلازا", href: "#" },
            { icon: Clock,  label: "ساعات العمل",         value: "الأحد – الخميس: 8 ص – 8 م",               href: "#" },
          ].map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} style={{ display: "flex", gap: "16px", alignItems: "flex-start", textDecoration: "none" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color="#C9A84C" />
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#6B6B6B", marginBottom: "4px" }}>{label}</div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1A2744" }}>{value}</div>
              </div>
            </a>
          ))}
        </div>
        <a
          href="https://wa.me/966555533554?text=مرحباً، أريد استشارة قانونية"
          target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "12px", background: "#25D366", color: "white", padding: "16px 24px", borderRadius: "12px", textDecoration: "none", marginTop: "32px", fontWeight: 700 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          تواصل عبر واتساب الآن
        </a>
      </div>

      {/* Form */}
      <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 24px rgba(26,39,68,0.08)" }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <CheckCircle size={64} color="#22c55e" style={{ margin: "0 auto 20px", display: "block" }} />
            <h3 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "24px", fontWeight: 700, color: "#1A2744", marginBottom: "12px" }}>
              تم استلام طلبك!
            </h3>
            <p style={{ color: "#6B6B6B", lineHeight: "1.7" }}>
              سيتواصل معك فريقنا خلال ساعة واحدة في أوقات العمل.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "24px", fontWeight: 900, color: "#1A2744", marginBottom: "28px" }}>
              احجز استشارتك المجانية
            </h2>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
                <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "#DC2626" }}>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { id: "name",  label: "الاسم الكامل *",     type: "text",  placeholder: "محمد عبدالله" },
                { id: "phone", label: "رقم الجوال *",        type: "tel",   placeholder: "05XXXXXXXX" },
                { id: "email", label: "البريد الإلكتروني",   type: "email", placeholder: "email@example.com" },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1A2744", marginBottom: "6px" }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required={label.includes("*")}
                    maxLength={id === "name" ? 100 : id === "phone" ? 15 : 200}
                    value={form[id as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1A2744", marginBottom: "6px" }}>نوع الخدمة</label>
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} style={{ ...inputStyle, background: "white" }}>
                  <option value="">اختر نوع الخدمة</option>
                  <option>القضايا التجارية</option>
                  <option>تقسيم التركات</option>
                  <option>القانون الجنائي</option>
                  <option>الأحوال الشخصية</option>
                  <option>الأنظمة العقارية</option>
                  <option>نظام العمل</option>
                  <option>العقود والتوثيق</option>
                  <option>استشارة قانونية عامة</option>
                  <option>أخرى</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1A2744", marginBottom: "6px" }}>رسالتك</label>
                <textarea
                  rows={4}
                  placeholder="اشرح لنا موضوعك باختصار..."
                  maxLength={2000}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#FAFAF8", border: "1px solid #E5E5E0", borderRadius: "10px", padding: "14px 16px", cursor: "pointer", fontSize: "13px", color: "#4B4B4B", lineHeight: "1.6" }}>
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#C9A84C", flexShrink: 0, marginTop: "2px" }}
                />
                <span>
                  أوافق على{" "}
                  <Link href="/privacy-policy" target="_blank" style={{ color: "#C9A84C", fontWeight: 600 }}>سياسة الخصوصية</Link>
                  {" "}و{" "}
                  <Link href="/terms" target="_blank" style={{ color: "#C9A84C", fontWeight: 600 }}>شروط الاستخدام</Link>
                  . أعلم أن بياناتي ستُستخدم للتواصل معي بشأن طلبي القانوني وفق{" "}
                  <span style={{ fontWeight: 600 }}>نظام حماية البيانات الشخصية (PDPL)</span>.
                </span>
              </label>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !consent}
                style={{ justifyContent: "center", fontSize: "16px", opacity: (!consent || loading) ? 0.6 : 1 }}
              >
                {loading ? "جارٍ الإرسال..." : <><Send size={18} /> إرسال الطلب</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
