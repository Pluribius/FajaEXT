'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { AppUser } from '@/lib/types';
import { useApp } from '@/components/auth/AppContext';
import {
    getAdminNavItems,
    isLandingRoute,
    type NavItemConfig,
} from '@/components/ui/layout/Header/HeaderConfig';

interface HeaderNavProps {
    scrolled: boolean;
    currentUser: AppUser | null;
    activeView: string;
}

const LANDING_ANCHORS = [
    { href: '#hero', label: 'Inicio' },
    { href: '#proceso', label: 'Proceso y Registro' },
    { href: '#requisitos', label: 'Requerimientos' },
    { href: '#empresas', label: 'Empresas Participantes' },
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
    scrolled,
    currentUser,
    activeView,
}) => {
    const pathname = usePathname();
    const { users, tickets } = useApp();

    if (isLandingRoute(pathname, activeView)) {
        return (
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider">
                {LANDING_ANCHORS.map((anchor) => (
                    <a
                        key={anchor.href}
                        href={anchor.href}
                        className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'
                            }`}
                    >
                        {anchor.label}
                    </a>
                ))}
            </nav>
        );
    }

    if (!currentUser) return null;

    if (currentUser.role === 'admin') {
        const pendingReviews = users.filter((u) => u.status === 'pendiente').length;
        const pendingTickets = tickets.filter((t) => t.status !== 'Resuelto').length;
        const adminLinks = getAdminNavItems(pendingReviews, pendingTickets);

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
                                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                                <span>{item.label}</span>
                                {item.badgeCount !== undefined && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 leading-none rounded-full font-black ${item.badgeClass ?? ''}`}
                                    >
                                        {item.badgeCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        );
    }

    const roleLinks: NavItemConfig[] =
        currentUser.role === 'viewer'
            ? [{ href: '/export', label: 'Exportación & Auditoría' }]
            : [
                { href: '/user', label: 'Mi Portal & Expediente' },
                { href: '/home', label: 'Página Principal' },
            ];

    return (
        <nav className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
            {roleLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors ${pathname === link.href ? 'text-[#d9251d]' : 'text-slate-800 hover:text-slate-950'
                        }`}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
};