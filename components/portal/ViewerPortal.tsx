'use client';

import React, { useState } from 'react';
import {
  Eye,
  Download,
  FileSpreadsheet,
  Printer,
  Search,
  CheckCircle2,
  ExternalLink,
  X,
  SlidersHorizontal,
  ChevronDown,
  Maximize2,
  Settings2,
  ZoomIn,
  ZoomOut,
  LayoutList,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
  Type,
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { getUserUID, formatIdNumber } from '@/lib/types';
import { DocumentImage } from '@/components/ui/DocumentImage';
import { getOriginalDocumentUrl } from '@/lib/documentUtils';
import ExcelJS from 'exceljs';

// In-memory cache for images to prevent redundant downloads and speed up rendering
const imageCache = new Map<string, string>();

/**
 * Helper to fetch, downscale, and cache an image as a Base64 data URI.
 * Essential for ExcelJS embedding and fast PDF/Print rendering.
 */
async function fetchAndCacheImageAsBase64(url: string, maxWidth = 300, maxHeight = 180): Promise<string> {
  if (!url) return '';
  if (imageCache.has(url)) {
    console.log(`⚡ [Cache Hit] Using cached image for: ${url.substring(0, 40)}...`);
    return imageCache.get(url)!;
  }

  try {
    console.log(`📥 [Download / Cache] Fetching image from source: ${url.substring(0, 50)}...`);
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Downscale dimensions if they exceed max thresholds to keep Excel size small
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string || '');
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          console.log(`✂️ [Downscale] Image resized to ${width}x${height}px`);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    imageCache.set(url, base64);
    console.log(`✅ [Cache Store] Image successfully cached.`);
    return base64;
  } catch (err) {
    console.warn(`⚠️ [Cache Warning] Failed to fetch/downscale image as base64, falling back to original URL:`, err);
    return url;
  }
}

