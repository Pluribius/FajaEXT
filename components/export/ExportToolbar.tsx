'use client';

import React from 'react';
import {
    Download,
    FileSpreadsheet,
    LayoutGrid,
    Loader2,
    Printer,
    Users,
    Eye
} from 'lucide-react';
import { ReportLayout } from '@/components/listing/types';

interface ExportToolbarProps {
    isAdmin: boolean;
    totalUsersCount: number;
    allowedUsersCount: number;
    adminScope: 'all' | 'visible';
    isExportingExcel: boolean;
    onAdminScopeChange: (scope: 'all' | 'visible') => void;
    onNavigateToPrint: (layoutOverride?: ReportLayout) => void;
    onExportCSV: () => void;
    onExportExcel: () => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
    isAdmin,
    totalUsersCount,
    allowedUsersCount,
    adminScope,
    isExportingExcel,
    onAdminScopeChange,
    onNavigateToPrint,
    onExportCSV,
    onExportExcel,
}) => {
    return (
        <div className="bg-[#0e1b29] text-white rounded-2xl p-4 sm:p-6 mb-8 shadow-xl border-b-4 border-indigo-600">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">

                {/* Scope Toggle */}
                {isAdmin && (
                    <div className="flex items-center gap-1 bg-[#152538] p-1 rounded-xl border border-slate-700/50 shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                            Alcance
                        </span>
                        <button
                            type="button"
                            onClick={() => onAdminScopeChange('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${adminScope === 'all'
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            Todos ({totalUsersCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => onAdminScopeChange('visible')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${adminScope === 'visible'
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            Visibles ({allowedUsersCount})
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-2.5 w-full lg:w-auto">
                    <button
                        type="button"
                        onClick={() => onNavigateToPrint('mosaic')}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#152538] hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <LayoutGrid className="w-4 h-4 text-amber-400" />
                        <span>Mosaico</span>
                    </button>

                    <button
                        type="button"
                        onClick={onExportCSV}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#152538] hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-purple-400" />
                        <span>CSV</span>
                    </button>

                    <button
                        type="button"
                        onClick={onExportExcel}
                        disabled={isExportingExcel}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#152538] hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isExportingExcel ? (
                            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        )}
                        <span>Excel</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigateToPrint()}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#152538] hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Printer className="w-4 h-4 text-red-400" />
                        <span>Imprimir</span>
                    </button>
                </div>
            </div>
        </div>
    );
};