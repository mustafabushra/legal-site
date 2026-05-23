"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, Trash2, Calendar, Clock, User, Phone } from "lucide-react";

interface Slot {
  id: string; date: string; time: string; available: boolean;
  clientName?: string; clientPhone?: string; service?: string; notes?: string; meetLink?: string;
}

const DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

export default function AppointmentsClient() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [form, setForm] = useState({ date: "", time: "", meetLink: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"available" | "booked" | "expired">("booked");

  const load = () =>
    fetch("/api/appointments").then(r => r.json()).then(setSlots).finally(() => setFetching(false));

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ date: "", time: "", meetLink: "" });
    await load();
    setLoading(false);
  };

  const remove = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموعد؟")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    setSlots(s => s.filter(x => x.id !== id));
  };

  const freeSlot = async (id: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: true, clientName: null, clientPhone: null, service: null, notes: null }),
    });
    await load();
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTime  = new Date().toTimeString().slice(0, 5);
  const isFuture = (s: Slot) => s.date > todayStr || (s.date === todayStr && s.time > nowTime);

  const available = slots.filter(s => s.available && isFuture(s));
  const booked    = slots.filter(s => !s.available);
  const expired   = slots.filter(s => s.available && !isFuture(s));

  const dayName = (dateStr: string) => {
    try { return DAYS[new Date(dateStr).getDay()]; } catch { return ""; }
  };

  return (
    <AdminShell>
      <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "26px", fontWeight: 900, color: "#1A2744" }}>
            إدارة المواعيد
          </h1>
          <p style={{ color: "#6B6B6B", marginTop: "4px", fontSize: "14px" }}>
            حدد المواعيد المتاحة وسالم سيعرضها للعملاء تلقائياً
          </p>
        </div>

        {/* Add slot */}
        <form onSubmit={add} style={{ background: "white", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 4px 24px rgba(26,39,68,0.06)", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "17px", fontWeight: 700, color: "#1A2744", marginBottom: "16px" }}>
            <Plus size={16} style={{ display: "inline", marginLeft: "6px" }} />
            إضافة موعد متاح
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1A2744", marginBottom: "6px" }}>التاريخ</label>
              <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: "100%", border: "1px solid #E5E5E0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1A2744", marginBottom: "6px" }}>الوقت</label>
              <input type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                style={{ width: "100%", border: "1px solid #E5E5E0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
            <div style={{ flex: 2, minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1A2744", marginBottom: "6px" }}>رابط الاجتماع (اختياري)</label>
              <input type="url" value={form.meetLink} onChange={e => setForm({ ...form, meetLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                style={{ width: "100%", border: "1px solid #E5E5E0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", direction: "ltr" }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" disabled={loading} style={{ background: "#C9A84C", color: "#1A2744", fontWeight: 700, padding: "10px 24px", borderRadius: "10px", border: "none", fontSize: "14px", cursor: "pointer", fontFamily: "'IBM Plex Arabic', sans-serif", whiteSpace: "nowrap" }}>
                {loading ? "..." : "إضافة"}
              </button>
            </div>
          </div>
        </form>

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "متاحة (مستقبلية)", count: available.length, color: "#059669", bg: "#D1FAE5", key: "available" },
            { label: "محجوزة",            count: booked.length,   color: "#D97706", bg: "#FEF3C7", key: "booked" },
            { label: "منتهية",            count: expired.length,  color: "#9CA3AF", bg: "#F3F4F6", key: "expired" },
          ].map(s => (
            <button key={s.key} onClick={() => setTab(s.key as "available" | "booked" | "expired")}
              style={{ flex: 1, background: tab === s.key ? s.bg : "white", border: `1.5px solid ${tab === s.key ? s.color : "#E5E5E0"}`, borderRadius: "12px", padding: "14px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
              <div style={{ fontSize: "22px", fontWeight: 900, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: "12px", color: "#6B6B6B", marginTop: "2px" }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* List */}
        {fetching ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6B6B6B" }}>جارٍ التحميل...</div>
        ) : (tab === "available" ? available : tab === "booked" ? booked : expired).length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#6B6B6B" }}>
            <Calendar size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p>{tab === "available" ? "لا توجد مواعيد متاحة مستقبلية" : tab === "booked" ? "لا توجد مواعيد محجوزة" : "لا توجد مواعيد منتهية"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(tab === "available" ? available : tab === "booked" ? booked : expired).map(slot => (
              <div key={slot.id} style={{ background: "white", borderRadius: "12px", padding: "18px 22px", boxShadow: "0 2px 12px rgba(26,39,68,0.06)", border: "1px solid #E5E5E0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: slot.clientName ? "8px" : 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 700, color: "#1A2744", fontSize: "15px" }}>
                      <Calendar size={14} color="#C9A84C" /> {slot.date} — {dayName(slot.date)}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#6B6B6B", fontSize: "14px" }}>
                      <Clock size={13} /> {slot.time}
                    </span>
                  </div>
                  {slot.clientName && (
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#1A2744" }}>
                        <User size={13} color="#C9A84C" /> {slot.clientName}
                      </span>
                      {slot.clientPhone && (
                        <a href={`tel:${slot.clientPhone}`} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#2563EB", textDecoration: "none" }}>
                          <Phone size={13} /> {slot.clientPhone}
                        </a>
                      )}
                      {slot.service && <span style={{ fontSize: "12px", background: "#F3F4F6", padding: "2px 8px", borderRadius: "999px", color: "#1A2744" }}>{slot.service}</span>}
                      {slot.meetLink && (
                        <a href={slot.meetLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", background: "#DBEAFE", color: "#2563EB", padding: "2px 10px", borderRadius: "999px", textDecoration: "none", fontWeight: 600 }}>
                          🎥 رابط الاجتماع
                        </a>
                      )}
                    </div>
                  )}
                  {slot.available && slot.meetLink && (
                    <a href={slot.meetLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#2563EB", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      🎥 {slot.meetLink}
                    </a>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {!slot.available && (
                    <button onClick={() => freeSlot(slot.id)} style={{ background: "#D1FAE5", color: "#059669", border: "none", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'IBM Plex Arabic', sans-serif" }}>
                      تحرير الموعد
                    </button>
                  )}
                  <button onClick={() => remove(slot.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, fontFamily: "'IBM Plex Arabic', sans-serif" }}>
                    <Trash2 size={13} /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
