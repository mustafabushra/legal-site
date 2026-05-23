export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";

async function requireAuth() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin-session")?.value) redirect("/admin/login");
}

export default async function DashboardPage() {
  await requireAuth();

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, phone: true, service: true, status: true, createdAt: true },
  });

  const serialized = recentLeads.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AdminShell>
      <DashboardClient recentLeads={serialized} />
    </AdminShell>
  );
}
