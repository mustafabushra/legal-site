export async function notifyNewLead(lead: {
  name?: string | null;
  phone?: string | null;
  service?: string | null;
}) {
  const adminWhatsApp = process.env.ADMIN_WHATSAPP;
  if (!adminWhatsApp) return;

  const name = lead.name ?? "غير معروف";
  const phone = lead.phone ?? "—";
  const service = lead.service ?? "غير محدد";

  const message = encodeURIComponent(
    `🔔 استشارة جديدة\nالاسم: ${name}\nالجوال: ${phone}\nالخدمة: ${service}`
  );

  console.log(
    `[NOTIFY] New lead — WhatsApp: https://wa.me/${adminWhatsApp}?text=${message}`
  );

  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (token && phoneNumberId) {
    try {
      await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: adminWhatsApp,
            type: "text",
            text: { body: decodeURIComponent(message) },
          }),
        }
      );
    } catch {
      /* non-critical */
    }
  }
}