export const ViewerPortal = () => {
  const { currentUser, users } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<{
    url: string;
    fullName: string;
    idNumber: string;
    idType?: boolean;
    uid: string;
  } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Configuration for toggling elements and text sizing in official reports
  const [headerOptions, setHeaderOptions] = useState({
    showLogo: true,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showAuditor: true,
    showReference: true,
    showDocPhoto: true,
    showUserEmail: true,
    showUserPhone: true,
    showUserStatus: true,
    showUserDate: true,

    // UID & Typography configuration
    showUid: true,
    uidTextSize: 'text-xs',
    idNumberTextSize: 'text-sm',
    nameTextSize: 'text-base',

    docWidthPercent: 35,
    reportLayout: 'dossier' as 'dossier' | 'mosaic' | 'table',
  });

  const [adminScope, setAdminScope] = useState<'all' | 'visible'>('all');

  const allowedUsers = users.filter((u) => u.visibleToViewers);
  const baseUsers = currentUser?.role === 'admin'
    ? (adminScope === 'all' ? users : allowedUsers)
    : allowedUsers;

  // Filter and sort users by ID number (cédula) from lower to higher numerically[cite: 3]
  const filteredUsers = baseUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const uid = getUserUID(u).toLowerCase();
    const formattedId = formatIdNumber(u).toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.idNumber.includes(q) ||
      formattedId.includes(q) ||
      u.phone.includes(q) ||
      uid.includes(q)
    );
  }).sort((a, b) => {
    const numA = parseInt(a.idNumber.replace(/[^0-9]/g, '') || '0', 10);
    const numB = parseInt(b.idNumber.replace(/[^0-9]/g, '') || '0', 10);
    return numA - numB;
  });

  // Export to CSV[cite: 3]
  const handleExportCSV = () => {
    console.log('📊 [Export CSV] Generating CSV export package...');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const headers = [
      'N°',
      'UID Control',
      'Nombre Completo',
      'Cedula',
      'Documento Identidad URL',
      'Correo',
      'Telefono',
      'Estatus',
      'Fecha de Registro',
      'Fecha Verificacion',
    ];
    const rows = filteredUsers.map((u, idx) => {
      const docUrl = u.idPhotoUrl.startsWith('http') || u.idPhotoUrl.startsWith('data:')
        ? u.idPhotoUrl
        : `${origin}${u.idPhotoUrl}`;

      return [
        `"${idx + 1}"`,
        `"${getUserUID(u)}"`,
        `"${u.fullName}"`,
        `"${formatIdNumber(u)}"`,
        `"${docUrl}"`,
        `"${u.email}"`,
        `"${u.phone}"`,
        `"${u.status.toUpperCase()}"`,
        `"${u.createdAt}"`,
        `"${u.verifiedAt || 'N/A'}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nomina_Usuarios_Autorizados_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('✅ [Export CSV] Download triggered successfully.');
  };

  // Export to True Excel (.xlsx) using ExcelJS with Native Embedded & Downscaled Images[cite: 3]
  const handleExportExcel = async () => {
    if (isExportingExcel) return;
    setIsExportingExcel(true);
    console.log(`📊 [ExcelJS] Starting native .xlsx export for ${filteredUsers.length} records...`);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FAJA-EXT System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Usuarios Autorizados', {
        views: [{ showGridLines: true }]
      });

      // Define Column Layout & Widths
      worksheet.columns = [
        { header: 'N°', key: 'index', width: 6 },
        { header: 'UID Control', key: 'uid', width: 16 },
        { header: 'Nombre Completo', key: 'fullName', width: 32 },
        { header: 'Cédula', key: 'idNumber', width: 16 },
        { header: 'Cédula Digitalizada (Imagen)', key: 'image', width: 26 },
        { header: 'Correo Electrónico', key: 'email', width: 28 },
        { header: 'Teléfono', key: 'phone', width: 18 },
        { header: 'Estatus', key: 'status', width: 14 },
        { header: 'Fecha Registro', key: 'createdAt', width: 20 },
      ];

      // Style Header Row
      const headerRow = worksheet.getRow(1);
      headerRow.height = 28;
      headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0E1B29' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      for (let idx = 0; idx < filteredUsers.length; idx++) {
        const u = filteredUsers[idx];
        const rowNumber = idx + 2;
        console.log(`🖼️ [ExcelJS] Processing record ${idx + 1} of ${filteredUsers.length}: ${u.fullName}`);

        // Add row data (leaving image column blank for the image placement)
        const row = worksheet.addRow({
          index: idx + 1,
          uid: getUserUID(u),
          fullName: u.fullName,
          idNumber: formatIdNumber(u),
          image: '',
          email: u.email,
          phone: u.phone || 'N/A',
          status: u.status.toUpperCase(),
          createdAt: u.verifiedAt || u.createdAt,
        });

        // Configure row height and vertical alignment
        row.height = 75; // sufficient height for embedded image
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        row.font = { name: 'Arial', size: 10 };

        // Center alignment for specific columns
        row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };

        // Fetch, downscale and embed image natively
        if (u.idPhotoUrl) {
          try {
            const base64DataUri = await fetchAndCacheImageAsBase64(u.idPhotoUrl, 280, 160);
            const base64Clean = base64DataUri.replace(/^data:image\/\w+;base64,/, '');

            const imageId = workbook.addImage({
              base64: base64Clean,
              extension: 'jpeg',
            });

            // Embed image into Column E (index 4, 0-indexed) at the specific row
            worksheet.addImage(imageId, {
              tl: { col: 4, row: idx + 1 }, // Column E, Row index
              ext: { width: 140, height: 85 } // Display dimensions inside cell
            });
          } catch (imgErr) {
            console.warn(`⚠️ [ExcelJS] Failed to embed image for ${u.fullName}:`, imgErr);
            row.getCell(5).value = '[Imagen No Disponible]';
          }
        }
      }

      console.log('💾 [ExcelJS] Generating .xlsx binary buffer...');
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Usuarios_Nativo_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('🎉 [ExcelJS] Native Excel export completed successfully!');
    } catch (error) {
      console.error('❌ [ExcelJS] Error generating Excel file:', error);
      alert('Hubo un error al generar el archivo Excel.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleOpenPrintModal = async () => {
    console.log('🖨️ [Print/PDF] Initializing print/PDF preview frame...');
    console.log(`📥 [Print/PDF] Pre-caching ${filteredUsers.length} user ID documents for smooth rendering...`);

    for (const u of filteredUsers) {
      if (u.idPhotoUrl) {
        await fetchAndCacheImageAsBase64(u.idPhotoUrl, 400, 250);
      }
    }

    setIsPrintModalOpen(true);
    console.log('✨ [Print/PDF] Print frame ready and displayed.');
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* Welcome Header */}
        <div className="bg-[#0e1b29] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl border-b-4 border-indigo-600">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-white/10 px-2.5 py-0.5 rounded">
                  Módulo de Visor / Auditoría
                </span>
                <span className="text-xs text-slate-300">
                  Acceso de Solo Lectura y Exportación
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Registros de Usuarios Autorizados (Ordenados por Cédula)
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Como visor, puedes examinar la nómina de usuarios aprobados ordenada de menor a mayor cédula[cite: 3]. Cuentas con herramientas para exportar reportes en formatos CSV y Excel nativo con imágenes incrustadas.
              </p>
            </div>

            {/* Quick Export Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {currentUser?.role === 'admin' && (
                <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs mr-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Alcance:
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdminScope('all')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${adminScope === 'all'
                      ? 'bg-[#d9251d] text-white shadow'
                      : 'text-slate-300 hover:text-white'
                      }`}
                  >
                    Todos ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminScope('visible')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${adminScope === 'visible'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                      }`}
                  >
                    Visibles ({allowedUsers.length})
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsOptionsOpen((prev) => !prev)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer shadow ${isOptionsOpen
                  ? 'bg-indigo-500 border-indigo-400 text-white ring-2 ring-indigo-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                title="Configurar opciones avanzadas y diseño del reporte a imprimir"
              >
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span>Configurar Reporte</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOptionsOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={async () => {
                  setHeaderOptions((p) => ({ ...p, reportLayout: 'mosaic' }));
                  await handleOpenPrintModal();
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Mosaico (PDF)</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Generar archivo Excel .xlsx con imágenes incrustadas de forma nativa"
              >
                {isExportingExcel ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>{isExportingExcel ? 'Procesando...' : 'Excel (.xlsx)'}</span>
              </button>

              <button
                onClick={handleOpenPrintModal}
                className="px-4 py-2.5 bg-[#d9251d] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Report Controls Grid Panel (Collapsible / Expandable) */}
        {isOptionsOpen && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-8 transition-all animate-in fade-in slide-in-from-top-4 duration-200">
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHeaderOptions({
                    showLogo: true,
                    showTitle: true,
                    showSubtitle: true,
                    showDate: true,
                    showAuditor: true,
                    showReference: true,
                    showDocPhoto: true,
                    showUserEmail: true,
                    showUserPhone: true,
                    showUserStatus: true,
                    showUserDate: true,
                    showUid: true,
                    uidTextSize: 'text-xs',
                    idNumberTextSize: 'text-sm',
                    nameTextSize: 'text-base',
                    docWidthPercent: 35,
                    reportLayout: 'dossier',
                  })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Restablecer predeterminados
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleOpenPrintModal();
                  }}
                  className="px-4 py-1.5 bg-[#0e1b29] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Previsualizar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOptionsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Cerrar panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Symmetrical 4-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Column 1: Layout Mode */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <LayoutList className="w-3.5 h-3.5 text-indigo-600" />
                    1. Formato de Reporte
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setHeaderOptions((p) => ({ ...p, reportLayout: 'dossier' }))}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg font-bold border transition-all cursor-pointer ${headerOptions.reportLayout === 'dossier'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <LayoutList className="w-5 h-5" />
                      <span className="text-xs">Fichas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHeaderOptions((p) => ({ ...p, reportLayout: 'mosaic' }))}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg font-bold border transition-all cursor-pointer ${headerOptions.reportLayout === 'mosaic'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <LayoutGrid className="w-5 h-5" />
                      <span className="text-xs">Mosaico</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHeaderOptions((p) => ({ ...p, reportLayout: 'table' }))}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg font-bold border transition-all cursor-pointer ${headerOptions.reportLayout === 'table'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <TableIcon className="w-5 h-5" />
                      <span className="text-xs">Tabla</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
                  {headerOptions.reportLayout === 'dossier' && 'Diseño extendido tipo expediente con cédula y ficha completa.'}
                  {headerOptions.reportLayout === 'mosaic' && 'Rejilla compacta de carnets optimizada para impresión de mosaicos.'}
                  {headerOptions.reportLayout === 'table' && 'Tabla tabular de auditoría estándar con todos los datos.'}
                </p>
              </div>

              {/* Column 2: Document Scale & Width */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                      2. Ancho Cédula
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {headerOptions.docWidthPercent}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setHeaderOptions((p) => ({ ...p, docWidthPercent: Math.max(10, p.docWidthPercent - 5) }))}
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
                      value={headerOptions.docWidthPercent}
                      onChange={(e) => setHeaderOptions({ ...headerOptions, docWidthPercent: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />

                    <button
                      type="button"
                      onClick={() => setHeaderOptions((p) => ({ ...p, docWidthPercent: Math.min(85, p.docWidthPercent + 5) }))}
                      className="p-1.5 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer shadow-xs"
                      title="Aumentar 5%"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-1 text-[10px]">
                    {[
                      { label: '15%', val: 15 },
                      { label: '25%', val: 25 },
                      { label: '35%', val: 35 },
                      { label: '50%', val: 50 },
                      { label: '65%', val: 65 },
                      { label: '80%', val: 80 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setHeaderOptions((p) => ({ ...p, docWidthPercent: preset.val }))}
                        className={`py-1 rounded font-bold border transition-colors cursor-pointer text-center ${headerOptions.docWidthPercent === preset.val
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg border border-slate-200/80 mt-3">
                  <input
                    type="checkbox"
                    checked={headerOptions.showDocPhoto}
                    onChange={(e) => setHeaderOptions({ ...headerOptions, showDocPhoto: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-slate-800 text-xs font-bold">Mostrar Foto Cédula</span>
                </label>
              </div>

              {/* Column 3: UID & Typography */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-indigo-600" />
                    3. UID y Tipografía
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded-lg border border-slate-200/80 mb-2.5">
                    <input
                      type="checkbox"
                      checked={headerOptions.showUid}
                      onChange={(e) => setHeaderOptions({ ...headerOptions, showUid: e.target.checked })}
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
                            onClick={() => setHeaderOptions({ ...headerOptions, uidTextSize: sz.val })}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${headerOptions.uidTextSize === sz.val
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
                            onClick={() => setHeaderOptions({ ...headerOptions, idNumberTextSize: sz.val })}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${headerOptions.idNumberTextSize === sz.val
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
                            onClick={() => setHeaderOptions({ ...headerOptions, nameTextSize: sz.val })}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${headerOptions.nameTextSize === sz.val
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

              {/* Column 4: Visible Fields & Header Elements */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    4. Campos y Encabezado
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={headerOptions.showUserEmail}
                        onChange={(e) => setHeaderOptions({ ...headerOptions, showUserEmail: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-700 text-[11px]">Correo</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={headerOptions.showUserPhone}
                        onChange={(e) => setHeaderOptions({ ...headerOptions, showUserPhone: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-700 text-[11px]">Teléfono</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={headerOptions.showUserDate}
                        onChange={(e) => setHeaderOptions({ ...headerOptions, showUserDate: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-700 text-[11px]">Fecha Reg.</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={headerOptions.showUserStatus}
                        onChange={(e) => setHeaderOptions({ ...headerOptions, showUserStatus: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-700 text-[11px]">Estatus</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={headerOptions.showLogo}
                        onChange={(e) => setHeaderOptions({ ...headerOptions, showLogo: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-700 text-[11px]">Logo FAJA</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={headerOptions.showAuditor}
                        onChange={(e) => setHeaderOptions({ ...headerOptions, showAuditor: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-700 text-[11px]">Auditor</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={headerOptions.showTitle}
                        onChange={(e) => setHeaderOptions({ ...headerOptions, showTitle: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-700 text-[11px]">Título</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={headerOptions.showDate}
                        onChange={(e) => setHeaderOptions({ ...headerOptions, showDate: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-700 text-[11px]">Fecha Doc.</span>
                    </label>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                  Visibilidad personalizada activa para exportación.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Main Data Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Search and Filter Bar */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nombre, cédula, UID, correo..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Mostrando <strong className="text-slate-800">{filteredUsers.length}</strong> de {allowedUsers.length} usuarios autorizados (ordenados por cédula)[cite: 3]
            </div>
          </div>

          {/* Table */}
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
                {filteredUsers.map((user) => {
                  const uid = getUserUID(user);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 text-xs">
                        {uid}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {user.fullName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {formatIdNumber(user)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc({
                            url: user.idPhotoUrl,
                            fullName: user.fullName,
                            idNumber: user.idNumber,
                            idType: user.idType,
                            uid,
                          })}
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
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{user.verifiedAt || user.createdAt}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aprobado</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
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
                onClick={async () => {
                  setHeaderOptions((p) => ({ ...p, reportLayout: 'mosaic' }));
                  await handleOpenPrintModal();
                }}
                className="text-amber-700 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Exportar Mosaico (PDF)</span>
              </button>
              <span>•</span>
              <button onClick={handleExportCSV} className="text-indigo-700 hover:underline font-bold cursor-pointer">
                Descargar CSV
              </button>
              <span>•</span>
              <button onClick={handleExportExcel} className="text-emerald-700 hover:underline font-bold cursor-pointer">
                {isExportingExcel ? 'Procesando...' : 'Exportar Excel (.xlsx)'}
              </button>
              <span>•</span>
              <button
                onClick={() => setIsOptionsOpen((prev) => !prev)}
                className="text-slate-700 hover:text-indigo-600 font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Configuración de Reporte</span>
              </button>
              <span>•</span>
              <button
                onClick={handleOpenPrintModal}
                className="text-[#d9251d] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDoc && (
        <div
          onClick={() => setSelectedDoc(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-2xl p-5 shadow-2xl cursor-default border border-slate-200"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 block">
                  Documento de Identidad Oficial • {selectedDoc.uid}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedDoc.fullName}
                  <span className="ml-2 font-mono text-sm text-slate-500 font-normal">
                    ({formatIdNumber(selectedDoc)})
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl overflow-hidden p-2 flex items-center justify-center border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedDoc.url}
                alt={`Cédula de ${selectedDoc.fullName}`}
                className="w-full h-auto rounded-lg object-contain max-h-[70vh] shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE REPORT MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start p-4 md:p-8 bg-white overflow-y-auto print:absolute print:inset-0 print:m-0 print:p-0 print:h-auto print:overflow-visible">
          <div className="w-full max-w-none text-slate-800 bg-white">

            {/* Modal Controls Bar */}
            <div className="mb-4 pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden bg-slate-50 p-3 rounded-xl border">

              {/* Layout Switcher */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide mr-1">Diseño:</span>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, reportLayout: 'dossier' }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 border cursor-pointer ${headerOptions.reportLayout === 'dossier' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
                >
                  <LayoutList className="w-3.5 h-3.5" /> Fichas
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, reportLayout: 'mosaic' }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 border cursor-pointer ${headerOptions.reportLayout === 'mosaic' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Mosaico
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, reportLayout: 'table' }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 border cursor-pointer ${headerOptions.reportLayout === 'table' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
                >
                  <TableIcon className="w-3.5 h-3.5" /> Tabla
                </button>
              </div>

              {/* Document Width Controls */}
              {headerOptions.showDocPhoto && (
                <div className="flex items-center gap-2 pl-3 border-l border-slate-300">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                    Ancho Cédula:
                  </span>
                  <button
                    type="button"
                    onClick={() => setHeaderOptions((p) => ({ ...p, docWidthPercent: Math.max(10, p.docWidthPercent - 5) }))}
                    className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded min-w-[50px] text-center">
                    {headerOptions.docWidthPercent}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setHeaderOptions((p) => ({ ...p, docWidthPercent: Math.min(85, p.docWidthPercent + 5) }))}
                    className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min="10"
                    max="85"
                    step="1"
                    value={headerOptions.docWidthPercent}
                    onChange={(e) => setHeaderOptions({ ...headerOptions, docWidthPercent: Number(e.target.value) })}
                    className="w-20 sm:w-28 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hidden sm:inline-block"
                  />
                </div>
              )}

              {/* Data Toggles */}
              <div className="flex items-center gap-1 pl-3 border-l border-slate-300 text-xs">
                <span className="text-[11px] font-bold text-slate-600">Datos:</span>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, showUserEmail: !p.showUserEmail }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${headerOptions.showUserEmail ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'}`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, showUserPhone: !p.showUserPhone }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${headerOptions.showUserPhone ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'}`}
                >
                  Teléfono
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, showUserDate: !p.showUserDate }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${headerOptions.showUserDate ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'}`}
                >
                  Fecha
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, showUserStatus: !p.showUserStatus }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${headerOptions.showUserStatus ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'}`}
                >
                  Estatus
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, showUid: !p.showUid }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${headerOptions.showUid ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'}`}
                >
                  UID
                </button>
              </div>

              {/* Header Element Toggles */}
              <div className="flex flex-wrap items-center gap-1 text-xs pl-2 border-l border-slate-300">
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, showLogo: !p.showLogo }))}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${headerOptions.showLogo ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'}`}
                >
                  Logo
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, showTitle: !p.showTitle }))}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${headerOptions.showTitle ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'}`}
                >
                  Título
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderOptions((p) => ({ ...p, showDocPhoto: !p.showDocPhoto }))}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${headerOptions.showDocPhoto ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'}`}
                >
                  Cédulas
                </button>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('🖨️ [Print Trigger] Opening browser print dialog...');
                    window.print();
                  }}
                  className="px-5 py-2 bg-[#0e1b29] hover:bg-[#1a2c3f] text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              </div>
            </div>

            {/* Report Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                {headerOptions.showLogo && (
                  <div className="w-25 h-10 bg-[#0e1b29] rounded flex items-center justify-center text-white font-black text-xl shrink-0">
                    FAJA-EXT
                  </div>
                )}
                <div>
                  {headerOptions.showTitle && (
                    <h2 className="text-xl font-black text-[#0e1b29] tracking-tight">
                      ACTA CONVENIO 2026 | REPORTE DE USUARIOS (ORDENADOS POR CÉDULA)
                    </h2>
                  )}
                  {headerOptions.showSubtitle && (
                    <div className="text-xs text-slate-500">Plataforma Unificada de Control.</div>
                  )}
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5">
                {headerOptions.showDate && (
                  <div><strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}</div>
                )}
                {headerOptions.showAuditor && (
                  <div><strong>Auditor:</strong> {currentUser?.fullName || 'Lic. Mariana Rivas'}</div>
                )}
              </div>
            </div>

            {/* REPORT BODY LAYOUTS */}
            {headerOptions.reportLayout === 'dossier' ? (
              <div className="mt-4 space-y-4">
                {filteredUsers.map((u, i) => {
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
                              <h3 className={`${headerOptions.nameTextSize} font-black text-slate-900`}>{u.fullName}</h3>
                            </div>
                            <span className={`font-mono ${headerOptions.idNumberTextSize} font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded`}>
                              {formatIdNumber(u)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                            {headerOptions.showUserEmail && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                  Correo Electrónico
                                </span>
                                <span className="font-semibold text-slate-800 break-all">{u.email}</span>
                              </div>
                            )}

                            {headerOptions.showUserPhone && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                  Teléfono Registrado
                                </span>
                                <span className="font-semibold text-slate-800">{u.phone}</span>
                              </div>
                            )}

                            {headerOptions.showUserDate && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                  Fecha de Aprobación
                                </span>
                                <span className="font-mono text-slate-700 font-medium">
                                  {u.verifiedAt || u.createdAt}
                                </span>
                              </div>
                            )}

                            {headerOptions.showUserStatus && (
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
                          {headerOptions.showUid ? (
                            <span className={`${headerOptions.uidTextSize} font-bold text-slate-700`}>CONTROL: {uid}</span>
                          ) : (
                            <span />
                          )}
                          <span className="text-slate-400">FAJA-EXT</span>
                        </div>
                      </div>

                      {headerOptions.showDocPhoto && (
                        <div
                          style={{ width: `${headerOptions.docWidthPercent}%` }}
                          className="shrink-0 flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-200 rounded-lg p-2"
                        >
                          <div className="w-full aspect-[16/10] bg-white rounded border border-slate-200/80 p-1 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u.idPhotoUrl} alt={`Cédula de ${u.fullName}`} className="w-full h-full object-contain" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : headerOptions.reportLayout === 'mosaic' ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
                {filteredUsers.map((u, i) => {
                  const uid = getUserUID(u);
                  return (
                    <div key={u.id} className="bg-white rounded-xl border-2 border-slate-300 p-6 shadow-sm space-y-4 break-inside-avoid">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">#{i + 1}</span>
                          <h4 className={`${headerOptions.nameTextSize} font-bold text-slate-900 mt-1.5`}>{u.fullName}</h4>
                          <div className={`text-slate-600 font-mono font-semibold mt-0.5`}>
                            Cédula: <span className={`${headerOptions.idNumberTextSize} text-indigo-700 font-bold`}>{formatIdNumber(u)}</span>
                          </div>
                        </div>
                        {headerOptions.showUid && (
                          <span className={`${headerOptions.uidTextSize} font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded`}>CONTROL: {uid}</span>
                        )}
                      </div>

                      {headerOptions.showDocPhoto && (
                        <div className="relative aspect-[16/10] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center">
                          <DocumentImage src={u.idPhotoUrl} alt={`Cédula ${u.fullName}`} objectFit="contain" showOpenButton={true} />
                        </div>
                      )}

                      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {headerOptions.showUserEmail && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo:</span>
                            <strong className="text-slate-900 break-all">{u.email}</strong>
                          </div>
                        )}

                        {headerOptions.showUserPhone && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono:</span>
                            <strong className="text-slate-900">{u.phone || 'No registrado'}</strong>
                          </div>
                        )}

                        {headerOptions.showUserDate && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Verificación:</span>
                            <span className="font-mono text-slate-800">{u.verifiedAt || u.createdAt}</span>
                          </div>
                        )}

                        {headerOptions.showUserStatus && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estatus:</span>
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
            ) : (
              <table className="w-full text-left text-xs border border-slate-200 mt-4">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2 border-r text-center w-10">N°</th>
                    {headerOptions.showUid && <th className="p-2 border-r">UID Control</th>}
                    <th className="p-2 border-r">Cédula</th>
                    <th className="p-2 border-r">Nombre Completo</th>
                    {headerOptions.showDocPhoto && <th style={{ width: `${headerOptions.docWidthPercent}%` }} className="p-2 border-r text-center">Doc. Identidad</th>}
                    {headerOptions.showUserEmail && <th className="p-2 border-r">Correo</th>}
                    {headerOptions.showUserPhone && <th className="p-2 border-r">Teléfono</th>}
                    {headerOptions.showUserDate && <th className="p-2 border-r">Fecha</th>}
                    {headerOptions.showUserStatus && <th className="p-2">Estatus</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className="break-inside-avoid">
                      <td className="p-2 border-r font-mono text-center">{i + 1}</td>
                      {headerOptions.showUid && (
                        <td className={`p-1 border-r font-mono text-indigo-700 font-bold ${headerOptions.uidTextSize}`}>{getUserUID(u)}</td>
                      )}
                      <td className={`p-2 border-r font-mono ${headerOptions.idNumberTextSize}`}>{formatIdNumber(u)}</td>
                      <td className={`p-2 border-r font-bold ${headerOptions.nameTextSize}`}>{u.fullName}</td>
                      {headerOptions.showDocPhoto && (
                        <td className="p-2 border-r text-center align-middle">
                          <div className="w-full aspect-[16/10] mx-auto bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u.idPhotoUrl} alt={`Cédula ${formatIdNumber(u)}`} className="w-full h-full object-contain" />
                          </div>
                        </td>
                      )}
                      {headerOptions.showUserEmail && <td className="p-2 border-r">{u.email}</td>}
                      {headerOptions.showUserPhone && <td className="p-2 border-r">{u.phone}</td>}
                      {headerOptions.showUserDate && <td className="p-2 border-r">{u.verifiedAt || u.createdAt}</td>}
                      {headerOptions.showUserStatus && <td className="p-2 text-emerald-700 font-bold">Aprobado</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>
      )}

    </div>
  );
};