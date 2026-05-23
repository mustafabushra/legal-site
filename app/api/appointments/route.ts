import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";

async function isAdmin() {
  const c = await cookies();
  return c.get("admin-session")?.value === "authenticated";
}

const SlotSchema = z.object({
  date:     z.string().min(1),
  time:     z.string().min(1),
  meetLink: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const slots = await prisma.appointment.findMany({
    where: { date: { gte: today } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // Admin adding a new slot
  if (await isAdmin()) {
    const parsed = SlotSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 422 });
    const { meetLink, ...rest } = parsed.data;
    const slot = await prisma.appointment.create({
      data: { ...rest, available: true, meetLink: meetLink || null },
    });
    return NextResponse.json(slot, { status: 201 });
  }

  // Public booking — client reserving a slot
  const BookSchema = z.object({
    slotId:      z.string(),
    clientName:  z.string().min(1).max(100),
    clientPhone: z.string().min(9).max(20),
    service:     z.string().max(200).optional(),
    notes:       z.string().max(500).optional(),
  });

  const parsed = BookSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 422 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Re-check availability inside transaction to prevent race condition
      const existing = await tx.appointment.findUnique({ where: { id: parsed.data.slotId } });
      if (!existing || !existing.available) throw new Error("unavailable");

      const slot = await tx.appointment.update({
        where: { id: parsed.data.slotId },
        data: {
          available:   false,
          clientName:  parsed.data.clientName,
          clientPhone: parsed.data.clientPhone,
          service:     parsed.data.service,
          notes:       parsed.data.notes,
        },
      });

      await tx.lead.create({
        data: {
          name:         parsed.data.clientName,
          phone:        parsed.data.clientPhone,
          service:      parsed.data.service ?? null,
          conversation: JSON.stringify({ source: "appointment", slotId: slot.id }),
          status:       "new",
        },
      });

      return slot;
    });

    return NextResponse.json({ success: true, slot: result });
  } catch {
    return NextResponse.json({ error: "الموعد غير متاح أو محجوز مسبقاً" }, { status: 409 });
  }
}
