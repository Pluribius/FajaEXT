'use client';

import React from 'react';
import { LogOut, LayoutDashboard, Home } from 'lucide-react';
import { AppUser } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderActionsProps {
    currentUser: AppUser | null;
    activeView: string;
    setActiveView: (view: 'landing' | 'portal') => void;
    logout: () => void;
    openAuthModal: (mode: 'login' | 'register') => void;
    scrolled: boolean;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
    currentUser,
    logout,
    openAuthModal,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const isLanding = pathname === '/home' || pathname === '/landing' || pathname === '/';

    const handlePortalToggle = () => {
        if (isLanding) {
            if (currentUser?.role === 'admin') router.push('/dashboard');
            else if (currentUser?.role === 'viewer') router.push('/export');
            else router.push('/user');
        } else {
            router.push('/home');
        }
    };

    return (
        <div className="hidden sm:flex items-center gap-3 min-h-[44px]">
            {currentUser ? (
                <div className="flex items-center gap-3">
                    {/* Go to Main Page / Portal Button */}
                    <button
                        onClick={handlePortalToggle}
                        className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
                    >
                        {isLanding ? (
                            <>
                                <LayoutDashboard className="w-4 h-4 text-[#d9251d]" />
                                <span>
                                    {currentUser.role === 'admin'
                                        ? 'Ir al Dashboard'
                                        : currentUser.role === 'viewer'
                                        ? 'Ir a Exportar'
                                        : 'Ir a Mi Portal'}
                                </span>
                            </>
                        ) : (
                            <>
                                <Home className="w-4 h-4 text-[#d9251d]" />
                                <span>Ver Página Principal</span>
                            </>
                        )}
                    </button>

                    {/* User Badge & Logout */}
                    <div className="flex items-center justify-between gap-2.5 px-4 py-2 rounded-lg shadow-sm border bg-[#0e1b29] text-white border-slate-800">
                        <div className="text-right">
                            <div className="text-xs font-bold truncate max-w-[130px] leading-tight text-white">
                                {currentUser.fullName}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-[#d9251d] tracking-wider">
                                {currentUser.role === 'admin'
                                    ? 'Administrador'
                                    : currentUser.role === 'viewer'
                                        ? 'Visor Autorizado'
                                        : 'Cliente'}
                            </span>
                        </div>

                        <button
                            onClick={logout}
                            title="Cerrar Sesión"
                            className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openAuthModal('register')}
                        className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer shadow-sm bg-slate-100 hover:bg-slate-200 text-[#0e1b29] border border-slate-200"
                    >
                        Registrarse
                    </button>

                    <button
                        onClick={() => openAuthModal('login')}
                        className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#0e1b29] hover:bg-[#1a2c3f] text-white shadow-sm transition-all flex items-center justify-center cursor-pointer border border-slate-800"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            )}
        </div>
    );
};
