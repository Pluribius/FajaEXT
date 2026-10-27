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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total en Supabase</div>
                    <div className="text-3xl font-black text-slate-900 mt-1">{totalUsers}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        {approvedUsers} aprobados • {rejectedUsers} rechazados
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0e1b29] flex items-center justify-center">
                    <Users className="w-6 h-6" />
                </div>
            </div>

            <div
                onClick={() => onTabChange('revision')}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
            >
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cédulas por Revisar</div>
                    <div className="text-3xl font-black text-amber-600 mt-1">{pendingReviews}</div>
                    <div className="text-[11px] text-amber-700 mt-1">Haz clic para revisar en cola</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                </div>
            </div>

            <div
                onClick={() => onTabChange('tickets')}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-400 transition-colors"
            >
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets Pendientes</div>
                    <div className="text-3xl font-black text-[#d9251d] mt-1">{pendingTickets}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Casos que requieren solución</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#d9251d] flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                </div>
            </div>

            <div
                onClick={onOpenViewer}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all"
                title="Haz clic para abrir el Portal de Visor y exportar archivos"
            >
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lista para Visores</div>
                    <div className="text-3xl font-black text-indigo-700 mt-1">{viewerAllowedUsers}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Visibles en auditoría externa (Clic para ver)</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};