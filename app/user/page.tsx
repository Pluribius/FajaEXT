'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/auth/AppContext';
import { ClientPortal } from '@/components/portal/ClientPortal';

export default function UserPortalPage() {
  const { currentUser, isSupabaseLoading, openAuthModal } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseLoading) {
      if (!currentUser) {
        router.replace('/home');
        openAuthModal('login');
      } else if (currentUser.role === 'viewer') {
        // Viewers are only authorized to use /export
        router.replace('/export');
      }
    }
  }, [currentUser, isSupabaseLoading, router, openAuthModal]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-slate-900 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Cargando Expediente de Usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <ClientPortal />
    </div>
  );
}
