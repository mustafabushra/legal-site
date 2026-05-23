export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import ServicesSection from "@/components/home/ServicesSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import AIChatWidget from "@/components/ai/AIChatWidget";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import CookieConsent from "@/components/ui/CookieConsent";
import BlogPreviewSection from "@/components/home/BlogPreviewSection";

export const metadata: Metadata = {
  title: "مكتب الحسين بن أحمد بن حسين السعدي للمحاماة — استشارات قانونية متخصصة في جدة",
  description:
    "مكتب محاماة سعودي متخصص في الاستشارات القانونية، مراجعة العقود، إغلاق الصفقات، وحل النزاعات. خبرة 15+ سنة في السوق السعودي.",
};

export default async function HomePage() {
  // Read WhatsApp number server-side so it can be updated from admin settings
  let whatsappNumber = "966555545533";
  try {
    const { getSiteSettings } = await import("@/lib/site-settings");
    const settings = await getSiteSettings();
    if (settings.whatsapp) whatsappNumber = settings.whatsapp;
  } catch { /* use default */ }

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <ServicesSection />
        <WhyUsSection />
        <TestimonialsSection />
        <BlogPreviewSection />
        <CTASection />
      </main>
      <Footer />
      <AIChatWidget />
      <WhatsAppButton phone={whatsappNumber} />
      <CookieConsent />
    </>
  );
}
