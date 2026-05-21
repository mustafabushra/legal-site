import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function BlogPreviewSection() {
  const posts = await prisma.post.findMany({
    where: { category: "blog", published: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true, excerpt: true, publishedAt: true, createdAt: true, category: true },
  });

  if (posts.length === 0) return null;

  return (
    <section style={{ background: "#FAFAF8", padding: "96px 24px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "48px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ color: "#C9A84C", fontWeight: 600, fontSize: "14px", letterSpacing: "2px", marginBottom: "8px" }}>
              المدونة القانونية
            </p>
            <h2
              style={{
                fontFamily: "'Noto Kufi Arabic', serif",
                fontSize: "36px",
                fontWeight: 900,
                color: "#1A2744",
              }}
            >
              آخر المقالات والتحديثات القانونية
            </h2>
          </div>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#C9A84C",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "15px",
            }}
          >
            عرض الكل
            <ArrowLeft size={16} style={{ transform: "scaleX(-1)" }} />
          </Link>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {posts.map((post) => {
            const date = post.publishedAt ?? post.createdAt;
            const tag = post.category || "قانوني";
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: "none" }}
              >
                <article
                  className="card"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                >
                  {/* Tag */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        background: "#1A2744",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: "999px",
                      }}
                    >
                      {tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "'Noto Kufi Arabic', serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#1A2744",
                      lineHeight: "1.5",
                    }}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6B6B6B",
                        lineHeight: "1.7",
                        flex: 1,
                      }}
                    >
                      {post.excerpt.slice(0, 120)}{post.excerpt.length > 120 ? "..." : ""}
                    </p>
                  )}

                  {/* Date */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#6B6B6B",
                      fontSize: "13px",
                      paddingTop: "12px",
                      borderTop: "1px solid #E5E5E0",
                    }}
                  >
                    <Calendar size={14} />
                    {new Date(date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
