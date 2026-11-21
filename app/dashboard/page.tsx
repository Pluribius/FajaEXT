'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/auth/AppContext';
import { AdminMetrics } from '@/components/admin/AdminMetrics';

export default function AdminDashboardPage() {
  const {
    currentUser,
    isSupabaseLoading,
    users,
    refreshSupabaseUsers,
    tickets = [],
  } = useApp();

  const router = useRouter();

  // Auth guard
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

  // Refresh users when logged in as admin
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      refreshSupabaseUsers();
    }
  }, [currentUser, refreshSupabaseUsers]);

  // Loading state
  if (isSupabaseLoading || !currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#01161e] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
            Cargando Panel de Administración...
          </p>
        </div>
      </div>
    );
  }

  // Metrics calculations
  const totalUsers = users.length;
  const approvedUsers = users.filter((u) => u.status === 'aprobado').length;
  const rejectedUsers = users.filter((u) => u.status === 'rechazado').length;
  const pendingReviews = users.filter((u) => u.status === 'pendiente').length;
  const pendingTickets = tickets.filter((t) => t.status !== 'Resuelto').length;
  const viewerAllowedUsers = users.filter((u) => u.visibleToViewers).length;

  return (
    <div className="w-full bg-[#01161e] min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">

        {/* Admin Metrics Dashboard */}
        <AdminMetrics
          totalUsers={totalUsers}
          approvedUsers={approvedUsers}
          rejectedUsers={rejectedUsers}
          pendingReviews={pendingReviews}
          pendingTickets={pendingTickets}
          viewerAllowedUsers={viewerAllowedUsers}
          onTabChange={() => { }} // No tabs added as requested
          onOpenViewer={() => router.push('/export')}
        />

      </div>
    </div>
  );
}