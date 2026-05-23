import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function requireAdmin(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  return null;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const { id } = await params;

  try {
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "لم يُعثر على التوصية" }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const { name, role, content, rating, active } = body as {
    name?: string;
    role?: string;
    content?: string;
    rating?: number;
    active?: boolean;
  };

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (role !== undefined) data.role = role?.trim() || null;
  if (content !== undefined) data.content = content.trim();
  if (rating !== undefined) data.rating = Math.min(5, Math.max(1, Math.round(rating)));
  if (active !== undefined) data.active = active;

  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data,
    });
    return NextResponse.json({ testimonial });
  } catch {
    return NextResponse.json({ error: "لم يُعثر على التوصية" }, { status: 404 });
  }
}
