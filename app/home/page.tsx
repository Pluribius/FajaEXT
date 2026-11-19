'use client';

import React from 'react';
import { IndustrialHero } from '@/components/landing/IndustrialHero';
import { CompanyGlimpse } from '@/components/landing/CompanyProcess';
import { IndustrialProjects } from '@/components/landing/IndustrialRequirements';
import { IndustrialNews } from '@/components/landing/IndustrialCompanies';
import { IndustrialFooter } from '@/components/ui/layout/footer/IndustrialFooter';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section id="hero">
        <IndustrialHero />
      </section>

      {/* Section 2: Glimpse to our company & 4 Industrial Cards */}
      <CompanyGlimpse />

      {/* Section 3: Operational Projects & Infrastructure */}
      <IndustrialProjects />

      {/* Section 4: Live Official News & Bulletins */}
      <IndustrialNews />

      {/* Footer */}
      <IndustrialFooter />
    </div>
  );
}
