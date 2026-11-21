'use client';

import React from 'react';
import { Users, FileCheck, MessageSquare, Eye } from 'lucide-react';

interface AdminMetricsProps {
    totalUsers: number;
    approvedUsers: number;
    rejectedUsers: number;
    pendingReviews: number;
    pendingTickets: number;
    viewerAllowedUsers: number;
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
    onTabChange,
    onOpenViewer,
}) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-3.5 shadow-sm backdrop-blur-md flex items-center justify-between">
                <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total en Censo</div>
                    <div className="text-2xl font-black text-white font-mono mt-0.5">{totalUsers}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                        <strong className="text-emerald-400">{approvedUsers}</strong> aprobados • <strong className="text-red-400">{rejectedUsers}</strong> rechazados
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
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cédulas por Revisar</div>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{pendingReviews}</div>
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
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tickets Pendientes</div>
                    <div className="text-2xl font-black text-[#d9251d] font-mono mt-0.5">{pendingTickets}</div>
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
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visibles en Nómina</div>
                    <div className="text-2xl font-black text-indigo-400 font-mono mt-0.5">{viewerAllowedUsers}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Exportación autorizada →</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Eye className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};
