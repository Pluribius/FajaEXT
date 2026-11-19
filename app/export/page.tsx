'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/auth/AppContext';
import { ViewerPortal } from '@/components/portal/ViewerPortal';
import { AdminSubNav } from '@/components/admin/AdminSubNav';

export default function ExportPage() {
  const { currentUser, isSupabaseLoading, openAuthModal } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseLoading) {
      if (!currentUser) {
        router.replace('/home');
        openAuthModal('login');
      } else if (currentUser.role === 'client') {
        // Regular clients cannot access export view
        router.replace('/user');
      }
    }
  }, [currentUser, isSupabaseLoading, router, openAuthModal]);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'viewer')) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#020b14] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Cargando Módulo de Exportación y Auditoría...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* If admin, display admin subnav for easy switching */}
      {currentUser.role === 'admin' && <AdminSubNav />}

      <ViewerPortal />
    </div>
  );
}
