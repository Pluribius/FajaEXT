'use client';

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { SupportTicket } from '@/lib/types';

interface CreateNewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    authorName: string;
    addNews: (newsItem: {
        title: string;
        category: string;
        summary: string;
        content: string;
        author: string;
        important: boolean;
        imageUrl?: string;
    }) => void;
}

export const CreateNewsModal: React.FC<CreateNewsModalProps> = ({
    isOpen,
    onClose,
    authorName,
    addNews,
}) => {
    const [newsTitle, setNewsTitle] = useState('');
    const [newsCategory, setNewsCategory] = useState('Operaciones');
    const [newsSummary, setNewsSummary] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsImportant, setNewsImportant] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsTitle.trim() || !newsContent.trim()) return;

        addNews({
            title: newsTitle.trim(),
            category: newsCategory,
            summary: newsSummary.trim() || newsContent.slice(0, 100) + '...',
            content: newsContent.trim(),
            author: authorName,
            important: newsImportant,
            imageUrl: '/images/campo-petrolero-1068x712.jpg',
        });

        setNewsTitle('');
        setNewsSummary('');
        setNewsContent('');
        setNewsImportant(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
                <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
                    <h3 className="text-base font-bold flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-[#d9251d]" />
                        Publicar Comunicado Oficial
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                            Título del Boletín *
                        </label>
                        <input
                            type="text"
                            required
                            value={newsTitle}
                            onChange={(e) => setNewsTitle(e.target.value)}
                            placeholder="Ej. Parada programada de planta en Bloque Junín"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Categoría
                            </label>
                            <select
                                value={newsCategory}
                                onChange={(e) => setNewsCategory(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                            >
                                <option value="Operaciones">Operaciones</option>
                                <option value="Seguridad">Seguridad</option>
                                <option value="Medio Ambiente">Medio Ambiente</option>
                                <option value="Corporativo">Corporativo</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 pt-5">
                            <input
                                type="checkbox"
                                id="newsImportantModal"
                                checked={newsImportant}
                                onChange={(e) => setNewsImportant(e.target.checked)}
                                className="rounded text-[#d9251d]"
                            />
                            <label htmlFor="newsImportantModal" className="font-semibold text-slate-700">
                                Marcar como Importante
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                            Resumen Breve
                        </label>
                        <input
                            type="text"
                            value={newsSummary}
                            onChange={(e) => setNewsSummary(e.target.value)}
                            placeholder="Resumen en una línea para el feed"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                            Contenido Completo *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={newsContent}
                            onChange={(e) => setNewsContent(e.target.value)}
                            placeholder="Texto oficial del comunicado..."
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg font-bold hover:bg-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold rounded-lg shadow"
                        >
                            Publicar Comunicado
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};