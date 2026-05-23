import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TestimonialsClient from "./TestimonialsClient";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin-session")?.value) redirect("/admin/login");
  return <TestimonialsClient />;
}
