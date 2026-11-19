'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppUser } from '@/lib/types';

interface HeaderNavProps {
    scrolled: boolean;
    currentUser: AppUser | null;
    activeView: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ scrolled, currentUser, activeView }) => {
    const pathname = usePathname();

    // If on landing / home view, show the landing anchor links
    if (activeView === 'landing' || pathname === '/home' || pathname === '/landing' || pathname === '/') {
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

    // If user is admin, show admin quick links
    if (currentUser?.role === 'admin') {
        const adminLinks = [
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/listing', label: 'Usuarios' },
            { href: '/export', label: 'Exportar' },
            { href: '/tickets', label: 'Tickets' },
            { href: '/news', label: 'Noticias' },
        ];

        return (
            <nav className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
                {adminLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`transition-colors ${
                                isActive
                                    ? 'text-[#d9251d]'
                                    : scrolled
                                    ? 'text-slate-700 hover:text-[#d9251d]'
                                    : 'text-white/90 hover:text-white'
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        );
    }

    // If viewer
    if (currentUser?.role === 'viewer') {
        return (
            <nav className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
                <Link
                    href="/export"
                    className={`transition-colors ${
                        pathname === '/export' ? 'text-[#d9251d]' : scrolled ? 'text-slate-700' : 'text-white/90'
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
                    className={`transition-colors ${
                        pathname === '/user' ? 'text-[#d9251d]' : scrolled ? 'text-slate-700' : 'text-white/90'
                    }`}
                >
                    Mi Portal & Expediente
                </Link>
                <Link
                    href="/home"
                    className={`transition-colors ${
                        pathname === '/home' ? 'text-[#d9251d]' : scrolled ? 'text-slate-700' : 'text-white/90'
                    }`}
                >
                    Página Principal
                </Link>
            </nav>
        );
    }

    return null;
};
