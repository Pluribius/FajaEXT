'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/auth/AppContext';
import { NewsPublisherTab } from '@/components/News/NewsPublisherTab';

export default function NewsPage() {
  const { currentUser, isSupabaseLoading, news, addNews, deleteNews } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseLoading) {
      if (!currentUser) {
        router.replace('/home');
      } else if (currentUser.role === 'viewer') {
        router.replace('/export');
      } else if (currentUser.role === 'client') {
        router.replace('/user');
      }
    }
  }, [currentUser, isSupabaseLoading, router]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#01161e] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Cargando Publicador de Noticias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-300 min-h-screen flex flex-col overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        <NewsPublisherTab
          news={news}
          authorName={currentUser?.fullName || 'Dirección de Administración'}
          addNews={addNews}
          deleteNews={deleteNews}
        />
      </div>
    </div>
  );
}
