'use client';

import React from 'react';
import { useApp } from '@/components/context/AppContext';
import { IndustrialHeader } from '@/components/layout/IndustrialHeader';
import { IndustrialHero } from '@/components/sections/IndustrialHero';
import { CompanyGlimpse } from '@/components/sections/CompanyGlimpse';
import { IndustrialProjects } from '@/components/sections/IndustrialProjects';
import { IndustrialNews } from '@/components/sections/IndustrialNews';
import { IndustrialFooter } from '@/components/layout/IndustrialFooter';
import { AuthModal } from '@/components/auth/AuthModal';
import { VideoModal } from '@/components/ui/VideoModal';
import { EmailConfirmationModal } from '@/components/ui/EmailConfirmationModal';
import { UserUidBadge } from '@/components/ui/UserUidBadge';


import { ClientPortal } from '@/components/portal/ClientPortal';
import { AdminDashboard } from '@/components/portal/AdminDashboard';
import { ViewerPortal } from '@/components/portal/ViewerPortal';

export default function Home() {
  const { currentUser, activeView, adminSubView, setAdminSubView } = useApp();

  return (
    <main className="w-full min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#d9251d] selection:text-white">
      {/* Universal PetroLink Header with quick-role demo switcher */}
      <IndustrialHeader />

      {/* Main Viewport Toggle */}
      {activeView === 'portal' && currentUser ? (
        <div className="flex-1">
          {currentUser.role === 'admin' && (
            adminSubView === 'viewer' ? (
              <div className="flex flex-col flex-1">
                {/* Admin Mode Switcher Banner */}
                <div className="bg-[#08111b] text-white text-xs py-2.5 px-4 border-b border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 shadow-md print:hidden sticky top-0 z-30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="font-extrabold uppercase tracking-wider text-indigo-300">
                      Modo Visor de Auditoría (Acceso de Administrador)
                    </span>
                    <span className="hidden sm:inline text-slate-400 text-[11px]">
                      — Generación y exportación de nómina de cédulas (Mosaico, PDF, Excel, CSV)
                    </span>
                  </div>

                  <button
                    onClick={() => setAdminSubView('dashboard')}
                    className="px-3.5 py-1.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>← Volver al Panel de Administración</span>
                  </button>
                </div>
                <ViewerPortal />
              </div>
            ) : (
              <AdminDashboard />
            )
          )}
          {currentUser.role === 'viewer' && <ViewerPortal />}
          {currentUser.role === 'client' && <ClientPortal />}
        </div>
      ) : (
        /* Landing Page Mode (Matches Reference Image) */
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
      )}

      {/* Global Interactive Modals and Floating Session UID Tab */}
      <AuthModal />
      <VideoModal />
      <EmailConfirmationModal />
      <UserUidBadge />
    </main>
  );
}
