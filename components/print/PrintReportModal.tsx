/*Print/PDF preview modal and the three report layouts (dossier, mosaic, table).*/
'use client';

import React from 'react';
import {
    CheckCircle2,
    LayoutGrid,
    LayoutList,
    Printer,
    Table as TableIcon,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { AppUser, formatIdNumber, getUserUID } from '@/lib/types';
import { DocumentImage } from '@/lib/DocumentImage';
import { ReportLayout, ReportOptions } from '../listing/types';

interface PrintReportModalProps {
    isOpen: boolean;
    users: AppUser[];
    auditorName?: string;
    options: ReportOptions;
    onChangeOptions: React.Dispatch<React.SetStateAction<ReportOptions>>;
    onClose: () => void;
    isModal?: boolean;
}

const LAYOUT_BUTTONS: { id: ReportLayout; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dossier', label: 'Fichas', icon: LayoutList },
    { id: 'mosaic', label: 'Mosaico', icon: LayoutGrid },
    { id: 'table', label: 'Tabla', icon: TableIcon },
];

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
    isOpen,
    users,
    auditorName,
    options,
    onChangeOptions,
    onClose,
    isModal = true, // <-- Add this
}) => {
    if (!isOpen) return null;

    const setField = <K extends keyof ReportOptions>(key: K, value: ReportOptions[K]) => {
        onChangeOptions((prev) => ({ ...prev, [key]: value }));
    };

    const toggleField = (
        key:
            | 'showUserEmail'
            | 'showUserPhone'
            | 'showUserDate'
            | 'showUserStatus'
            | 'showUid'
            | 'showLogo'
            | 'showTitle'
            | 'showDocPhoto'
    ) => {
        onChangeOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className={
            isModal
                ? "fixed inset-0 z-[200] flex flex-col items-center justify-start p-4 md:p-8 bg-white overflow-y-auto print:static print:p-0 print:overflow-visible"
                : "w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none"
        }>
            <div className="w-full max-w-none text-slate-800 bg-white">
                {/* Modal Controls Bar - Only show if it's a modal */}
                {isModal && (
                    <div className="mb-4 pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden bg-slate-50 p-3 rounded-xl border">
                        {/* ... existing controls ... */}
                    </div>
                )}

                {/* Report Header */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
                    <div className="flex items-center gap-3">
                        {options.showLogo && (
                            <div className="w-24 h-10 bg-[#0e1b29] rounded flex items-center justify-center text-white font-black text-xl shrink-0">
                                FAJA-EXT
                            </div>
                        )}
                        <div>
                            {options.showTitle && (
                                <h2 className="text-xl font-black text-[#0e1b29] tracking-tight">
                                    ACTA CONVENIO 2026 | REPORTE DE USUARIOS (ORDENADOS POR CÉDULA)
                                </h2>
                            )}
                            {options.showSubtitle && (
                                <div className="text-xs text-slate-500">
                                    8426231108d48965a504d1e9321dcb86b0fd4149.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-right text-xs space-y-0.5">
                        {options.showDate && (
                            <div>
                                <strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}
                            </div>
                        )}
                        {options.showAuditor && (
                            <div>
                                <strong>Auditor:</strong> {auditorName || 'Lic. Mariana Rivas'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Report Body Layouts */}
                {options.reportLayout === 'dossier' && (
                    <div className="mt-4 space-y-4">
                        {users.map((u, i) => {
                            const uid = getUserUID(u);
                            return (
                                <div
                                    key={u.id}
                                    className="border-2 border-slate-300 rounded-xl p-4 bg-white break-inside-avoid flex flex-col md:flex-row items-stretch gap-4"
                                >
                                    <div className="flex-1 flex flex-col justify-between py-1 text-slate-800 min-w-0">
                                        <div>
                                            <div className="flex items-center justify-between gap-3 pb-2.5 mb-3 border-b-2 border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                                                        #{i + 1}
                                                    </span>
                                                    <h3 className={`${options.nameTextSize} font-black text-slate-900`}>{u.fullName}</h3>
                                                </div>
                                                <span
                                                    className={`font-mono ${options.idNumberTextSize} font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded`}
                                                >
                                                    {formatIdNumber(u)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                                                {options.showUserEmail && (
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                            Correo Electrónico
                                                        </span>
                                                        <span className="font-semibold text-slate-800 break-all">{u.email}</span>
                                                    </div>
                                                )}

                                                {options.showUserPhone && (
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                            Teléfono Registrado
                                                        </span>
                                                        <span className="font-semibold text-slate-800">{u.phone}</span>
                                                    </div>
                                                )}

                                                {options.showUserDate && (
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                            Fecha de Aprobación
                                                        </span>
                                                        <span className="font-mono text-slate-700 font-medium">
                                                            {u.verifiedAt || u.createdAt}
                                                        </span>
                                                    </div>
                                                )}

                                                {options.showUserStatus && (
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                            Estado de Verificación
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Aprobado / Auditado</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                            {options.showUid ? (
                                                <span className={`${options.uidTextSize} font-bold text-slate-700`}>CONTROL: {uid}</span>
                                            ) : (
                                                <span />
                                            )}
                                            <span className="text-slate-400">FAJA-EXT</span>
                                        </div>
                                    </div>

                                    {options.showDocPhoto && (
                                        <div
                                            style={{ width: `${options.docWidthPercent}%` }}
                                            className="shrink-0 flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-200 rounded-lg p-2"
                                        >
                                            <div className="w-full aspect-[16/10] bg-white rounded border border-slate-200/80 p-1 flex items-center justify-center overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={u.idPhotoUrl}
                                                    alt={`Cédula de ${u.fullName}`}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {options.reportLayout === 'mosaic' && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
                        {users.map((u, i) => {
                            const uid = getUserUID(u);
                            return (
                                <div
                                    key={u.id}
                                    className="bg-white rounded-xl border-2 border-slate-300 p-6 shadow-sm space-y-4 break-inside-avoid"
                                >
                                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                                        <div>
                                            <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                                                #{i + 1}
                                            </span>
                                            <h4 className={`${options.nameTextSize} font-bold text-slate-900 mt-1.5`}>{u.fullName}</h4>
                                            <div className="text-slate-600 font-mono font-semibold mt-0.5">
                                                Cédula:{' '}
                                                <span className={`${options.idNumberTextSize} text-indigo-700 font-bold`}>
                                                    {formatIdNumber(u)}
                                                </span>
                                            </div>
                                        </div>
                                        {options.showUid && (
                                            <span
                                                className={`${options.uidTextSize} font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded`}
                                            >
                                                CONTROL: {uid}
                                            </span>
                                        )}
                                    </div>

                                    {options.showDocPhoto && (
                                        <div className="relative aspect-[16/10] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center">
                                            <DocumentImage
                                                src={u.idPhotoUrl}
                                                alt={`Cédula ${u.fullName}`}
                                                objectFit="contain"
                                                showOpenButton={true}
                                            />
                                        </div>
                                    )}

                                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {options.showUserEmail && (
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Correo:
                                                </span>
                                                <strong className="text-slate-900 break-all">{u.email}</strong>
                                            </div>
                                        )}

                                        {options.showUserPhone && (
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Teléfono:
                                                </span>
                                                <strong className="text-slate-900">{u.phone || 'No registrado'}</strong>
                                            </div>
                                        )}

                                        {options.showUserDate && (
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Fecha Verificación:
                                                </span>
                                                <span className="font-mono text-slate-800">{u.verifiedAt || u.createdAt}</span>
                                            </div>
                                        )}

                                        {options.showUserStatus && (
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Estatus:
                                                </span>
                                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span className="capitalize">{u.status}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {options.reportLayout === 'table' && (
                    <table className="w-full text-left text-xs border border-slate-200 mt-4">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <th className="p-2 border-r text-center w-10">N°</th>
                                {options.showUid && <th className="p-2 border-r">UID Control</th>}
                                <th className="p-2 border-r">Cédula</th>
                                <th className="p-2 border-r">Nombre Completo</th>
                                {options.showDocPhoto && (
                                    <th style={{ width: `${options.docWidthPercent}%` }} className="p-2 border-r text-center">
                                        Doc. Identidad
                                    </th>
                                )}
                                {options.showUserEmail && <th className="p-2 border-r">Correo</th>}
                                {options.showUserPhone && <th className="p-2 border-r">Teléfono</th>}
                                {options.showUserDate && <th className="p-2 border-r">Fecha</th>}
                                {options.showUserStatus && <th className="p-2">Estatus</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {users.map((u, i) => (
                                <tr key={u.id} className="break-inside-avoid">
                                    <td className="p-2 border-r font-mono text-center">{i + 1}</td>
                                    {options.showUid && (
                                        <td className={`p-1 border-r font-mono text-indigo-700 font-bold ${options.uidTextSize}`}>
                                            {getUserUID(u)}
                                        </td>
                                    )}
                                    <td className={`p-2 border-r font-mono ${options.idNumberTextSize}`}>{formatIdNumber(u)}</td>
                                    <td className={`p-2 border-r font-bold ${options.nameTextSize}`}>{u.fullName}</td>
                                    {options.showDocPhoto && (
                                        <td className="p-2 border-r text-center align-middle">
                                            <div className="w-full aspect-[16/10] mx-auto bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={u.idPhotoUrl}
                                                    alt={`Cédula ${formatIdNumber(u)}`}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </td>
                                    )}
                                    {options.showUserEmail && <td className="p-2 border-r">{u.email}</td>}
                                    {options.showUserPhone && <td className="p-2 border-r">{u.phone}</td>}
                                    {options.showUserDate && <td className="p-2 border-r">{u.verifiedAt || u.createdAt}</td>}
                                    {options.showUserStatus && <td className="p-2 text-emerald-700 font-bold">Aprobado</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};