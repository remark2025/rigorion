
import React from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { PartnerLogos } from "@/components/landing/PartnerLogos";
import { PrinciplesSection } from "@/components/landing/PrinciplesSection";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { ProductsShowcase } from "@/components/landing/ProductsShowcase";
import { SubscribeSection } from "@/components/landing/SubscribeSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <PartnerLogos />
        <PrinciplesSection />
        <ComparisonTable />
        <TestimonialSection />
        <StatsCounter />
        <ProductsShowcase />
        <SubscribeSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
