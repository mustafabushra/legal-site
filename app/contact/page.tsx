import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import CookieConsent from "@/components/ui/CookieConsent";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع مكتب الحسين بن أحمد بن حسين السعدي للمحاماة. الاستشارة الأولى مجانية.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: "72px" }}>
        <section className="gradient-hero" style={{ padding: "72px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h1 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "44px", fontWeight: 900, color: "white", marginBottom: "16px" }}>
              تواصل معنا
            </h1>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.75)", lineHeight: "1.8" }}>
              فريقنا القانوني جاهز للإجابة على استفساراتك. الاستشارة الأولى مجانية.
            </p>
          </div>
        </section>
        <section style={{ background: "#FAFAF8", padding: "80px 24px" }}>
          <ContactForm />
        </section>
      </main>
      <Footer />
      <AIChatWidget />
      <WhatsAppButton />
      <CookieConsent />
    </>
  );
}
