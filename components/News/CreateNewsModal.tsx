'use client';

import React, { useState } from 'react';
import { X, PlusCircle, Mail, Eye, Users } from 'lucide-react';
import { NewsScope } from '@/lib/types';

const SCOPE_OPTIONS: { value: NewsScope; label: string }[] = [
    { value: 'anonymous', label: 'Anónimos (Inicio)' },
    { value: 'users', label: 'Usuarios' },
    { value: 'viewers', label: 'Visores' },
    { value: 'admins', label: 'Admins' },
];

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
        status?: 'active' | 'inactive';
        scopes?: NewsScope[];
        showAuthor?: boolean;
        sendEmail?: boolean;
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
    const [selectedScopes, setSelectedScopes] = useState<NewsScope[]>(['anonymous', 'users']);
    const [showAuthor, setShowAuthor] = useState(true);
    const [sendEmail, setSendEmail] = useState(false);

    if (!isOpen) return null;

    const toggleScope = (scope: NewsScope) => {
        setSelectedScopes((prev) =>
            prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
        );
    };

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
            status: 'active',
            scopes: selectedScopes.length > 0 ? selectedScopes : ['anonymous'],
            showAuthor,
            sendEmail,
        });

        setNewsTitle('');
        setNewsSummary('');
        setNewsContent('');
        setNewsImportant(false);
        setSelectedScopes(['anonymous', 'users']);
        setShowAuthor(true);
        setSendEmail(false);
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

                    {/* Target Audience Scope */}
                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Alcance / Audiencia</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SCOPE_OPTIONS.map((opt) => {
                                const active = selectedScopes.includes(opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => toggleScope(opt.value)}
                                        className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                            active
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Author Visibility & Email Notification Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showAuthor}
                                onChange={(e) => setShowAuthor(e.target.checked)}
                                className="rounded text-indigo-600 w-4 h-4"
                            />
                            <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-semibold text-slate-700">Mostrar autor</span>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sendEmail}
                                onChange={(e) => setSendEmail(e.target.checked)}
                                className="rounded text-indigo-600 w-4 h-4"
                            />
                            <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="font-semibold text-slate-700">Enviar correo al alcance</span>
                        </label>
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