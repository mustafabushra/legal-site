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
  const deny = requireAdmin(req);
  if (deny) return deny;

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalLeads,
    newLeads,
    contactedLeads,
    closedLeads,
    totalPosts,
    totalAppointments,
    bookedAppointments,
    leadStatusBreakdownRaw,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { status: "contacted" } }),
    prisma.lead.count({ where: { status: "closed" } }),
    prisma.post.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { available: false } }),
    prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.lead.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build last-7-days array
  const dayMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = 0;
  }
  for (const lead of recentLeads) {
    const key = lead.createdAt.toISOString().slice(0, 10);
    if (key in dayMap) dayMap[key]++;
  }
  const leadsLast7Days = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  const leadStatusBreakdown = leadStatusBreakdownRaw.map((r) => ({
    status: r.status,
    count: r._count.id,
  }));

  return NextResponse.json({
    totalLeads,
    newLeads,
    contactedLeads,
    closedLeads,
    totalPosts,
    totalAppointments,
    bookedAppointments,
    leadsLast7Days,
    leadStatusBreakdown,
  });
}
