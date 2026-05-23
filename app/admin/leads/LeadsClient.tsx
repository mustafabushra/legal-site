"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Phone, Mail, User, MessageSquare, Search, ChevronRight,
  ChevronLeft, Trash2, ExternalLink, Loader2,
} from "lucide-react";

interface Lead {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  service?: string | null;
  conversation: string;
  status: string;
  source: string;
  notes?: string | null;
  createdAt: string;
}

interface ApiResponse {
  leads: Lead[];
  total: number;
  page: number;
  pages: number;
}

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  new:       { bg: "#FEF3C7", text: "#D97706", label: "جديد" },
  contacted: { bg: "#DBEAFE", text: "#2563EB", label: "تم التواصل" },
  closed:    { bg: "#D1FAE5", text: "#059669", label: "مُغلق" },
  spam:      { bg: "#F3F4F6", text: "#9CA3AF", label: "سبام" },
};

const FILTER_TABS = [
  { key: "",          label: "الكل" },
  { key: "new",       label: "جديد" },
  { key: "contacted", label: "تم التواصل" },
  { key: "closed",    label: "مغلق" },
  { key: "spam",      label: "سبام" },
];

function SkeletonCard() {
  return (
    <div style={{
      background: "white", borderRadius: "16px", padding: "24px",
      boxShadow: "0 4px 24px rgba(26,39,68,0.06)", border: "1px solid #E5E5E0",
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ width: "160px", height: "18px", background: "#E5E5E0", borderRadius: "8px" }} />
        <div style={{ width: "80px", height: "18px", background: "#E5E5E0", borderRadius: "999px" }} />
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <div style={{ width: "120px", height: "34px", background: "#E5E5E0", borderRadius: "8px" }} />
        <div style={{ width: "100px", height: "34px", background: "#E5E5E0", borderRadius: "8px" }} />
      </div>
      <div style={{ height: "60px", background: "#F3F4F6", borderRadius: "10px", marginBottom: "14px" }} />
      <div style={{ display: "flex", gap: "8px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ width: "70px", height: "30px", background: "#E5E5E0", borderRadius: "8px" }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

function getWhatsAppHref(phone: string) {
  return `https://wa.me/${phone.replace(/^0/, "966").replace(/\D/g, "")}`;
}

function parseConvo(raw: string) {
  try { return JSON.parse(raw); } catch { return null; }
}

export default function LeadsClient() {
  const [data, setData]         = useState<ApiResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");
  const [page, setPage]         = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async (p = page, s = status, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p), limit: "20",
        ...(s ? { status: s } : {}),
        ...(q ? { search: q } : {}),
      });
      const res = await fetch(`/api/leads?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { load(page, status, search); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = (s: string) => {
    setStatus(s); setPage(1);
    load(1, s, search);
  };

  const applySearch = (q: string) => {
    setSearch(q); setPage(1);
    load(1, status, q);
  };

  const goPage = (p: number) => {
    setPage(p);
    load(p, status, search);
  };

  const changeStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await load(page, status, search);
    setUpdating(null);
  };

  const deleteLead = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    setUpdating(id);
    await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    await load(page, status, search);
    setUpdating(null);
  };

  const leads = data?.leads ?? [];
  const total  = data?.total ?? 0;
  const pages  = data?.pages ?? 1;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }} dir="rtl">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "26px", fontWeight: 900, color: "#1A2744" }}>
          الاستشارات الواردة
        </h1>
        <p style={{ color: "#6B6B6B", marginTop: "4px", fontSize: "14px" }}>
          {loading ? "جارٍ التحميل..." : `${total} استشارة`}
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <Search size={16} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "14px", color: "#9CA3AF", pointerEvents: "none" }} />
        <input
          type="text"
          placeholder="ابحث بالاسم أو الهاتف أو البريد..."
          value={search}
          onChange={e => applySearch(e.target.value)}
          style={{
            width: "100%", padding: "11px 40px 11px 16px", border: "1px solid #E5E5E0",
            borderRadius: "12px", fontSize: "14px", outline: "none", background: "white",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => applyFilter(tab.key)}
            style={{
              padding: "8px 18px", borderRadius: "999px", border: "1.5px solid",
              borderColor: status === tab.key ? "#1A2744" : "#E5E5E0",
              background: status === tab.key ? "#1A2744" : "white",
              color: status === tab.key ? "white" : "#6B6B6B",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              fontFamily: "'IBM Plex Arabic', sans-serif", transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lead cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        {loading ? (
          [1, 2, 3].map(i => <SkeletonCard key={i} />)
        ) : leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6B6B6B" }}>
            <MessageSquare size={48} style={{ margin: "0 auto 16px", opacity: 0.3, display: "block" }} />
            <p style={{ fontSize: "18px" }}>لا توجد استشارات</p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>جرّب تغيير الفلتر أو البحث</p>
          </div>
        ) : leads.map(lead => {
          const statusInfo = STATUS_MAP[lead.status] ?? STATUS_MAP.new;
          const convo = parseConvo(lead.conversation);
          const isUpdating = updating === lead.id;
          return (
            <div
              key={lead.id}
              style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(26,39,68,0.06)", border: "1px solid #E5E5E0",
                opacity: isUpdating ? 0.6 : 1, transition: "opacity 0.2s",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  {lead.name && (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "15px", fontWeight: 700, color: "#1A2744" }}>
                      <User size={15} color="#C9A84C" /> {lead.name}
                    </span>
                  )}
                  {lead.service && (
                    <span style={{ background: "#F3F4F6", border: "1px solid #E5E5E0", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", color: "#1A2744" }}>
                      {lead.service}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ background: statusInfo.bg, color: statusInfo.text, padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>
                    {statusInfo.label}
                  </span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>

              {/* Contact links */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                {lead.phone && (
                  <>
                    <a href={`tel:${lead.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#DBEAFE", color: "#2563EB", padding: "7px 14px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                      <Phone size={13} /> {lead.phone}
                    </a>
                    <a href={getWhatsAppHref(lead.phone)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#D1FAE5", color: "#059669", padding: "7px 14px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      واتساب
                    </a>
                  </>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#F3F4F6", color: "#6B6B6B", padding: "7px 14px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                    <Mail size={13} /> {lead.email}
                  </a>
                )}
              </div>

              {/* Conversation preview */}
              {convo?.messages?.length > 0 && (
                <div style={{ background: "#FAFAF8", borderRadius: "10px", padding: "10px 14px", maxHeight: "100px", overflowY: "auto", marginBottom: "14px", fontSize: "13px" }}>
                  {(convo.messages as { role: string; content: string }[]).slice(-3).map((m, i) => (
                    <div key={i} style={{ color: m.role === "user" ? "#1A2744" : "#6B6B6B", marginBottom: "4px" }}>
                      <strong>{m.role === "user" ? "العميل:" : "سالم:"}</strong>{" "}
                      {m.content.slice(0, 120)}{m.content.length > 120 ? "..." : ""}
                    </div>
                  ))}
                </div>
              )}
              {!convo?.messages && convo?.message && (
                <div style={{ background: "#FAFAF8", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#1A2744" }}>
                  {(convo.message as string).slice(0, 200)}{(convo.message as string).length > 200 ? "..." : ""}
                </div>
              )}

              {/* Actions row */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {/* Status buttons */}
                {Object.entries(STATUS_MAP).map(([key, val]) => (
                  <button
                    key={key}
                    disabled={isUpdating || lead.status === key}
                    onClick={() => changeStatus(lead.id, key)}
                    style={{
                      padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                      cursor: lead.status === key ? "default" : "pointer",
                      background: lead.status === key ? "#1A2744" : "transparent",
                      color: lead.status === key ? "white" : "#6B6B6B",
                      border: `1px solid ${lead.status === key ? "#1A2744" : "#E5E5E0"}`,
                      fontFamily: "'IBM Plex Arabic', sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    {isUpdating && lead.status !== key ? "..." : val.label}
                  </button>
                ))}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* View detail */}
                <Link
                  href={`/admin/leads/${lead.id}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    background: "#F8F7F4", color: "#1A2744", border: "1px solid #E5E5E0",
                    padding: "6px 14px", borderRadius: "8px", textDecoration: "none",
                    fontSize: "12px", fontWeight: 600,
                  }}
                >
                  <ExternalLink size={12} /> عرض التفاصيل
                </Link>

                {/* Delete */}
                <button
                  disabled={isUpdating}
                  onClick={() => deleteLead(lead.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5",
                    padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                    cursor: "pointer", fontFamily: "'IBM Plex Arabic', sans-serif",
                  }}
                >
                  <Trash2 size={12} /> حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => goPage(page - 1)}
            disabled={page <= 1}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "8px 16px", borderRadius: "10px", border: "1px solid #E5E5E0",
              background: "white", color: page <= 1 ? "#C0C0C0" : "#1A2744",
              cursor: page <= 1 ? "default" : "pointer", fontSize: "13px", fontWeight: 600,
              fontFamily: "'IBM Plex Arabic', sans-serif",
            }}
          >
            <ChevronRight size={14} /> السابق
          </button>

          <span style={{ fontSize: "13px", color: "#6B6B6B", fontWeight: 600 }}>
            صفحة {page} من {pages}
          </span>

          <button
            onClick={() => goPage(page + 1)}
            disabled={page >= pages}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "8px 16px", borderRadius: "10px", border: "1px solid #E5E5E0",
              background: "white", color: page >= pages ? "#C0C0C0" : "#1A2744",
              cursor: page >= pages ? "default" : "pointer", fontSize: "13px", fontWeight: 600,
              fontFamily: "'IBM Plex Arabic', sans-serif",
            }}
          >
            التالي <ChevronLeft size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
