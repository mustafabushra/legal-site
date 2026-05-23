"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import { reviewStats } from "@/lib/reviews";

export interface TestimonialItem {
  id: string | number;
  name: string;
  role?: string | null;
  content?: string;
  text?: string;
  rating: number;
  avatar?: string;
  date?: string;
  reviewCount?: string;
  isLocalGuide?: boolean;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} fill={i <= rating ? "#C9A84C" : "rgba(201,168,76,0.2)"} color={i <= rating ? "#C9A84C" : "rgba(201,168,76,0.2)"} />
      ))}
    </div>
  );
}

function getAvatar(item: TestimonialItem): string {
  if (item.avatar) return item.avatar;
  return item.name ? item.name.charAt(0) : "؟";
}

function getText(item: TestimonialItem): string {
  return item.content ?? item.text ?? "";
}

export default function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number>(0);

  const total = items.length;

  useEffect(() => {
    if (paused || total === 0) return;
    const id = setInterval(() => setCurrent((i) => (i + 1) % total), 5000);
    return () => clearInterval(id);
  }, [paused, total]);

  if (total === 0) return null;

  const prev = () => { setPaused(true); setCurrent((i) => (i - 1 + total) % total); };
  const next = () => { setPaused(true); setCurrent((i) => (i + 1) % total); };

  const item = items[current];

  return (
    <section style={{ background: "#1A2744", padding: "88px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          {/* Google badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "999px",
              padding: "6px 16px",
              marginBottom: "20px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600 }}>
              Google Reviews
            </span>
            <span style={{ color: "#C9A84C", fontSize: "13px", fontWeight: 700 }}>★ {reviewStats.averageRating}</span>
          </div>

          <p style={{ color: "#C9A84C", fontWeight: 600, fontSize: "13px", letterSpacing: "2px", marginBottom: "10px" }}>
            آراء عملائنا الحقيقية
          </p>
          <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: "white", marginBottom: "10px" }}>
            ماذا يقول عملاؤنا
          </h2>
          <div className="gold-divider" />
        </div>

        {/* Card */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (dx > 50) prev();
            else if (dx < -50) next();
          }}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "20px",
            padding: "clamp(24px,5vw,48px)",
            textAlign: "center",
            position: "relative",
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            userSelect: "none",
          }}
        >
          {/* Review counter */}
          <div style={{ position: "absolute", top: "16px", left: "16px", fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
            {current + 1} / {total}
          </div>

          {/* Local guide badge */}
          {item.isLocalGuide && (
            <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(52,168,83,0.15)", border: "1px solid rgba(52,168,83,0.3)", borderRadius: "999px", padding: "3px 10px" }}>
              <MapPin size={11} color="#34A853" />
              <span style={{ fontSize: "11px", color: "#34A853", fontWeight: 600 }}>مرشد محلي</span>
            </div>
          )}

          {/* Avatar */}
          <div
            style={{
              width: "68px", height: "68px",
              background: "linear-gradient(135deg, #C9A84C, #A8882E)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Noto Kufi Arabic', serif",
              fontSize: "26px", fontWeight: 800, color: "#1A2744",
              flexShrink: 0,
              boxShadow: "0 4px 20px rgba(201,168,76,0.3)",
            }}
          >
            {getAvatar(item)}
          </div>

          {/* Stars */}
          <StarRow rating={item.rating} />

          {/* Text */}
          <p
            style={{
              fontSize: "clamp(15px,2.2vw,17px)",
              lineHeight: "1.85",
              color: "rgba(255,255,255,0.82)",
              maxWidth: "620px",
              fontStyle: "italic",
            }}
          >
            &ldquo;{getText(item)}&rdquo;
          </p>

          {/* Name + role/meta */}
          <div>
            <div style={{ fontFamily: "'Noto Kufi Arabic', serif", fontWeight: 700, fontSize: "17px", color: "#C9A84C" }}>
              {item.name}
            </div>
            {item.role && (
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                {item.role}
              </div>
            )}
            {(item.date || item.reviewCount) && (
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
                {[item.date, item.reviewCount].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginTop: "28px" }}>
          <button
            onClick={prev}
            aria-label="السابق"
            style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%", width: "42px", height: "42px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white",
            }}
          >
            <ChevronRight size={19} />
          </button>

          {/* Dots */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => { setPaused(true); setCurrent(i); }}
                aria-label={`تقييم ${i + 1}`}
                style={{
                  width: i === current ? "22px" : "7px",
                  height: "7px",
                  borderRadius: "999px",
                  background: i === current ? "#C9A84C" : "rgba(255,255,255,0.18)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.3s", padding: 0,
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="التالي"
            style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%", width: "42px", height: "42px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white",
            }}
          >
            <ChevronLeft size={19} />
          </button>
        </div>

        {/* Link to Google Maps */}
        <div style={{ textAlign: "center", marginTop: "28px" }}>
          <a
            href={reviewStats.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              color: "rgba(255,255,255,0.4)", fontSize: "13px",
              textDecoration: "none", transition: "color 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" opacity="0.7"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" opacity="0.7"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" opacity="0.7"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" opacity="0.7"/>
            </svg>
            اقرأ جميع التقييمات على Google
          </a>
        </div>

      </div>
    </section>
  );
}
