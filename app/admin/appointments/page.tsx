import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppointmentsClient from "./AppointmentsClient";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin-session")?.value) redirect("/admin/login");
  return <AppointmentsClient />;
}
