/*Collapsible options bar for layout (dossier / mosaic / table)
, document width, UID/typography sizing, field toggles, and cache reset.*/
'use client';

import React from 'react';
import {
    LayoutList,
    LayoutGrid,
    Table as TableIcon,
    ZoomIn,
    ZoomOut,
    Type,
    SlidersHorizontal,
    Settings2,
    RotateCw,
    Printer,
    X,
} from 'lucide-react';
import { DEFAULT_REPORT_OPTIONS, ReportLayout, ReportOptions } from '../listing/types';

interface ReportOptionsPanelProps {
    isOpen: boolean;
    options: ReportOptions;
    isClearingCache: boolean;
    onChange: React.Dispatch<React.SetStateAction<ReportOptions>>;
    onClearCache: () => void;
    onPreview: () => void;
    onClose: () => void;
}

const LAYOUT_ITEMS: { id: ReportLayout; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dossier', label: 'Fichas', icon: LayoutList },
    { id: 'mosaic', label: 'Mosaico', icon: LayoutGrid },
    { id: 'table', label: 'Tabla', icon: TableIcon },
];

const WIDTH_PRESETS = [15, 25, 35, 50, 65, 80];

export const ReportOptionsPanel: React.FC<ReportOptionsPanelProps> = ({
    isOpen,
    options,
    isClearingCache,
    onChange,
    onClearCache,
    onPreview,
    onClose,
}) => {
    if (!isOpen) return null;

    const setField = <K extends keyof ReportOptions>(key: K, value: ReportOptions[K]) => {
        onChange((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-8 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700">
                        <Settings2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-wide text-slate-900">
                            Panel de Configuración de Reporte
                        </h3>
                        <p className="text-xs text-slate-500">
                            Ajusta el formato visual, escala de cédulas, fuentes y campos visibles para el documento impreso o exportado.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        disabled={isClearingCache}
                        onClick={onClearCache}
                        className="px-3.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                        title="Fuerza la purga de caché en disco y redescarga todas las imágenes directamente desde Google Drive"
                    >
                        <RotateCw className={`w-3.5 h-3.5 text-amber-700 ${isClearingCache ? 'animate-spin' : ''}`} />
                        <span>{isClearingCache ? 'Purgando y Redescargando...' : 'Forzar Recarga y Limpiar Caché'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onChange(DEFAULT_REPORT_OPTIONS)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Restablecer
                    </button>

                    <button
                        type="button"
                        onClick={onPreview}
                        className="px-4 py-1.5 bg-[#0e1b29] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Previsualizar</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Cerrar panel"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Layout Mode */}
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                            <LayoutList className="w-3.5 h-3.5 text-indigo-600" />
                            1. Formato de Reporte
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            {LAYOUT_ITEMS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setField('reportLayout', id)}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg font-bold border transition-all cursor-pointer ${options.reportLayout === id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
                        {options.reportLayout === 'dossier' && 'Diseño extendido tipo expediente con cédula y ficha completa.'}
                        {options.reportLayout === 'mosaic' && 'Rejilla compacta de carnets optimizada para impresión de mosaicos.'}
                        {options.reportLayout === 'table' && 'Tabla tabular de auditoría estándar con todos los datos.'}
                    </p>
                </div>

                {/* 2. Document Scale & Width */}
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                                2. Ancho Cédula
                            </span>
                            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {options.docWidthPercent}%
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setField('docWidthPercent', Math.max(10, options.docWidthPercent - 5))}
                                className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer shadow-xs"
                                title="Reducir 5%"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>

                            <input
                                type="range"
                                min="10"
                                max="85"
                                step="1"
                                value={options.docWidthPercent}
                                onChange={(e) => setField('docWidthPercent', Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />

                            <button
                                type="button"
                                onClick={() => setField('docWidthPercent', Math.min(85, options.docWidthPercent + 5))}
                                className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer shadow-xs"
                                title="Aumentar 5%"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-6 gap-1 text-[10px]">
                            {WIDTH_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setField('docWidthPercent', preset)}
                                    className={`py-1 rounded font-bold border transition-colors cursor-pointer text-center ${options.docWidthPercent === preset
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {preset}%
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg border border-slate-200/80 mt-3">
                        <input
                            type="checkbox"
                            checked={options.showDocPhoto}
                            onChange={(e) => setField('showDocPhoto', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-slate-800 text-xs font-bold">Mostrar Foto Cédula</span>
                    </label>
                </div>

                {/* 3. UID & Typography */}
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-indigo-600" />
                            3. UID y Tipografía
                        </span>

                        <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded-lg border border-slate-200/80 mb-2.5">
                            <input
                                type="checkbox"
                                checked={options.showUid}
                                onChange={(e) => setField('showUid', e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="text-slate-800 text-xs font-bold">Imprimir Código UID</span>
                        </label>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 text-[11px] font-semibold">Fuente UID:</span>
                                <div className="flex items-center gap-1">
                                    {[
                                        { label: 'S', val: 'text-[10px]' },
                                        { label: 'M', val: 'text-xs' },
                                        { label: 'L', val: 'text-sm' },
                                    ].map((sz) => (
                                        <button
                                            key={sz.val}
                                            type="button"
                                            onClick={() => setField('uidTextSize', sz.val)}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${options.uidTextSize === sz.val
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                                }`}
                                        >
                                            {sz.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 text-[11px] font-semibold">Cédula:</span>
                                <div className="flex items-center gap-1">
                                    {[
                                        { label: 'XS', val: 'text-xs' },
                                        { label: 'S', val: 'text-sm' },
                                        { label: 'M', val: 'text-base' },
                                        { label: 'L', val: 'text-lg' },
                                    ].map((sz) => (
                                        <button
                                            key={sz.val}
                                            type="button"
                                            onClick={() => setField('idNumberTextSize', sz.val)}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${options.idNumberTextSize === sz.val
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                                }`}
                                        >
                                            {sz.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 text-[11px] font-semibold">Nombre:</span>
                                <div className="flex items-center gap-1">
                                    {[
                                        { label: 'S', val: 'text-sm' },
                                        { label: 'M', val: 'text-base' },
                                        { label: 'L', val: 'text-lg' },
                                        { label: 'XL', val: 'text-xl' },
                                    ].map((sz) => (
                                        <button
                                            key={sz.val}
                                            type="button"
                                            onClick={() => setField('nameTextSize', sz.val)}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${options.nameTextSize === sz.val
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                                }`}
                                        >
                                            {sz.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                        Alineación y legibilidad sincronizada para hojas tamaño Carta y Oficio.
                    </div>
                </div>

                {/* 4. Visible Fields & Header Elements */}
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                            4. Campos y Encabezado
                        </span>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {(
                                [
                                    ['showUserEmail', 'Correo'],
                                    ['showUserPhone', 'Teléfono'],
                                    ['showUserDate', 'Fecha Reg.'],
                                    ['showUserStatus', 'Estatus'],
                                    ['showLogo', 'Logo FAJA'],
                                    ['showAuditor', 'Auditor'],
                                    ['showTitle', 'Título'],
                                    ['showDate', 'Fecha Doc.'],
                                ] as const
                            ).map(([key, label]) => (
                                <label
                                    key={key}
                                    className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={options[key]}
                                        onChange={(e) => setField(key, e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                    />
                                    <span className="text-slate-700 text-[11px]">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                        Visibilidad personalizada activa para exportación.
                    </div>
                </div>
            </div>
        </div>
    );
};