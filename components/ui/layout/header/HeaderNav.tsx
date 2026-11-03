'use client';

import React from 'react';
import { AppUser } from '@/lib/types';

interface HeaderNavProps {
    scrolled: boolean;
    currentUser: AppUser | null;
    activeView: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ scrolled, activeView }) => {
    // Only show nav links when on the landing page
    if (activeView !== 'landing') {
        return null;
    }

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
};