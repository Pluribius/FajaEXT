'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  FileCheck,
  MessageSquare,
  FileSpreadsheet,
  Newspaper,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';
import { AdminMetrics } from '@/components/admin/AdminMetrics';


export default function AdminDashboardPage() {
  const { currentUser, isSupabaseLoading, users, tickets, news, refreshSupabaseUsers } = useApp();
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

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      refreshSupabaseUsers();
    }
  }, [currentUser, refreshSupabaseUsers]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#01161e] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Verificando permisos de Administrador...</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const pendingReviews = users.filter((u) => u.status === 'pendiente').length;
  const approvedUsers = users.filter((u) => u.status === 'aprobado').length;
  const rejectedUsers = users.filter((u) => u.status === 'rechazado').length;
  const pendingTickets = tickets.filter((t) => t.status !== 'Resuelto').length;
  const viewerAllowedUsers = users.filter((u) => u.visibleToViewers).length;

  const venezuelanCount = users.filter((u) => u.idType !== false).length;
  const foreignCount = users.filter((u) => u.idType === false).length;

  const approvalRate = totalUsers > 0 ? Math.round((approvedUsers / totalUsers) * 100) : 0;
  const pendingRate = totalUsers > 0 ? Math.round((pendingReviews / totalUsers) * 100) : 0;
  const rejectedRate = totalUsers > 0 ? Math.round((rejectedUsers / totalUsers) * 100) : 0;

  return (
    <div className="w-full bg-slate-200 min-h-screen text-slate-100 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">

        {/* Global Key Metrics */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Estadisticas</span>
          </h2>
          <AdminMetrics
            totalUsers={totalUsers}
            approvedUsers={approvedUsers}
            rejectedUsers={rejectedUsers}
            pendingReviews={pendingReviews}
            pendingTickets={pendingTickets}
            viewerAllowedUsers={viewerAllowedUsers}
            onTabChange={(tab) => {
              if (tab === 'tickets') router.push('/tickets');
              else if (tab === 'noticias') router.push('/news');
              else router.push('/listing');
            }}
            onOpenViewer={() => router.push('/export')}
          />
        </div>

        {/* Visual Analytics & Graphs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution Chart Card */}
          <div className="bg-slate-100 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-black">Distribución de Estatus de Expedientes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Porcentaje de avance sobre el total registrado</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40">
                Total: {totalUsers}
              </span>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-2">
              <div className="h-6 w-full bg-slate-800 rounded-lg overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${approvalRate}%` }}
                  className="bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center text-[10px] font-black text-white"
                  title={`Aprobados: ${approvedUsers} (${approvalRate}%)`}
                >
                  {approvalRate > 8 ? `${approvalRate}%` : ''}
                </div>
                <div
                  style={{ width: `${pendingRate}%` }}
                  className="bg-amber-500 hover:bg-amber-400 transition-all flex items-center justify-center text-[10px] font-black text-white"
                  title={`Pendientes: ${pendingReviews} (${pendingRate}%)`}
                >
                  {pendingRate > 8 ? `${pendingRate}%` : ''}
                </div>
                <div
                  style={{ width: `${rejectedRate}%` }}
                  className="bg-red-500 hover:bg-red-400 transition-all flex items-center justify-center text-[10px] font-black text-white"
                  title={`Rechazados: ${rejectedUsers} (${rejectedRate}%)`}
                >
                  {rejectedRate > 8 ? `${rejectedRate}%` : ''}
                </div>
              </div>

              {/* Legend & Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="bg-emerald-400/20 p-3 rounded-xl border border-emerald-900/30">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprobados</span>
                  </div>
                  <div className="text-xl font-black text-black">{approvedUsers}</div>
                  <div className="text-[11px] text-black">{approvalRate}% del censo</div>
                </div>

                <div className="bg-amber-400/20 p-3 rounded-xl border border-amber-900/30">
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pendientes</span>
                  </div>
                  <div className="text-xl font-black text-black">{pendingReviews}</div>
                  <div className="text-[11px] text-black">{pendingRate}% por revisar</div>
                </div>

                <div className="bg-red-400/20 p-3 rounded-xl border border-red-900/30">
                  <div className="flex items-center gap-1.5 text-xs text-red-800 font-bold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Rechazados</span>
                  </div>
                  <div className="text-xl font-black text-black">{rejectedUsers}</div>
                  <div className="text-[11px] text-black">{rejectedRate}% corregir</div>
                </div>
              </div>
            </div>

            {/* Quick action alert */}
            {pendingReviews > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-xs text-amber-200">
                    Hay <strong>{pendingReviews}</strong> cédulas en cola de revisión listas para auditar.
                  </span>
                </div>
                <Link
                  href="/listing"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase rounded-lg transition-colors whitespace-nowrap"
                >
                  Revisar ahora →
                </Link>
              </div>
            )}
          </div>

          {/* Demographic & ID Type Breakdown */}
          <div className="bg-slate-100 border border-slate-900 rounded-2xl p-6 shadow-lg space-y-6 flex flex-col justify-between">

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-black">Nacionalidad de Documento</h3>
              <CreditCard className="w-4 h-4 text-black" />
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-black">Cédula Venezolana (V-)</span>
                  <span className="text-black font-mono">{venezuelanCount} ({totalUsers > 0 ? Math.round((venezuelanCount / totalUsers) * 100) : 0}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalUsers > 0 ? (venezuelanCount / totalUsers) * 100 : 0}%` }}
                    className="h-full bg-blue-800 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="text-black uppercase tracking-wider font-bold text-black">Auditoría Externa</div>
              <div className="text-black">
                <strong className="text-indigo-400">{viewerAllowedUsers}</strong> usuarios habilitados para exportación en nómina oficial.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
