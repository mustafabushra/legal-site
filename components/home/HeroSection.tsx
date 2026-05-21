"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Shield, Award, Phone } from "lucide-react";

const headlines = [
  "نحمي حقوقك بأمانة واحترافية",
  "خبرة قانونية تخدم مصلحتك",
  "شريكك القانوني الموثوق في جدة",
];

export default function HeroSection() {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((i) => (i + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="gradient-hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "68px",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(201,168,76,0.05) 0%, transparent 40%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo strip at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "90px",
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0.07,
          filter: "brightness(0) invert(1)",
          display: "flex",
          alignItems: "center",
          gap: "48px",
          whiteSpace: "nowrap",
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <img key={i} src="/logo.png" alt="" style={{ height: "70px", width: "auto", flexShrink: 0 }} />
        ))}
      </div>

      {/* ── Grid ── */}
      <div className="hero-grid" style={{ maxWidth: "1280px", margin: "0 auto", padding: "56px 24px", width: "100%", position: "relative", zIndex: 1 }}>

        {/* ── Content column ── */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.35)",
              borderRadius: "999px",
              padding: "6px 16px",
              marginBottom: "20px",
            }}
          >
            <Award size={13} color="#C9A84C" />
            <span style={{ color: "#C9A84C", fontSize: "12px", fontWeight: 600 }}>
              مرخص من هيئة المحامين السعوديين
            </span>
          </div>

          {/* Firm name pill */}
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "12px", letterSpacing: "0.5px" }}>
            مكتب الحسين بن أحمد بن حسين السعدي للمحاماة
          </p>

          {/* Rotating headline */}
          <h1
            style={{
              fontFamily: "'Noto Kufi Arabic', serif",
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 900,
              color: "white",
              lineHeight: "1.25",
              marginBottom: "20px",
            }}
          >
            <span className="text-gradient-gold">{headlines[headlineIndex]}</span>
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "rgba(255,255,255,0.72)",
              lineHeight: "1.85",
              marginBottom: "32px",
              maxWidth: "500px",
            }}
          >
            مكتب قانوني متخصص في جدة — شارع التحلية. نقدم خدماتنا في 17 تخصصاً
            قانونياً للأفراد والشركات وفق أحدث الأنظمة السعودية.
          </p>

          {/* CTAs */}
          <div className="btn-group" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
            <Link href="/contact" className="btn-primary" style={{ fontSize: "15px" }}>
              احجز استشارة مجانية
              <ArrowLeft size={17} style={{ transform: "scaleX(-1)" }} />
            </Link>
            <a
              href="tel:0555533554"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "1.5px solid rgba(201,168,76,0.4)",
                color: "#C9A84C",
                padding: "13px 24px",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 600,
                background: "rgba(201,168,76,0.08)",
                transition: "all 0.3s",
              }}
            >
              <Phone size={16} />
              اتصل الآن
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ display: "flex" }}>
                {[1,2,3,4,5].map((i) => <Star key={i} size={15} fill="#C9A84C" color="#C9A84C" />)}
              </div>
              <span style={{ color: "#C9A84C", fontWeight: 700, fontSize: "14px" }}>4.9</span>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>(300+ موكل)</span>
            </div>
            <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Shield size={14} color="#C9A84C" />
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>سرية تامة ومضمونة</span>
            </div>
          </div>
        </div>

        {/* ── Visual card column (desktop only) ── */}
        <div
          className="hero-visual"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "24px",
              padding: "36px 32px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              maxWidth: "380px",
              width: "100%",
            }}
          >
            {/* Logo */}
            <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
              <img
                src="/h_logo.png"
                alt="مكتب الحسين بن أحمد بن حسين السعدي للمحاماة"
                style={{
                  height: "110px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto",
                  filter: "brightness(0) invert(1)",
                  opacity: 0.92,
                }}
              />
            </div>

            {/* Quranic verse */}
            <div style={{ fontSize: "40px", color: "rgba(201,168,76,0.25)", fontFamily: "serif", lineHeight: 1, marginBottom: "8px" }}>❝</div>
            <p style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "17px", fontWeight: 700, color: "#C9A84C", lineHeight: "1.8", marginBottom: "8px" }}>
              أحسِن إلى النَّاس تَستعبِدْ قلوبَهُمُ<br />فطالما استعبدَ الإنسانَ إحسانُ
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "24px" }}>— المتنبي</p>

            {/* Stats grid */}
            <div
              style={{
                paddingTop: "20px",
                borderTop: "1px solid rgba(201,168,76,0.15)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {[
                { num: "300+", label: "موكل" },
                { num: "17", label: "تخصصاً" },
                { num: "جدة", label: "التحلية" },
                { num: "98%", label: "رضا العملاء" },
              ].map(({ num, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "22px", fontWeight: 900, color: "#C9A84C" }}>{num}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
