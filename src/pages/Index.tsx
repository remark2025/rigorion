
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { UniversityLogos } from "@/components/landing/UniversityLogos";
import { PartnerLogos } from "@/components/landing/PartnerLogos";
import { PrinciplesSection } from "@/components/landing/PrinciplesSection";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { ProductsShowcase } from "@/components/landing/ProductsShowcase";
import { SubscribeSection } from "@/components/landing/SubscribeSection";

const Index = () => {
  // Single wallpaper for unified background
  const wallpaperImage = '/resources/hero5.webp';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Unified wallpaper background for header, hero, and university sections */}
      <div 
        className="relative"
        style={{
          backgroundImage: `url('${wallpaperImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <Header />
        <Hero />
        <UniversityLogos />
      </div>
      
      <main className="flex-grow">
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
