"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

interface LeadDetailClientProps {
  leadId: string;
  initialStatus: string;
  initialNotes: string;
}

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  new:       { bg: "#FEF3C7", text: "#D97706", label: "جديد" },
  contacted: { bg: "#DBEAFE", text: "#2563EB", label: "تم التواصل" },
  closed:    { bg: "#D1FAE5", text: "#059669", label: "مُغلق" },
  spam:      { bg: "#F3F4F6", text: "#9CA3AF", label: "سبام" },
};

export default function LeadDetailClient({ leadId, initialStatus, initialNotes }: LeadDetailClientProps) {
  const router = useRouter();
  const [status, setStatus]   = useState(initialStatus);
  const [notes, setNotes]     = useState(initialNotes);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const changeStatus = async (newStatus: string) => {
    setSaving(true);
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, status: newStatus }),
    });
    setStatus(newStatus);
    setSaving(false);
    router.refresh();
  };

  const saveNotes = async () => {
    setSaving(true);
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const currentStatus = STATUS_MAP[status] ?? STATUS_MAP.new;

  return (
    <>
      {/* Status section */}
      <div style={{
        background: "white", borderRadius: "16px", padding: "24px",
        boxShadow: "0 4px 24px rgba(26,39,68,0.06)", marginBottom: "20px",
      }}>
        <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "16px", fontWeight: 700, color: "#1A2744", marginBottom: "16px" }}>
          تغيير الحالة
        </h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{
            background: currentStatus.bg, color: currentStatus.text,
            padding: "6px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 700,
            marginLeft: "8px",
          }}>
            الحالة الحالية: {currentStatus.label}
          </span>
          {Object.entries(STATUS_MAP).map(([key, val]) => (
            <button
              key={key}
              disabled={saving || status === key}
              onClick={() => changeStatus(key)}
              style={{
                padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                cursor: status === key ? "default" : "pointer",
                background: status === key ? "#1A2744" : "white",
                color: status === key ? "white" : "#6B6B6B",
                border: `1.5px solid ${status === key ? "#1A2744" : "#E5E5E0"}`,
                fontFamily: "'IBM Plex Arabic', sans-serif",
                transition: "all 0.15s",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes section */}
      <div style={{
        background: "white", borderRadius: "16px", padding: "24px",
        boxShadow: "0 4px 24px rgba(26,39,68,0.06)",
      }}>
        <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "16px", fontWeight: 700, color: "#1A2744", marginBottom: "12px" }}>
          ملاحظات داخلية
        </h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="أضف ملاحظاتك الداخلية هنا..."
          rows={5}
          style={{
            width: "100%", border: "1px solid #E5E5E0", borderRadius: "10px",
            padding: "12px 14px", fontSize: "14px", outline: "none", resize: "vertical",
            fontFamily: "'IBM Plex Arabic', sans-serif", color: "#1A2744",
            boxSizing: "border-box", direction: "rtl",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
          <button
            onClick={saveNotes}
            disabled={saving}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: saved ? "#059669" : "#C9A84C", color: saved ? "white" : "#1A2744",
              fontWeight: 700, padding: "10px 22px", borderRadius: "10px", border: "none",
              fontSize: "14px", cursor: saving ? "default" : "pointer",
              fontFamily: "'IBM Plex Arabic', sans-serif", transition: "all 0.2s",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
            {saved ? "تم الحفظ!" : saving ? "جارٍ الحفظ..." : "حفظ الملاحظات"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
