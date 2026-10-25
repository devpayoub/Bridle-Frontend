import type { Metadata } from "next";

import { env } from "@/lib/env";

import { CtaSection } from "./_components/cta-section";
import { DevelopersSection } from "./_components/developers-section";
import { FeaturesSection } from "./_components/features-section";
import { FooterSection } from "./_components/footer-section";
import { HeroSection } from "./_components/hero-section";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { InfrastructureSection } from "./_components/infrastructure-section";
import { IntegrationsSection } from "./_components/integrations-section";
import { MetricsSection } from "./_components/metrics-section";
import { Navigation } from "./_components/navigation";
import { PricingSection } from "./_components/pricing-section";
import { SecuritySection } from "./_components/security-section";
import { TestimonialsSection } from "./_components/testimonials-section";

export const metadata: Metadata = {
  title: {
    absolute: "Bridle AI — Domain-restricted AI assistants",
  },
  description:
    "Build AI assistants that stay inside an approved domain: enforced policies, grounded answers with citations, per-request audit trails and predictable usage controls.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bridle AI — Domain-restricted AI assistants",
    description:
      "Enforced policies, grounded answers with citations, per-request audit trails and predictable usage controls.",
    type: "website",
  },
};

export default function Home() {
  // The API reference lives on the API host, not on this app.
  const docsUrl = `${env.apiBaseUrl}/api/docs/`;

  return (
    <>
      <Navigation />
      <main className="noise-overlay relative min-h-screen overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <InfrastructureSection />
        <MetricsSection />
        <IntegrationsSection />
        <SecuritySection />
        <DevelopersSection docsUrl={docsUrl} />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <FooterSection />
    </>
  );
}
