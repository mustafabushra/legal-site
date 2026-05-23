import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  rateLimiters, getIP, tooManyRequests,
  sanitizeText, LeadSchema, LeadStatusSchema,
} from "@/lib/security";
import { notifyNewLead } from "@/lib/notify";

function requireAdmin(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const status  = searchParams.get("status") ?? undefined;
  const search  = searchParams.get("search") ?? "";
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit   = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const skip    = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
    ...(search ? {
      OR: [
        { name:  { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ],
    } : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getIP(req);
  const rl = rateLimiters.leads(ip);
  if (!rl.allowed) return tooManyRequests();

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 }); }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error?.issues ?? [];
    const msg = issues[0]?.message ?? "بيانات غير صحيحة";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const { name, phone, email, service, message, conversation } = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      name:         sanitizeText(name, 100),
      phone:        phone.trim(),
      email:        email ? sanitizeText(email, 200) : null,
      service:      service ? sanitizeText(service, 200) : null,
      conversation: JSON.stringify({ message: sanitizeText(message ?? "", 2000), history: conversation ?? [] }),
      status:       "new",
    },
  });

  notifyNewLead({ name: lead.name, phone: lead.phone, service: lead.service }).catch(() => null);

  return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "معرّف مطلوب" }, { status: 400 });
  try {
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "لم يُعثر على السجل" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 }); }

  const parsed = LeadStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 422 });
  }

  try {
    const updateData: { status?: string; notes?: string } = {};
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
    const lead = await prisma.lead.update({
      where: { id: parsed.data.id },
      data:  updateData,
    });
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "لم يُعثر على السجل" }, { status: 404 });
  }
}
