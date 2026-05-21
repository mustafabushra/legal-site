import { prisma } from "@/lib/db";

export const SETTING_DEFAULTS: Record<string, string> = {
  officeName: "مكتب الحسين بن أحمد بن حسين السعدي للمحاماة",
  phone1:     "0555533554",
  phone2:     "0122635336",
  email:      "alhusseinalmojan@gmail.com",
  address:    "جدة - شارع التحلية خلف مبنى الرياض بلازا",
  whatsapp:   "966555533554",
  twitter:    "",
  linkedin:   "",
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const fromDb: Record<string, string> = {};
    rows.forEach((r) => { fromDb[r.key] = r.value; });
    return { ...SETTING_DEFAULTS, ...fromDb };
  } catch {
    return { ...SETTING_DEFAULTS };
  }
}
