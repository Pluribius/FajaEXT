'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    ChevronDown,
    Printer,
    SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';
import { formatIdNumber, getUserUID } from '@/lib/types';
import {
    clearImageCache,
    fetchAndCacheImageAsBase64,
} from '@/lib/viewerExports';
import {
    DEFAULT_REPORT_OPTIONS,
    EXPORT_STATE_STORAGE_KEY,
    PersistedExportState,
    ReportLayout,
    ReportOptions,
} from '@/components/listing/types';
import { ReportOptionsPanel } from '@/components/print/ReportOptionsPanel';
import { PrintReportModal } from '@/components/print/PrintReportModal';
import ContourLines from '@/components/ui/ContourLines';

const VALID_LAYOUTS: ReportLayout[] = ['dossier', 'mosaic', 'table'];

function PrintPageContent() {
    const {
        currentUser,
        isSupabaseLoading,
        users,
        refreshSupabaseUsers,
        forceReloadUserPictures,
    } = useApp();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState('');
    const [adminScope, setAdminScope] = useState<'all' | 'visible'>('all');
    const [reportOptions, setReportOptions] = useState<ReportOptions>(DEFAULT_REPORT_OPTIONS);
    const [isOptionsOpen, setIsOptionsOpen] = useState(true);
    const [isClearingCache, setIsClearingCache] = useState(false);
    const [isPrecaching, setIsPrecaching] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    useEffect(() => {
        if (!isSupabaseLoading) {
            if (!currentUser) {
                router.replace('/home');
            } else if (currentUser.role === 'client') {
                router.replace('/user');
            }
        }
    }, [currentUser, isSupabaseLoading, router]);

    useEffect(() => {
        if (currentUser?.role === 'admin' || currentUser?.role === 'viewer') {
            refreshSupabaseUsers();
        }
    }, [currentUser, refreshSupabaseUsers]);

    // Restore saved state from /export & optional ?layout= param
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const layoutParam = searchParams.get('layout') as ReportLayout | null;

        try {
            const raw = window.sessionStorage.getItem(EXPORT_STATE_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<PersistedExportState>;
                if (typeof parsed.searchQuery === 'string') setSearchQuery(parsed.searchQuery);
                if (parsed.adminScope === 'all' || parsed.adminScope === 'visible') {
                    setAdminScope(parsed.adminScope);
                }
                if (parsed.reportOptions) {
                    setReportOptions((prev) => ({ ...prev, ...parsed.reportOptions }));
                }
            }
        } catch {
            // Ignore storage errors
        }

        if (layoutParam && VALID_LAYOUTS.includes(layoutParam)) {
            setReportOptions((prev) => ({ ...prev, reportLayout: layoutParam }));
        }
    }, [searchParams]);

    // Keep /export sessionStorage synced when options change on /print
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const payload: PersistedExportState = {
                searchQuery,
                adminScope,
                reportOptions,
            };
            window.sessionStorage.setItem(EXPORT_STATE_STORAGE_KEY, JSON.stringify(payload));
        } catch {
            // Ignore storage errors
        }
    }, [searchQuery, adminScope, reportOptions]);

    const allowedUsers = useMemo(
        () => users.filter((u) => u.visibleToViewers),
        [users]
    );

    const baseUsers = useMemo(
        () => (currentUser?.role === 'admin' && adminScope === 'all' ? users : allowedUsers),
        [currentUser?.role, adminScope, users, allowedUsers]
    );

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return baseUsers
            .filter((u) => {
                if (!q) return true;
                const uid = getUserUID(u).toLowerCase();
                const formattedId = formatIdNumber(u).toLowerCase();
                return (
                    u.fullName.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.idNumber.toLowerCase().includes(q) ||
                    formattedId.includes(q) ||
                    u.phone.toLowerCase().includes(q) ||
                    uid.includes(q)
                );
            })
            .sort((a, b) => {
                const numA = parseInt(a.idNumber.replace(/[^0-9]/g, '') || '0', 10);
                const numB = parseInt(b.idNumber.replace(/[^0-9]/g, '') || '0', 10);
                return numA - numB;
            });
    }, [baseUsers, searchQuery]);

    // Pre-cache document images for print/PDF rendering
    useEffect(() => {
        let active = true;

        const handleOpenPrintModal = async (layoutOverride?: ReportLayout) => {
            if (layoutOverride) {
                setReportOptions((prev) => ({ ...prev, reportLayout: layoutOverride }));
            }
            setIsPrecaching(true);

            for (const u of filteredUsers) {
                if (!active) return;
                if (u.idPhotoUrl) {
                    await fetchAndCacheImageAsBase64(u.idPhotoUrl, 400, 250, u.idPhotoUrl);
                }
            }

            if (active) {
                setIsPrecaching(false);
            }
        };

        void handleOpenPrintModal();

        return () => {
            active = false;
        };
    }, [filteredUsers]);

    if (!currentUser || currentUser.role === 'client') {
        return (
            <div className="min-h-screen flex-1 flex items-center justify-center bg-[#030a13] text-slate-300">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                        Cargando Vista de Impresión...
                    </p>
                </div>
            </div>
        );
    }

    const handleClearImageCache = async () => {
        if (isClearingCache) return;
        setIsClearingCache(true);
        setStatusMessage(null);

        try {
            clearImageCache();

            let serverPurgeMsg = 'Caché de disco eliminada';
            try {
                const res = await fetch('/api/document-image', { method: 'DELETE' });
                if (res.ok) {
                    const data = await res.json();
                    serverPurgeMsg = data.message || serverPurgeMsg;
                }
            } catch {
                // Ignore server cache endpoint failure and continue client refresh
            }

            if (forceReloadUserPictures && users.length > 0) {
                forceReloadUserPictures(users.map((u) => u.id));
            }

            const approvedWithPhotos = users.filter((u) => u.visibleToViewers && u.idPhotoUrl);
            let successCount = 0;

            const batchSize = 6;
            for (let i = 0; i < approvedWithPhotos.length; i += batchSize) {
                const batch = approvedWithPhotos.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(async (u) => {
                        const sep = u.idPhotoUrl.includes('?') ? '&' : '?';
                        const freshUrl = `${u.idPhotoUrl}${sep}refresh=true&t=${Date.now()}`;
                        const cached = await fetchAndCacheImageAsBase64(freshUrl, 300, 180, u.idPhotoUrl);
                        if (cached) successCount++;
                    })
                );
            }

            setStatusMessage({
                type: 'success',
                text: `${serverPurgeMsg} • Imágenes recargadas: ${successCount} de ${approvedWithPhotos.length}.`,
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error desconocido';
            setStatusMessage({ type: 'error', text: `Error al limpiar la caché: ${msg}` });
        } finally {
            setIsClearingCache(false);
        }
    };

    return (
        <div className="w-full bg-[#01161e] min-h-screen flex flex-col">


            {/* Matching View Headbar */}
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 print:hidden">
                <div className="bg-[#0e1b29] text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border-b-4 border-indigo-600">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-white/10 px-2.5 py-0.5 rounded">
                                    Vista de Impresión y Reportes
                                </span>
                                <span className="text-xs text-slate-300">
                                    {filteredUsers.length} registros listos para PDF / Impresión
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black">
                                Configuración y Vista Previa de Reporte
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => router.push('/export')}
                                className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver a Exportación</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOptionsOpen((prev) => !prev)}
                                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer shadow ${isOptionsOpen
                                    ? 'bg-indigo-500 border-indigo-400 text-white ring-2 ring-indigo-300'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                                <span>Configurar Reporte</span>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOptionsOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-2.5 bg-[#d9251d] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Imprimir / PDF</span>
                            </button>
                        </div>
                    </div>
                </div>

                {statusMessage && (
                    <div
                        className={`mb-6 px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${statusMessage.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                    >
                        <span>{statusMessage.text}</span>
                        <button
                            type="button"
                            onClick={() => setStatusMessage(null)}
                            className="text-xs underline ml-4 cursor-pointer"
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                <ReportOptionsPanel
                    isOpen={isOptionsOpen}
                    options={reportOptions}
                    isClearingCache={isClearingCache}
                    onChange={setReportOptions}
                    onClearCache={handleClearImageCache}
                    onPreview={() => window.print()}
                    onClose={() => setIsOptionsOpen(false)}
                />
            </div>

            {isPrecaching && (
                <div className="fixed bottom-4 right-4 z-[210] print:hidden bg-[#0e1b29] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-lg border border-slate-700">
                    Preparando documentos para impresión...
                </div>
            )}

            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 flex-1">
                <PrintReportModal
                    isOpen={true}
                    users={filteredUsers}
                    auditorName={currentUser.fullName}
                    options={reportOptions}
                    onChangeOptions={setReportOptions}
                    onClose={() => router.push('/export')}
                />
            </div>
        </div>
    );
}

export default function PrintPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#030a13] text-slate-300 text-xs uppercase font-bold tracking-widest">
                    Cargando Vista de Impresión...
                </div>
            }
        >
            <PrintPageContent />
        </Suspense>
    );
}