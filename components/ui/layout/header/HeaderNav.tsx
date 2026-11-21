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
    type LucideIcon,
} from 'lucide-react';
import { AppUser } from '@/lib/types';
import { useApp } from '@/components/auth/AppContext';

interface HeaderNavProps {
    scrolled: boolean;
    currentUser: AppUser | null;
    activeView: string;
}

interface AdminNavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
    badgeColor?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
    scrolled,
    currentUser,
    activeView,
}) => {
    const pathname = usePathname();
    const { users, tickets } = useApp();

    const pendingReviews = users.filter((u) => u.status === 'pendiente').length;
    const pendingTickets = tickets.filter((t) => t.status !== 'Resuelto').length;

    // If on landing / home view, show the landing anchor links
    if (
        activeView === 'landing' ||
        pathname === '/home' ||
        pathname === '/landing' ||
        pathname === '/'
    ) {
        return (
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider">
                <a
                    href="#hero"
                    className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'
                        }`}
                >
                    Inicio
                </a>
                <a
                    href="#proceso"
                    className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'
                        }`}
                >
                    Proceso y Registro
                </a>
                <a
                    href="#requisitos"
                    className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'
                        }`}
                >
                    Requerimientos
                </a>
                <a
                    href="#empresas"
                    className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'
                        }`}
                >
                    Empresas Participantes
                </a>
            </nav>
        );
    }

    // If user is admin, show styled admin nav items adapted from AdminSubNav
    if (currentUser?.role === 'admin') {
        const adminLinks: AdminNavItem[] = [
            {
                href: '/dashboard',
                label: 'Dashboard',
                icon: BarChart3,
            },
            {
                href: '/listing',
                label: 'Usuarios',
                icon: Users,
                badge: pendingReviews > 0 ? `${pendingReviews}` : undefined,
                badgeColor: 'bg-amber-500 text-white',
            },
            {
                href: '/export',
                label: 'Exportar',
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
                label: 'Noticias',
                icon: Newspaper,
            },
        ];

        return (
            <div className="hidden xl:flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider pr-2.5 border-r text-indigo-800 border-slate-300">
                    <ShieldAlert className="w-4 h-4 text-indigo-700" />
                    <span>Admin</span>
                </div>

                <nav className="flex items-center gap-1">
                    {adminLinks.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${isActive
                                    ? 'bg-[#d9251d] text-white shadow-sm'
                                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-200/70'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 leading-none rounded-full font-black ${item.badgeColor}`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        );
    }

    // If viewer
    if (currentUser?.role === 'viewer') {
        return (
            <nav className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
                <Link
                    href="/export"
                    className={`transition-colors ${pathname === '/export'
                        ? 'text-[#d9251d]'
                        : 'text-slate-800 hover:text-slate-950'
                        }`}
                >
                    Exportación & Auditoría
                </Link>
            </nav>
        );
    }

    // If client
    if (currentUser?.role === 'client') {
        return (
            <nav className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
                <Link
                    href="/user"
                    className={`transition-colors ${pathname === '/user'
                        ? 'text-[#d9251d]'
                        : 'text-slate-800 hover:text-slate-950'
                        }`}
                >
                    Mi Portal & Expediente
                </Link>
                <Link
                    href="/home"
                    className={`transition-colors ${pathname === '/home'
                        ? 'text-[#d9251d]'
                        : 'text-slate-800 hover:text-slate-950'
                        }`}
                >
                    Página Principal
                </Link>
            </nav>
        );
    }

    return null;
};