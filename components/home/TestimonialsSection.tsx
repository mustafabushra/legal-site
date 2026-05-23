import { prisma } from "@/lib/db";
import { googleReviews } from "@/lib/reviews";
import TestimonialsCarousel, { type TestimonialItem } from "./TestimonialsCarousel";

const FALLBACK_TESTIMONIALS: TestimonialItem[] = googleReviews.map((r) => ({
  id: r.id,
  name: r.name,
  content: r.text,
  rating: r.rating,
  avatar: r.avatar,
  date: r.date,
  reviewCount: r.reviewCount,
  isLocalGuide: (r as { isLocalGuide?: boolean }).isLocalGuide,
}));

export default async function TestimonialsSection() {
  let dbTestimonials: TestimonialItem[] = [];

  try {
    const rows = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    dbTestimonials = rows.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      content: t.content,
      rating: t.rating,
    }));
  } catch {
    // DB not ready — use fallback
  }

  const items = dbTestimonials.length > 0 ? dbTestimonials : FALLBACK_TESTIMONIALS;

  return <TestimonialsCarousel items={items} />;
}
