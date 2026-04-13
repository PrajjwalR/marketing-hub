import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { WhyAgentElephant } from "@/components/landing/why-agent-elephant";
import { BentoFeatures } from "@/components/landing/bento-features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { IntegrationsSection } from "@/components/landing/integrations-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { ConvictionSection } from "@/components/landing/conviction-section";
import { CtaBottom } from "@/components/landing/cta-bottom";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-zinc-900 selection:bg-indigo-500/20">
      <Navbar />
      <Hero />
      <TrustedBy />
      <WhyAgentElephant />
      <BentoFeatures />
      <HowItWorks />
      <IntegrationsSection />
      <PricingSection />
      <TestimonialsSection />
      <ConvictionSection />
      <CtaBottom />
      <Footer />
    </main>
  );
}
