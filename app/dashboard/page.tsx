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
import { AdminSubNav } from '@/components/admin/AdminSubNav';

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
    <div className="w-full bg-[#01161e] min-h-screen text-slate-100 flex flex-col">
      <AdminSubNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Welcome Header */}
        <div className="bg-[#0e1b29] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d9251d]">
              <BarChart3 className="w-4 h-4" />
              <span>Centro de Analíticas y Control General</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Panel Administrativo FAJAEXT
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Monitoreo en tiempo real de inscripciones, auditoría de expedientes, solicitudes y estadísticas del censo laboral.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/listing"
              className="px-4 py-2.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow"
            >
              <Users className="w-4 h-4" />
              <span>Gestionar Usuarios</span>
            </Link>

            <Link
              href="/export"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 border border-slate-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Generar Reportes</span>
            </Link>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Métricas Operativas</span>
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
          <div className="bg-[#0e1b29] border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Distribución de Estatus de Expedientes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Porcentaje de avance sobre el total registrado</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40">
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
                <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-900/30">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprobados</span>
                  </div>
                  <div className="text-xl font-black text-white">{approvedUsers}</div>
                  <div className="text-[11px] text-slate-400">{approvalRate}% del censo</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-900/30">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pendientes</span>
                  </div>
                  <div className="text-xl font-black text-white">{pendingReviews}</div>
                  <div className="text-[11px] text-slate-400">{pendingRate}% por revisar</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-red-900/30">
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Rechazados</span>
                  </div>
                  <div className="text-xl font-black text-white">{rejectedUsers}</div>
                  <div className="text-[11px] text-slate-400">{rejectedRate}% corregir</div>
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
          <div className="bg-[#0e1b29] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Nacionalidad de Documento</h3>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Cédula Venezolana (V-)</span>
                    <span className="text-white font-mono">{venezuelanCount} ({totalUsers > 0 ? Math.round((venezuelanCount / totalUsers) * 100) : 0}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${totalUsers > 0 ? (venezuelanCount / totalUsers) * 100 : 0}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Cédula Extranjera (E-)</span>
                    <span className="text-white font-mono">{foreignCount} ({totalUsers > 0 ? Math.round((foreignCount / totalUsers) * 100) : 0}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${totalUsers > 0 ? (foreignCount / totalUsers) * 100 : 0}%` }}
                      className="h-full bg-teal-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Auditoría Externa</div>
              <div className="text-slate-200">
                <strong className="text-indigo-400">{viewerAllowedUsers}</strong> usuarios habilitados para exportación en nómina oficial.
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Hub Cards */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Acceso Rápido a Módulos Administrativos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link
              href="/listing"
              className="bg-[#0e1b29] hover:bg-[#122336] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[#d9251d] transition-colors">
                  Listado de Usuarios
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Filtrar, editar datos, cambiar roles y revisar cédulas subidas.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                <span>{users.length} Registros</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/export"
              className="bg-[#0e1b29] hover:bg-[#122336] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[#d9251d] transition-colors">
                  Exportar & Auditoría
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mosaico de fotos, planillas PDF, exportación Excel y reportes CSV.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                <span>{viewerAllowedUsers} Visibles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/tickets"
              className="bg-[#0e1b29] hover:bg-[#122336] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-[#d9251d] flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[#d9251d] transition-colors">
                  Tickets de Soporte
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Atención de consultas, reclamos y solicitudes técnicas de los usuarios.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                <span>{pendingTickets} Pendientes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/news"
              className="bg-[#0e1b29] hover:bg-[#122336] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[#d9251d] transition-colors">
                  Publicador de Noticias
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Crear y difundir comunicados oficiales y avisos en la plataforma.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                <span>{news.length} Publicaciones</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
