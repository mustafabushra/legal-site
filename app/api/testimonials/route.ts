import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function requireAdmin(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isAdmin = searchParams.get("admin") === "true";

  if (isAdmin) {
    const deny = requireAdmin(req);
    if (deny) return deny;
  }

  const testimonials = await prisma.testimonial.findMany({
    where: isAdmin ? undefined : { active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const { name, role, content, rating } = body as {
    name?: string;
    role?: string;
    content?: string;
    rating?: number;
  };

  if (!name || !content) {
    return NextResponse.json({ error: "الاسم والمحتوى مطلوبان" }, { status: 422 });
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      name: name.trim(),
      role: role?.trim() || null,
      content: content.trim(),
      rating: rating ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
      active: true,
    },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
