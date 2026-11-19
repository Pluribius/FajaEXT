'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/auth/AppContext';
import { ClientPortal } from '@/components/portal/ClientPortal';
import { AdminDashboard } from '@/components/portal/AdminDashboard';
import { ViewerPortal } from '@/components/portal/ViewerPortal';

export default function DashboardPage() {
  const { currentUser, isSupabaseLoading, adminSubView, setAdminSubView, openAuthModal } = useApp();
  const router = useRouter();

  useEffect(() => {
    // If auth is loaded and there is no user, redirect to landing and show login modal
    if (!isSupabaseLoading && !currentUser) {
      router.replace('/landing');
      openAuthModal('login');
    }
  }, [currentUser, isSupabaseLoading, router, openAuthModal]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#01161e] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Cargando Portal...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}
