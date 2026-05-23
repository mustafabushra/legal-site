"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Analytics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  closedLeads: number;
  totalPosts: number;
  totalAppointments: number;
  bookedAppointments: number;
  leadsBySource: { source: string; count: number }[];
  leadsLast7Days: { date: string; count: number }[];
  leadStatusBreakdown: { status: string; count: number }[];
}

interface RecentLead {
  id: string;
  name: string | null;
  phone: string | null;
  service: string | null;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  new:       { bg: "#FEF3C7", text: "#D97706", label: "جديد" },
  contacted: { bg: "#DBEAFE", text: "#2563EB", label: "تم التواصل" },
  closed:    { bg: "#D1FAE5", text: "#059669", label: "مُغلق" },
};

function SparklineSVG({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length) return null;
  const counts = data.map((d) => d.count);
  const max = Math.max(...counts, 1);
  const w = 280;
  const h = 60;
  const pad = 6;
  const points = counts.map((v, i) => {
    const x = pad + (i / (counts.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${points[0]} L ${points.join(" L ")} L ${pad + (w - pad * 2)},${h - pad} L ${pad},${h - pad} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#spark-grad)" />
      <path d={pathD} fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {counts.map((v, i) => {
        const [px, py] = points[i].split(",").map(Number);
        return <circle key={i} cx={px} cy={py} r="3.5" fill="#C9A84C" />;
      })}
    </svg>
  );
}

function HBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", color: "#1A2744", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: "13px", color: "#6B6B6B" }}>{count}</span>
      </div>
      <div style={{ height: "8px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "999px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

export default function DashboardClient({ recentLeads }: { recentLeads: RecentLead[] }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [alertLeads, setAlertLeads] = useState<RecentLead[]>([]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data: Analytics) => setAnalytics(data))
      .catch(() => null);

    // Detect new leads older than 2 hours
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const stale = recentLeads.filter(
      (l) => l.status === "new" && new Date(l.createdAt).getTime() < twoHoursAgo
    );
    setAlertLeads(stale);
  }, [recentLeads]);

  const kpiCards = analytics
    ? [
        {
          label: "إجمالي الاستشارات",
          value: analytics.totalLeads,
          sub: `${analytics.newLeads} جديدة`,
          subColor: analytics.newLeads > 0 ? "#DC2626" : "#6B6B6B",
          href: "/admin/leads",
          accent: "#1A2744",
        },
        {
          label: "المواعيد المحجوزة",
          value: `${analytics.bookedAppointments}/${analytics.totalAppointments}`,
          sub: "موعد محجوز",
          subColor: "#6B6B6B",
          href: "/admin/appointments",
          accent: "#2A5F4A",
        },
        {
          label: "مقالات المدونة",
          value: analytics.totalPosts,
          sub: "مقال ومقال",
          subColor: "#6B6B6B",
          href: "/admin/posts",
          accent: "#C9A84C",
        },
        {
          label: "استشارات اليوم",
          value: analytics.leadsLast7Days[analytics.leadsLast7Days.length - 1]?.count ?? 0,
          sub: "جديدة اليوم",
          subColor: "#6B6B6B",
          href: "/admin/leads",
          accent: "#7C3AED",
        },
      ]
    : [];

  const statusMax = analytics
    ? Math.max(...analytics.leadStatusBreakdown.map((s) => s.count), 1)
    : 1;

  const statusColorMap: Record<string, string> = {
    new: "#F59E0B",
    contacted: "#3B82F6",
    closed: "#10B981",
  };
  const statusLabelMap: Record<string, string> = {
    new: "جديد",
    contacted: "تم التواصل",
    closed: "مُغلق",
  };

  // Find oldest stale lead age in hours
  const oldestHours = alertLeads.length
    ? Math.floor((Date.now() - new Date(alertLeads[alertLeads.length - 1].createdAt).getTime()) / 3600000)
    : 0;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto", direction: "rtl", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#1A2744", marginBottom: "6px" }}>
          لوحة إدارة المكتب
        </h1>
        <p style={{ color: "#6B6B6B", fontSize: "15px" }}>مرحباً بك — هنا نظرة عامة على نشاط الموقع</p>
      </div>

      {/* Alert banner */}
      {alertLeads.length > 0 && (
        <div style={{
          background: "#FEF2F2",
          border: "1.5px solid #FCA5A5",
          borderRadius: "12px",
          padding: "14px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "15px",
          color: "#991B1B",
          fontWeight: 600,
        }}>
          🔴 {alertLeads.length} استشارة جديدة تنتظر ردك — أقدمها منذ {oldestHours} ساعات
          <Link href="/admin/leads" style={{ marginRight: "auto", color: "#DC2626", fontSize: "13px", textDecoration: "underline" }}>
            عرض الاستشارات
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      {analytics && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {kpiCards.map((card) => (
            <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 24px rgba(26,39,68,0.06)",
                border: "1px solid #E5E5E0",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: card.accent, marginTop: "6px" }} />
                  <span style={{ fontSize: "34px", fontWeight: 900, color: "#1A2744" }}>{card.value}</span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1A2744" }}>{card.label}</div>
                <div style={{ fontSize: "12px", color: card.subColor, marginTop: "2px", fontWeight: 600 }}>{card.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Charts row */}
      {analytics && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
          {/* Status bar chart */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 4px 24px rgba(26,39,68,0.06)", border: "1px solid #E5E5E0" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1A2744", marginBottom: "20px" }}>
              توزيع حالات الاستشارات
            </h2>
            {analytics.leadStatusBreakdown.length === 0 ? (
              <p style={{ color: "#9CA3AF", fontSize: "14px" }}>لا توجد بيانات</p>
            ) : (
              analytics.leadStatusBreakdown.map((s) => (
                <HBar
                  key={s.status}
                  label={statusLabelMap[s.status] ?? s.status}
                  count={s.count}
                  max={statusMax}
                  color={statusColorMap[s.status] ?? "#1A2744"}
                />
              ))
            )}
          </div>

          {/* 7-day sparkline */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 4px 24px rgba(26,39,68,0.06)", border: "1px solid #E5E5E0" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1A2744", marginBottom: "16px" }}>
              الاستشارات — آخر 7 أيام
            </h2>
            <SparklineSVG data={analytics.leadsLast7Days} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              {analytics.leadsLast7Days.map((d) => (
                <span key={d.date} style={{ fontSize: "10px", color: "#9CA3AF" }}>
                  {new Date(d.date + "T12:00:00").toLocaleDateString("ar-SA", { weekday: "short" })}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent leads mini-table */}
      {recentLeads.length > 0 && (
        <div style={{ background: "white", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 4px 24px rgba(26,39,68,0.06)", border: "1px solid #E5E5E0", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1A2744" }}>آخر الاستشارات</h2>
            <Link href="/admin/leads" style={{ fontSize: "13px", color: "#C9A84C", textDecoration: "none", fontWeight: 600 }}>
              عرض الكل
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {recentLeads.map((lead) => {
              const status = STATUS_COLORS[lead.status] ?? STATUS_COLORS.new;
              return (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 10px", borderBottom: "1px solid #F3F4F6", textDecoration: "none", borderRadius: "8px" }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: "#1A2744", fontSize: "15px" }}>{lead.name || "—"}</span>
                    {lead.service && (
                      <span style={{ fontSize: "12px", color: "#6B6B6B", marginRight: "10px" }}>{lead.service}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {lead.phone && (
                      <span style={{ fontSize: "13px", color: "#6B6B6B", direction: "ltr" }}>{lead.phone}</span>
                    )}
                    <span style={{
                      background: status.bg,
                      color: status.text,
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}>
                      {status.label}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link href="/admin/leads" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#1A2744", color: "white", fontWeight: 700,
          padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontSize: "14px",
        }}>
          عرض الاستشارات
        </Link>
        <Link href="/admin/appointments" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#2A5F4A", color: "white", fontWeight: 700,
          padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontSize: "14px",
        }}>
          إضافة موعد
        </Link>
        <Link href="/admin/posts/new" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#C9A84C", color: "#1A2744", fontWeight: 700,
          padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontSize: "14px",
        }}>
          كتابة مقال
        </Link>
      </div>
    </div>
  );
}
