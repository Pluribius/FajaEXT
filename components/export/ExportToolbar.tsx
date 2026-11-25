'use client';

import React from 'react';
import {
    Download,
    FileSpreadsheet,
    LayoutGrid,
    Loader2,
    Printer,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { ReportLayout } from '@/components/listing/types';

interface ExportToolbarProps {
    isAdmin: boolean;
    visibleUsersCount: number;
    invisibleUsersCount: number;
    approvedUsersCount: number;
    rejectedUsersCount: number;
    showVisibleScope: boolean;
    showInvisibleScope: boolean;
    showApprovedStatus: boolean;
    showRejectedStatus: boolean;
    isExportingExcel: boolean;
    onToggleVisibleScope: () => void;
    onToggleInvisibleScope: () => void;
    onToggleApprovedStatus: () => void;
    onToggleRejectedStatus: () => void;
    onNavigateToPrint: (layoutOverride?: ReportLayout) => void;
    onExportCSV: () => void;
    onExportExcel: () => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
    isAdmin,
    visibleUsersCount,
    invisibleUsersCount,
    approvedUsersCount,
    rejectedUsersCount,
    showVisibleScope,
    showInvisibleScope,
    showApprovedStatus,
    showRejectedStatus,
    isExportingExcel,
    onToggleVisibleScope,
    onToggleInvisibleScope,
    onToggleApprovedStatus,
    onToggleRejectedStatus,
    onNavigateToPrint,
    onExportCSV,
    onExportExcel,
}) => {
    return (
        <div className="bg-[#0e1b29] text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6 shadow-xl border-b-4 border-indigo-600">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 w-full">

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    {/* Scope Toggle: Visibles (default ON) & Invisibles (default OFF) */}
                    {isAdmin && (
                        <div className="flex items-center gap-1.5 bg-[#152538] p-1 rounded-xl border border-slate-700/50 overflow-x-auto">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 shrink-0">
                                Alcance
                            </span>
                            <button
                                type="button"
                                onClick={onToggleInvisibleScope}
                                className={`min-h-[40px] md:min-h-[34px] md:h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap tabular-nums shrink-0 ${showInvisibleScope
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                            >
                                <EyeOff className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                                <span>Invisibles ({invisibleUsersCount})</span>
                            </button>
                            <button
                                type="button"
                                onClick={onToggleVisibleScope}
                                className={`min-h-[40px] md:min-h-[34px] md:h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap tabular-nums shrink-0 ${showVisibleScope
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                            >
                                <Eye className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                                <span>Visibles ({visibleUsersCount})</span>
                            </button>
                        </div>
                    )}

                    {/* Status Toggle: Aprobados (default ON) & Rechazados (default OFF) */}
                    <div className="flex items-center gap-1.5 bg-[#152538] p-1 rounded-xl border border-slate-700/50 overflow-x-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 shrink-0">
                            Estado
                        </span>
                        <button
                            type="button"
                            onClick={onToggleApprovedStatus}
                            className={`min-h-[40px] md:min-h-[34px] md:h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap tabular-nums shrink-0 ${showApprovedStatus
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                            <span>Aprobados ({approvedUsersCount})</span>
                        </button>
                        <button
                            type="button"
                            onClick={onToggleRejectedStatus}
                            className={`min-h-[40px] md:min-h-[34px] md:h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap tabular-nums shrink-0 ${showRejectedStatus
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            <XCircle className="w-3.5 h-3.5 text-red-300 shrink-0" />
                            <span>Rechazados ({rejectedUsersCount})</span>
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap lg:flex-nowrap items-stretch gap-2.5 w-full lg:w-auto">
                    <button
                        type="button"
                        onClick={() => onNavigateToPrint('mosaic')}
                        className="min-h-[40px] md:min-h-[36px] md:h-9 px-3.5 py-2 bg-[#152538] hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                        <LayoutGrid className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Mosaico</span>
                    </button>

                    <button
                        type="button"
                        onClick={onExportCSV}
                        className="min-h-[40px] md:min-h-[36px] md:h-9 px-3.5 py-2 bg-[#152538] hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                        <Download className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>CSV</span>
                    </button>

                    <button
                        type="button"
                        onClick={onExportExcel}
                        disabled={isExportingExcel}
                        className="min-h-[40px] md:min-h-[36px] md:h-9 px-3.5 py-2 bg-[#152538] hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                        {isExportingExcel ? (
                            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                        ) : (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span>Excel</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigateToPrint()}
                        className="min-h-[40px] md:min-h-[36px] md:h-9 px-3.5 py-2 bg-[#152538] hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                        <Printer className="w-4 h-4 text-red-400" />
                        <span>Imprimir</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
