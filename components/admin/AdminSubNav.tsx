'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  FileSpreadsheet,
  MessageSquare,
  Newspaper,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';

export const AdminSubNav: React.FC = () => {
  const pathname = usePathname();
  const { users, tickets, news } = useApp();

  const pendingReviews = users.filter((u) => u.status === 'pendiente').length;
  const pendingTickets = tickets.filter((t) => t.status !== 'Resuelto').length;

  const navItems = [
    {
      href: '/dashboard',
      label: 'Métricas & Gráficos',
      icon: BarChart3,
    },
    {
      href: '/listing',
      label: 'Gestión de Usuarios',
      icon: Users,
      badge: pendingReviews > 0 ? `${pendingReviews} pendientes` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      href: '/export',
      label: 'Exportar & Auditoría',
      icon: FileSpreadsheet,
    },
    {
      href: '/tickets',
      label: 'Tickets',
      icon: MessageSquare,
      badge: pendingTickets > 0 ? `${pendingTickets}` : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      href: '/news',
      label: 'Noticias & Avisos',
      icon: Newspaper,
    },
  ];

  return (
    <div className="w-full bg-[#08111b] border-b border-indigo-900/60 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto py-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 pr-3 border-r border-indigo-800/60">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Panel Admin</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#d9251d] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="text-[11px] text-slate-400 hidden lg:flex items-center gap-2 shrink-0">
          <span>Base de datos: <strong className="text-emerald-400">{users.length}</strong> registros</span>
        </div>
      </div>
    </div>
  );
};
