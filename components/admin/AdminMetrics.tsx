'use client';

import React from 'react';
import Link from 'next/link';
import {
    Users,
    FileCheck,
    MessageSquare,
    Eye,
    FileSpreadsheet,
    Newspaper,
    ArrowRight,
} from 'lucide-react';

interface AdminMetricsProps {
    totalUsers: number;
    approvedUsers: number;
    rejectedUsers: number;
    pendingReviews: number;
    pendingTickets: number;
    viewerAllowedUsers: number;
    newsCount?: number;
    onTabChange: (tab: 'usuarios' | 'revision' | 'tickets' | 'noticias') => void;
    onOpenViewer: () => void;
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({
    totalUsers,
    approvedUsers,
    rejectedUsers,
    pendingReviews,
    pendingTickets,
    viewerAllowedUsers,
    newsCount = 0,
    onTabChange,
    onOpenViewer,
}) => {
    return (
        <div className="space-y-3">
            {/* Metrics Strip 
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Total en Censo
                        </div>
                        <div className="text-2xl font-black text-white font-mono mt-0.5">{totalUsers}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                            <strong className="text-emerald-400">{approvedUsers}</strong> aprobados •{' '}
                            <strong className="text-red-400">{rejectedUsers}</strong> rechazados
                        </div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                <div
                    onClick={() => onTabChange('revision')}
                    className="bg-[#0b1622]/90 border border-slate-700/60 hover:border-amber-500/60 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between cursor-pointer transition-colors"
                >
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Cédulas por Revisar
                        </div>
                        <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                            {pendingReviews}
                        </div>
                        <div className="text-[10px] text-amber-300/80 mt-0.5">En cola para auditar →</div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                    </div>
                </div>

                <div
                    onClick={() => onTabChange('tickets')}
                    className="bg-[#0b1622]/90 border border-slate-700/60 hover:border-red-500/60 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between cursor-pointer transition-colors"
                >
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Tickets Pendientes
                        </div>
                        <div className="text-2xl font-black text-[#d9251d] font-mono mt-0.5">
                            {pendingTickets}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Casos por resolver →</div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-red-500/20 text-[#d9251d] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                </div>

                <div
                    onClick={onOpenViewer}
                    className="bg-[#0b1622]/90 border border-slate-700/60 hover:border-indigo-500/60 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between cursor-pointer transition-colors"
                    title="Haz clic para abrir el Portal de Visor y exportar archivos"
                >
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Visibles en Nómina
                        </div>
                        <div className="text-2xl font-black text-indigo-400 font-mono mt-0.5">
                            {viewerAllowedUsers}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Exportación autorizada →</div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Eye className="w-5 h-5" />
                    </div>
                </div>
            </div>*/}

            {/* Compact Navigation Hub Cards (Matching Metrics Card Height) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link
                    href="/listing"
                    className="bg-slate-100 hover:bg-slate-300 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between gap-2.5 transition-colors group"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-black group-hover:text-blue-800 transition-colors truncate">
                                Listado de Usuarios
                            </span>
                            <span className="text-[10px] font-mono font-bold text-blue-600 shrink-0">
                                ({totalUsers})
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Filtrar, editar datos y revisar cédulas
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                    </div>
                </Link>

                <Link
                    href="/export"
                    className="bg-slate-100 hover:bg-slate-300 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between gap-2.5 transition-colors group"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-black group-hover:text-emerald-600 transition-colors truncate">
                                Exportar & Auditoría
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 shrink-0">
                                ({viewerAllowedUsers})
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-600 truncate mt-0.5">
                            Mosaico PDF, Excel (.xlsx) y CSV
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                    </div>
                </Link>

                <Link
                    href="/tickets"
                    className="bg-slate-100 hover:bg-slate-300 border border-slate-700/60 hover:border-red-500/50 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between gap-2.5 transition-colors group"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-black group-hover:text-[#d9251d] transition-colors truncate">
                                Tickets de Soporte
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#d9251d] shrink-0">
                                ({pendingTickets})
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Consultas y solicitudes técnicas
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-red-500/20 text-[#d9251d] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                </Link>

                <Link
                    href="/news"
                    className="bg-slate-100 hover:bg-slate-300 border border-slate-700/60 hover:border-purple-500/50 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between gap-2.5 transition-colors group"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-black group-hover:text-purple-400 transition-colors truncate">
                                Publicador de Noticias
                            </span>
                            <span className="text-[10px] font-mono font-bold text-purple-400 shrink-0">
                                ({newsCount})
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Comunicados oficiales y avisos
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Newspaper className="w-4 h-4" />
                    </div>
                </Link>
            </div>
        </div>
    );
};