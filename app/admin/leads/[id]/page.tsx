export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import LeadDetailClient from "./LeadDetailClient";
import {
  ArrowRight, Phone, Mail, Globe, Calendar,
  MessageSquare,
} from "lucide-react";

async function requireAuth() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin-session")?.value) redirect("/admin/login");
}

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  new:       { bg: "#FEF3C7", text: "#D97706", label: "جديد" },
  contacted: { bg: "#DBEAFE", text: "#2563EB", label: "تم التواصل" },
  closed:    { bg: "#D1FAE5", text: "#059669", label: "مُغلق" },
  spam:      { bg: "#F3F4F6", text: "#9CA3AF", label: "سبام" },
};

function getWhatsAppHref(phone: string) {
  return `https://wa.me/${phone.replace(/^0/, "966").replace(/\D/g, "")}`;
}

interface ParsedConvo {
  messages?: { role: string; content: string }[];
  message?: string;
  sessionId?: string;
  [key: string]: unknown;
}

function parseConvo(raw: string): ParsedConvo | null {
  try { return JSON.parse(raw) as ParsedConvo; } catch { return null; }
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const statusInfo = STATUS_MAP[lead.status] ?? STATUS_MAP.new;
  const convo = parseConvo(lead.conversation);

  return (
    <AdminShell>
      <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }} dir="rtl">

        {/* Back button */}
        <Link
          href="/admin/leads"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "#6B6B6B", textDecoration: "none", fontSize: "14px",
            marginBottom: "20px", fontWeight: 500,
          }}
        >
          <ArrowRight size={16} /> العودة إلى الاستشارات
        </Link>

        {/* Lead header card */}
        <div style={{
          background: "white", borderRadius: "16px", padding: "28px",
          boxShadow: "0 4px 24px rgba(26,39,68,0.06)", marginBottom: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "24px", fontWeight: 900, color: "#1A2744", margin: 0 }}>
                {lead.name ?? "عميل غير مسمى"}
              </h1>
              {lead.service && (
                <span style={{ display: "inline-block", marginTop: "6px", background: "#F3F4F6", border: "1px solid #E5E5E0", padding: "3px 12px", borderRadius: "999px", fontSize: "13px", color: "#1A2744" }}>
                  {lead.service}
                </span>
              )}
            </div>
            <span style={{
              background: statusInfo.bg, color: statusInfo.text,
              padding: "6px 18px", borderRadius: "999px", fontSize: "13px", fontWeight: 700,
              alignSelf: "flex-start",
            }}>
              {statusInfo.label}
            </span>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {lead.phone && (
              <div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>الهاتف</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1A2744", fontWeight: 600 }}>
                  <Phone size={14} color="#C9A84C" /> {lead.phone}
                </div>
              </div>
            )}
            {lead.email && (
              <div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>البريد الإلكتروني</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1A2744", fontWeight: 600 }}>
                  <Mail size={14} color="#C9A84C" /> {lead.email}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>المصدر</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1A2744", fontWeight: 600 }}>
                <Globe size={14} color="#C9A84C" /> {lead.source}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>تاريخ الإنشاء</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1A2744", fontWeight: 600 }}>
                <Calendar size={14} color="#C9A84C" />
                {new Date(lead.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>

          {/* Contact action buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {lead.phone && (
              <>
                <a
                  href={`tel:${lead.phone}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    background: "#DBEAFE", color: "#2563EB", padding: "10px 20px",
                    borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 700,
                  }}
                >
                  <Phone size={15} /> اتصل الآن
                </a>
                <a
                  href={getWhatsAppHref(lead.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    background: "#D1FAE5", color: "#059669", padding: "10px 20px",
                    borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 700,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  واتساب
                </a>
              </>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  background: "#F3F4F6", color: "#1A2744", padding: "10px 20px",
                  borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 700,
                }}
              >
                <Mail size={15} /> إرسال بريد إلكتروني
              </a>
            )}
          </div>
        </div>

        {/* Conversation card */}
        <div style={{
          background: "white", borderRadius: "16px", padding: "24px",
          boxShadow: "0 4px 24px rgba(26,39,68,0.06)", marginBottom: "20px",
        }}>
          <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "16px", fontWeight: 700, color: "#1A2744", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={17} color="#C9A84C" /> المحادثة
          </h2>

          {/* Case 1: messages array */}
          {convo?.messages && convo.messages.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto", padding: "4px" }}>
              {convo.messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{
                      maxWidth: "75%",
                      background: isUser ? "#1A2744" : "#F3F4F6",
                      color: isUser ? "white" : "#1A2744",
                      padding: "12px 16px",
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "4px", opacity: 0.7 }}>
                        {isUser ? "العميل" : "سالم"}
                      </div>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Case 2: message string */}
          {!convo?.messages && convo?.message && (
            <div style={{
              background: "#FAFAF8", borderRadius: "10px", padding: "16px",
              fontSize: "14px", color: "#1A2744", lineHeight: "1.6",
            }}>
              {convo.message}
            </div>
          )}

          {/* Case 3: sessionId only */}
          {!convo?.messages && !convo?.message && convo?.sessionId && (
            <div style={{ background: "#FAFAF8", borderRadius: "10px", padding: "16px", fontSize: "14px", color: "#6B6B6B", textAlign: "center" }}>
              محادثة سالم — رقم الجلسة: <code style={{ fontFamily: "monospace", color: "#1A2744" }}>{convo.sessionId as string}</code>
            </div>
          )}

          {/* Fallback */}
          {!convo && (
            <div style={{ color: "#9CA3AF", fontSize: "14px", textAlign: "center", padding: "20px" }}>
              لا توجد بيانات محادثة
            </div>
          )}
        </div>

        {/* Interactive: status + notes (client component) */}
        <LeadDetailClient
          leadId={lead.id}
          initialStatus={lead.status}
          initialNotes={lead.notes ?? ""}
        />
      </div>
    </AdminShell>
  );
}
