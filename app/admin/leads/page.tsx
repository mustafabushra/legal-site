export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import LeadsClient from "./LeadsClient";

async function requireAuth() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin-session")?.value) redirect("/admin/login");
}

export default async function LeadsPage() {
  await requireAuth();

  return (
    <AdminShell>
      <LeadsClient />
    </AdminShell>
  );
}
