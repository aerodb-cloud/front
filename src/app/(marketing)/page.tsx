import { HeroSection } from "@/components/marketing/HeroSection";
import { LogoShowcase } from "@/components/marketing/LogoShowcase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aero DBaaS | The Code-first Database",
  description: "Deploy Postgres in seconds. Branching, infinite scaling, and native edge compatibility built for modern developers.",
};

export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <LogoShowcase />
      
      {/* Aqui irían futuras secciones: Features, Pricing, Footer, etc. */}
    </>
  );
}
