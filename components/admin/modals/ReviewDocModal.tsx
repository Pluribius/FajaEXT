'use client';

import React, { useState, useEffect } from 'react';
import { X, FileCheck, ExternalLink, Check, CheckCircle2 } from 'lucide-react';
import { AppUser, VerificationStatus, formatIdNumber } from '@/lib/types';
import { DocumentImage } from '@/components/ui/DocumentImage';
import { getOriginalDocumentUrl } from '@/lib/documentUtils';

interface ReviewDocModalProps {
    reviewingUser: AppUser | null;
    onClose: () => void;
    onReviewDecision: (userId: string, status: VerificationStatus, notes?: string) => void;
}

export const ReviewDocModal: React.FC<ReviewDocModalProps> = ({
    reviewingUser,
    onClose,
    onReviewDecision,
}) => {
    const [reviewNotes, setReviewNotes] = useState('');

    useEffect(() => {
        if (reviewingUser) {
            setReviewNotes(reviewingUser.notes || '');
        }
    }, [reviewingUser]);

    if (!reviewingUser) return null;

    const handleDecision = (status: VerificationStatus) => {
        onReviewDecision(reviewingUser.id, status, reviewNotes || undefined);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
                <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
                    <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-[#d9251d]" />
                        <h3 className="text-base font-bold">Auditoría de Documento de Identidad</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                        <div>
                            <span className="text-slate-400 block font-bold uppercase">Nombre Completo</span>
                            <span className="font-bold text-slate-900 text-sm">{reviewingUser.fullName}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-bold uppercase">Cédula Oficial</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                                {formatIdNumber(reviewingUser)}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-bold uppercase">Correo Electrónico</span>
                            <span className="text-slate-800">{reviewingUser.email}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-bold uppercase">Teléfono</span>
                            <span className="text-slate-800">{reviewingUser.phone || 'No registrado'}</span>
                        </div>
                    </div>

                    {/* ID Photo */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700 uppercase">
                                Fotografía del Documento Adjunto:
                            </label>
                            {reviewingUser.idPhotoUrl && reviewingUser.idPhotoUrl.startsWith('http') && (
                                <a
                                    href={getOriginalDocumentUrl(reviewingUser.idPhotoUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Abrir en Google Drive</span>
                                </a>
                            )}
                        </div>
                        <div className="relative aspect-[16/10] w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-300">
                            <DocumentImage
                                src={reviewingUser.idPhotoUrl}
                                alt="Documento"
                                objectFit="contain"
                                showOpenButton={true}
                            />
                        </div>
                    </div>

                    {/* Admin Note Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Observaciones del Administrador (Opcional):
                        </label>
                        <input
                            type="text"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Ej. Cédula verificada con éxito o foto con reflejos"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => handleDecision('aprobado')}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                            <span>Aprobar Cédula</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleDecision('rechazado')}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                            <span>Rechazar Documento</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};