import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import CookieConsent from "@/components/ui/CookieConsent";
import { Calendar, ArrowLeft, Newspaper, ChevronRight, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "الأخبار القانونية",
  description: "آخر الأخبار والتحديثات القانونية في المملكة العربية السعودية.",
};

export const dynamic = "force-dynamic";

const PER_PAGE = 6;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const whatsappPhone = settings.whatsapp ?? "966555545533";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PER_PAGE;

  const [newsItems, total] = await Promise.all([
    prisma.post.findMany({
      where: { category: "news", published: true },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, createdAt: true },
      skip,
      take: PER_PAGE,
    }),
    prisma.post.count({ where: { category: "news", published: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <Header />
      <main style={{ paddingTop: "72px" }}>
        <section className="gradient-hero" style={{ padding: "72px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h1 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "44px", fontWeight: 900, color: "white", marginBottom: "16px" }}>
              الأخبار القانونية
            </h1>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)" }}>
              آخر المستجدات والتحديثات في المنظومة القانونية السعودية
            </p>
          </div>
        </section>

        <section style={{ background: "#FAFAF8", padding: "64px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {newsItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#6B6B6B" }}>
                <Newspaper size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                <p style={{ fontSize: "18px", fontWeight: 600 }}>لا توجد أخبار منشورة بعد</p>
                <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.7 }}>تابعنا قريباً لأحدث الأخبار القانونية</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {newsItems.map((item) => {
                    const date = item.publishedAt ?? item.createdAt;
                    return (
                      <Link key={item.slug} href={`/news/${item.slug}`} style={{ textDecoration: "none" }}>
                        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", cursor: "pointer" }}>
                          <div style={{ flex: 1 }}>
                            <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "18px", fontWeight: 700, color: "#1A2744", marginBottom: "8px" }}>
                              {item.title}
                            </h2>
                            {item.excerpt && (
                              <p style={{ fontSize: "14px", color: "#6B6B6B", marginBottom: "8px" }}>
                                {item.excerpt.slice(0, 120)}{item.excerpt.length > 120 ? "..." : ""}
                              </p>
                            )}
                            <span style={{ fontSize: "13px", color: "#6B6B6B", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Calendar size={13} />
                              {new Date(date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                          </div>
                          <ArrowLeft size={18} color="#C9A84C" style={{ transform: "scaleX(-1)", flexShrink: 0 }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "48px" }}>
                    {page > 1 ? (
                      <Link
                        href={`/news?page=${page - 1}`}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          padding: "10px 20px", borderRadius: "10px",
                          background: "#1A2744", color: "white",
                          textDecoration: "none", fontSize: "14px", fontWeight: 600,
                        }}
                      >
                        <ChevronRight size={16} />
                        السابق
                      </Link>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: "#E5E5E0", color: "#9CA3AF", fontSize: "14px", fontWeight: 600 }}>
                        <ChevronRight size={16} />
                        السابق
                      </span>
                    )}

                    <span style={{ fontSize: "14px", color: "#6B6B6B", fontWeight: 500 }}>
                      صفحة {page} من {totalPages}
                    </span>

                    {page < totalPages ? (
                      <Link
                        href={`/news?page=${page + 1}`}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          padding: "10px 20px", borderRadius: "10px",
                          background: "#1A2744", color: "white",
                          textDecoration: "none", fontSize: "14px", fontWeight: 600,
                        }}
                      >
                        التالي
                        <ChevronLeft size={16} />
                      </Link>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: "#E5E5E0", color: "#9CA3AF", fontSize: "14px", fontWeight: 600 }}>
                        التالي
                        <ChevronLeft size={16} />
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <AIChatWidget />
      <WhatsAppButton phone={whatsappPhone} />
      <CookieConsent />
    </>
  );
}
