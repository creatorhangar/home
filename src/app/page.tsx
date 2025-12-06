import { Suspense } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Gallery } from "@/components/landing/Gallery";
import { Workflow } from "@/components/landing/Workflow";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Pricing } from "@/components/landing/Pricing";
import { RevenueCalculator } from "@/components/landing/RevenueCalculator";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { TrustBadges } from "@/components/ui/TrustBadges";

export default function Home() {
  return (
    <div className="bg-background-light">
      {/* Hero is fullscreen - no navbar, no container */}
      <Hero />

      {/* Navbar appears after hero */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <TrustBadges />
      </div>

      <div id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-8">
        <HowItWorks />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Features />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Gallery />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Workflow />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <BeforeAfter />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-3xl" />}>
          <Pricing />
        </Suspense>
      </div>

      {/* Revenue Calculator - MOVED AFTER PRICING */}
      <RevenueCalculator />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <CTA />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Footer />
      </div>

      <ScrollToTop />
    </div>
  );
}
