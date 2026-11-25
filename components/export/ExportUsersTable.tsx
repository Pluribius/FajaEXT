'use client';

import React from 'react';
import {
    CheckCircle2,
    Download,
    LayoutGrid,
    Maximize2,
    Printer,
    Search,
    XCircle,
} from 'lucide-react';
import { AppUser, formatIdNumber, getUserUID } from '@/lib/types';
import { ReportLayout, SelectedDocument } from '@/components/listing/types';

interface ExportUsersTableProps {
    users: AppUser[];
    allowedUsersCount: number;
    searchQuery: string;
    isExportingExcel: boolean;
    onSearchChange: (value: string) => void;
    onSelectDoc: (doc: SelectedDocument) => void;
    onNavigateToPrint: (layoutOverride?: ReportLayout) => void;
    onExportCSV: () => void;
    onExportExcel: () => void;
}

export const ExportUsersTable: React.FC<ExportUsersTableProps> = ({
    users,
    allowedUsersCount,
    searchQuery,
    isExportingExcel,
    onSearchChange,
    onSelectDoc,
    onNavigateToPrint,
    onExportCSV,
    onExportExcel,
}) => {
    return (
        <div className="bg-white rounded-xl border border-slate-900 shadow-sm overflow-hidden text-slate-900">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                <div className="relative w-full md:w-80 lg:w-96">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Filtrar por nombre, cédula, UID, correo..."
                        className="w-full min-h-[42px] md:min-h-[36px] md:h-9 pl-9 pr-4 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>

                <div className="text-xs text-slate-500 font-semibold tabular-nums">
                    Mostrando <strong className="text-slate-800">{users.length}</strong> de{' '}
                    {allowedUsersCount} usuarios autorizados (ordenados por cédula)
                </div>
            </div>

            {/* Desktop & Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-[#0e1b29] text-slate-100 text-[11px] font-semibold uppercase tracking-[0.05em] border-b border-slate-200">
                            {/*<th className="py-3 px-4">UID Control</th>*/}
                            <th className="py-3 px-4">Usuario / Nombre Completo</th>
                            <th className="py-3 px-4">Cédula Oficial</th>
                            <th className="py-3 px-4 text-center">Documento (Cédula)</th>
                            <th className="py-3 px-4">Correo Electrónico</th>
                            <th className="py-3 px-4">Teléfono</th>
                            <th className="py-3 px-4">Fecha Verificación</th>
                            <th className="py-3 px-4">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {users.map((user) => {
                            const uid = getUserUID(user);
                            const isEnabled = user.status === 'aprobado';
                            return (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    {/*<td className="py-3.5 px-4 font-mono font-bold text-indigo-700 text-xs">{uid}</td>*/}
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSelectDoc({
                                                    url: user.idPhotoUrl,
                                                    fullName: user.fullName,
                                                    idNumber: user.idNumber,
                                                    idType: user.idType,
                                                    uid,
                                                })
                                            }
                                            className="group relative inline-block w-16 h-10 rounded-[4px] overflow-hidden border border-slate-300 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all bg-slate-100 cursor-pointer focus:outline-none"
                                            title="Haz clic para ampliar la cédula"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={user.idPhotoUrl}
                                                alt={`Cédula de ${user.fullName}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-0.5">
                                                <Maximize2 className="w-3.5 h-3.5 drop-shadow" />
                                            </div>
                                        </button>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-900 text-sm">{user.fullName}</td>
                                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 text-sm tabular-nums whitespace-nowrap">
                                        {formatIdNumber(user)}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 tabular-nums whitespace-nowrap">{user.phone}</td>
                                    <td className="py-3.5 px-4 text-slate-600">{user.email}</td>
                                    <td className="py-3.5 px-4 text-slate-500 font-mono tabular-nums whitespace-nowrap">
                                        {user.verifiedAt || user.createdAt}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {isEnabled ? (
                                            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span>aprobado</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                                                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                                <span>denied</span>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}

                        {users.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-400">
                                    No se encontraron usuarios que coincidan con la búsqueda o el filtro seleccionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Cards (< 768px) */}
            <div className="md:hidden divide-y divide-slate-200">
                {users.map((user) => {
                    const uid = getUserUID(user);
                    const isEnabled = user.status === 'aprobado';
                    return (
                        <div key={user.id} className="p-3.5 space-y-2.5 bg-white">
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-slate-900 text-sm leading-snug">
                                    {user.fullName}
                                </div>
                                {isEnabled ? (
                                    <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>aprobado</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 shrink-0">
                                        <XCircle className="w-3 h-3 text-red-600 shrink-0" />
                                        <span>denied</span>
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                                <div>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                        Cédula oficial
                                    </span>
                                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                                        {formatIdNumber(user)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                        Teléfono
                                    </span>
                                    <span className="text-slate-700 tabular-nums">
                                        {user.phone}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                        Correo electrónico
                                    </span>
                                    <span className="text-slate-600 break-all">
                                        {user.email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                        Fecha verificación
                                    </span>
                                    <span className="text-slate-500 font-mono tabular-nums">
                                        {user.verifiedAt || user.createdAt}
                                    </span>
                                </div>
                                <div className="flex items-end justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onSelectDoc({
                                                url: user.idPhotoUrl,
                                                fullName: user.fullName,
                                                idNumber: user.idNumber,
                                                idType: user.idType,
                                                uid,
                                            })
                                        }
                                        className="group relative inline-flex items-center justify-center w-20 h-12 min-h-[44px] rounded-[4px] overflow-hidden border border-slate-300 bg-slate-100 cursor-pointer"
                                        title="Haz clic para ampliar la cédula"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={user.idPhotoUrl}
                                            alt={`Cédula de ${user.fullName}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {users.length === 0 && (
                    <div className="py-10 px-4 text-center text-xs text-slate-400">
                        No se encontraron usuarios que coincidan con la búsqueda o el filtro seleccionado.
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>Registro de Ex-trabajadores VER-16 Rev.01.</div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onNavigateToPrint('mosaic')}
                        className="text-amber-700 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Exportar Mosaico (PDF)</span>
                    </button>
                    <span>•</span>
                    <button
                        type="button"
                        onClick={onExportCSV}
                        className="text-indigo-700 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar CSV</span>
                    </button>
                    <span>•</span>
                    <button
                        type="button"
                        onClick={onExportExcel}
                        className="text-emerald-700 hover:underline font-bold cursor-pointer"
                    >
                        {isExportingExcel ? 'Procesando...' : 'Exportar Excel (.xlsx)'}
                    </button>
                    <span>•</span>
                    <button
                        type="button"
                        onClick={() => onNavigateToPrint()}
                        className="text-[#d9251d] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir / PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
};