"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, Newspaper,
  Settings, Globe, LogOut, Menu, X, ExternalLink,
  BookOpen, CalendarDays, Star,
} from "lucide-react";

const nav = [
  { label: "الرئيسية",          href: "/admin/dashboard",     icon: LayoutDashboard },
  { label: "الاستشارات",        href: "/admin/leads",         icon: Users },
  { label: "المواعيد",          href: "/admin/appointments",  icon: CalendarDays },
  { label: "مصادر سالم",        href: "/admin/knowledge",     icon: BookOpen },
  { label: "المدونة",           href: "/admin/posts",         icon: FileText },
  { label: "الأخبار",           href: "/admin/news",          icon: Newspaper },
  { label: "التوصيات",          href: "/admin/testimonials",  icon: Star },
  { label: "الصفحات القانونية", href: "/admin/pages",         icon: Globe },
  { label: "الإعدادات",         href: "/admin/settings",      icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [sideOpen, setSideOpen] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Poll session every 5 minutes — show warning at 10min left (50min mark)
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch("/api/auth/check");
        if (!r.ok) {
          // Session expired — redirect
          window.location.href = "/admin/login";
        }
      } catch { /* network error, ignore */ }
    };

    // Warn at 50-minute mark (cookie is 60min)
    const warnTimer = setTimeout(() => setSessionWarning(true), 50 * 60 * 1000);
    // Check every 5 minutes
    const interval = setInterval(check, 5 * 60 * 1000);

    return () => {
      clearTimeout(warnTimer);
      clearInterval(interval);
    };
  }, []);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  const extendSession = async () => {
    // Re-auth is complex without credentials — for now just redirect to login
    setSessionWarning(false);
    alert("يرجى تسجيل الدخول مجدداً لتجديد الجلسة.");
    await logout();
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      style={{
        width: mobile ? "100%" : "240px",
        background: "#0F1B35",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: mobile ? "auto" : "100vh",
        position: mobile ? "relative" : "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/admin/dashboard" onClick={() => setSideOpen(false)} style={{ textDecoration: "none", display: "block" }}>
          <img src="/logo.png" alt="مكتب السعدي للمحاماة"
            style={{ height: "48px", width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          <div style={{ marginTop: "8px", fontSize: "11px", color: "rgba(201,168,76,0.7)", letterSpacing: "0.5px" }}>
            لوحة إدارة المكتب
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href || (href !== "/admin/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setSideOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "10px",
                textDecoration: "none", fontSize: "14px", fontWeight: active ? 700 : 500,
                color: active ? "#C9A84C" : "rgba(255,255,255,0.65)",
                background: active ? "rgba(201,168,76,0.12)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: "4px" }}>
        <a href="/" target="_blank"
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "13px" }}>
          <ExternalLink size={15} /> عرض الموقع
        </a>
        <button onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: "rgba(220,38,38,0.1)", border: "none", color: "#FCA5A5", cursor: "pointer", fontSize: "13px", fontFamily: "'IBM Plex Arabic', sans-serif", width: "100%" }}>
          <LogOut size={15} /> تسجيل الخروج
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F5F3", direction: "rtl" }}>
      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile topbar */}
        <div className="admin-topbar-mobile"
          style={{ background: "#0F1B35", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
          <img src="/logo.png" alt="" style={{ height: "36px", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          <button onClick={() => setSideOpen(!sideOpen)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "6px" }}>
            {sideOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile sidebar drawer */}
        {sideOpen && (
          <div className="admin-topbar-mobile">
            <Sidebar mobile />
          </div>
        )}

        <main style={{ flex: 1, padding: "0" }}>
          {children}
        </main>
      </div>

      {/* Session expiry warning modal */}
      {sessionWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "90%", textAlign: "center", direction: "rtl" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏰</div>
            <h3 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "20px", fontWeight: 700, color: "#1A2744", marginBottom: "10px" }}>
              جلستك على وشك الانتهاء
            </h3>
            <p style={{ color: "#6B6B6B", fontSize: "14px", marginBottom: "24px", lineHeight: "1.7" }}>
              ستنتهي جلستك خلال 10 دقائق. يرجى تسجيل الدخول مجدداً للحفاظ على عملك.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={extendSession}
                style={{ background: "#C9A84C", color: "#1A2744", border: "none", borderRadius: "10px", padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontFamily: "'IBM Plex Arabic', sans-serif" }}>
                تسجيل الدخول مجدداً
              </button>
              <button onClick={() => setSessionWarning(false)}
                style={{ background: "#F3F4F6", color: "#6B6B6B", border: "none", borderRadius: "10px", padding: "12px 24px", fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Arabic', sans-serif" }}>
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-sidebar-desktop { display: flex; }
        .admin-topbar-mobile   { display: none; }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-topbar-mobile   { display: flex !important; flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
