'use client';

import React from 'react';
import {
    CheckCircle2,
    Download,
    LayoutGrid,
    Maximize2,
    Printer,
    Search,
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
            <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Filtrar por nombre, cédula, UID, correo..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                    Mostrando <strong className="text-slate-800">{users.length}</strong> de{' '}
                    {allowedUsersCount} usuarios autorizados (ordenados por cédula)
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3.5 px-4">UID Control</th>
                            <th className="py-3.5 px-4">Usuario / Nombre Completo</th>
                            <th className="py-3.5 px-4">Cédula Oficial</th>
                            <th className="py-3.5 px-4 text-center">Documento (Cédula)</th>
                            <th className="py-3.5 px-4">Correo Electrónico</th>
                            <th className="py-3.5 px-4">Teléfono</th>
                            <th className="py-3.5 px-4">Fecha Verificación</th>
                            <th className="py-3.5 px-4">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => {
                            const uid = getUserUID(user);
                            return (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 text-xs">{uid}</td>
                                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{user.fullName}</td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                        {formatIdNumber(user)}
                                    </td>
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
                                            className="group relative inline-block w-24 h-16 rounded-lg overflow-hidden border-2 border-slate-200 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all bg-slate-100 cursor-pointer focus:outline-none"
                                            title="Haz clic para ampliar la cédula"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={user.idPhotoUrl}
                                                alt={`Cédula de ${user.fullName}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-0.5">
                                                <Maximize2 className="w-4 h-4 drop-shadow" />
                                                <span className="text-[10px] font-bold drop-shadow">Ampliar</span>
                                            </div>
                                        </button>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600">{user.email}</td>
                                    <td className="py-3.5 px-4 text-slate-600">{user.phone}</td>
                                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                                        {user.verifiedAt || user.createdAt}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Aprobado</span>
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}

                        {users.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-slate-400">
                                    No se encontraron usuarios aprobados que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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