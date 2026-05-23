import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin-session")?.value) redirect("/admin/login");
  return <SettingsClient />;
}
