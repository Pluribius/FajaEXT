/*Lightbox modal for inspecting an individual user's ID document.*/
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { formatIdNumber } from '@/lib/types';
import { SelectedDocument } from './types';

interface DocumentPreviewModalProps {
    document: SelectedDocument | null;
    onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    document,
    onClose,
}) => {
    if (!document) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-2xl w-full bg-white rounded-2xl p-5 shadow-2xl cursor-default border border-slate-200"
            >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <div>
                        <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 block">
                            Documento de Identidad Oficial • {document.uid}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">
                            {document.fullName}
                            <span className="ml-2 font-mono text-sm text-slate-500 font-normal">
                                ({formatIdNumber(document)})
                            </span>
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-slate-100 rounded-xl overflow-hidden p-2 flex items-center justify-center border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={document.url}
                        alt={`Cédula de ${document.fullName}`}
                        className="w-full h-auto rounded-lg object-contain max-h-[70vh] shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
};