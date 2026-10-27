'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileCheck, CheckCircle2, Check, X, RefreshCw } from 'lucide-react';
import { AppUser, VerificationStatus, formatIdNumber } from '@/lib/types';
import { DocumentImage } from '@/components/ui/DocumentImage';
import { ReviewDocModal } from '@/components/admin/modals/ReviewDocModal';

interface DocumentReviewTabProps {
    users: AppUser[];
    reviewUserStatus: (id: string, status: VerificationStatus, notes?: string) => void;
    bulkReviewUserStatus: (ids: string[], status: VerificationStatus, notes?: string) => void;
}

export const DocumentReviewTab: React.FC<DocumentReviewTabProps> = ({
    users,
    reviewUserStatus,
    bulkReviewUserStatus,
}) => {
    const [visibleReviewCount, setVisibleReviewCount] = useState<number>(20);
    const [reviewingUser, setReviewingUser] = useState<AppUser | null>(null);
    const reviewSentinelRef = useRef<HTMLDivElement | null>(null);

    const pendingUsers = useMemo(() => users.filter((u) => u.status === 'pendiente'), [users]);
    const displayedPendingUsers = useMemo(
        () => pendingUsers.slice(0, visibleReviewCount),
        [pendingUsers, visibleReviewCount]
    );
    const pendingReviews = pendingUsers.length;

    // Infinite scroll observer for continuous batch loading
    useEffect(() => {
        const sentinel = reviewSentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleReviewCount((prev) => (prev < pendingUsers.length ? Math.min(prev + 20, pendingUsers.length) : prev));
                }
            },
            { threshold: 0.1, rootMargin: '300px' }
        );

        observer.observe(sentinel);
        return () => {
            if (sentinel) observer.unobserve(sentinel);
        };
    }, [pendingUsers.length]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-black text-[#0e1b29]">Cola de Revisión y Cotejo de Cédulas</h3>
                    <p className="text-xs text-slate-500">
                        Verifica que la fotografía del documento adjunta coincida exactamente con el nombre oficial y número de cédula ingresado[cite: 4].
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                        {displayedPendingUsers.length} de {pendingReviews} cédulas mostradas
                    </span>

                    {pendingReviews > 0 && (
                        <button
                            onClick={async () => {
                                const pendingIds = pendingUsers.map((u) => u.id);
                                if (confirm(`¿Aprobar todas las ${pendingIds.length} cédulas pendientes simultáneamente?`)) {
                                    await bulkReviewUserStatus(pendingIds, 'aprobado', 'Aprobación masiva desde cola de revisión');
                                }
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprobar Todas ({pendingReviews})</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedPendingUsers.map((u) => (
                    <div key={u.id} className="bg-white rounded-xl border-2 border-amber-300 p-6 shadow-sm space-y-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    Esperando Aprobación
                                </span>
                                <h4 className="text-lg font-bold text-slate-900 mt-1">{u.fullName}</h4>
                                <div className="text-xs text-slate-500 font-mono">Cédula: {formatIdNumber(u)}</div>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">{u.createdAt}</span>
                        </div>

                        {/* Clickable ID photo thumbnail to open inspection modal */}
                        <div
                            onClick={() => setReviewingUser(u)}
                            className="relative aspect-[16/10] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-300 cursor-pointer group"
                            title="Haz clic para inspeccionar documento en detalle"
                        >
                            <DocumentImage src={u.idPhotoUrl} alt={`Foto de Cédula de ${u.fullName}`} objectFit="contain" showOpenButton={true} />
                        </div>

                        <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 space-y-1">
                            <div><strong>Correo:</strong> {u.email}</div>
                            <div><strong>Teléfono:</strong> {u.phone || 'No registrado'}</div>
                            {u.notes && <div><strong>Notas:</strong> {u.notes}</div>}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => reviewUserStatus(u.id, 'aprobado', 'Documento verificado y aprobado formalmente')}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                <span>Aprobar</span>
                            </button>

                            <button
                                onClick={() => setReviewingUser(u)}
                                className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-1 cursor-pointer"
                                title="Auditoría detallada"
                            >
                                <FileCheck className="w-4 h-4" />
                                <span>Detalles</span>
                            </button>

                            <button
                                onClick={() => reviewUserStatus(u.id, 'rechazado', 'Foto ilegible o inconsistencia de cédula')}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                <span>Rechazar</span>
                            </button>
                        </div>
                    </div>
                ))}

                {pendingUsers.length === 0 && (
                    <div className="col-span-2 bg-white rounded-xl p-12 text-center border border-slate-200">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-slate-800">¡No hay documentos pendientes de revisión![cite: 4]</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            Todas las solicitudes de registro en la base de datos de Supabase han sido procesadas exitosamente[cite: 4].
                        </p>
                    </div>
                )}
            </div>

            {visibleReviewCount < pendingUsers.length && (
                <div ref={reviewSentinelRef} className="py-6 text-center bg-white rounded-xl border border-dashed border-amber-300 p-6 flex flex-col items-center justify-center gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                        <span>Cargando siguientes 20 cédulas ({displayedPendingUsers.length} de {pendingUsers.length})...[cite: 4]</span>
                    </div>
                </div>
            )}

            {/* Detailed Inspection Modal */}
            <ReviewDocModal
                reviewingUser={reviewingUser}
                onClose={() => setReviewingUser(null)}
                onReviewDecision={reviewUserStatus}
            />
        </div>
    );
};