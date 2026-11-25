'use client';

import React, { useMemo, useState } from 'react';
import {
    CheckCircle2,
    CheckSquare,
    PlusCircle,
    Power,
    PowerOff,
    Square,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { NewsPost, NewsScope } from '@/lib/types';
import { CreateNewsModal } from '@/components/News/CreateNewsModal';

interface NewsPublisherTabProps {
    news: NewsPost[];
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
    deleteNews: (id: string) => void;
}

const SCOPE_LABELS: Record<NewsScope, string> = {
    anonymous: 'Anónimos',
    users: 'Usuarios',
    viewers: 'Visores',
    admins: 'Admins',
};

const ALL_SCOPES: NewsScope[] = ['anonymous', 'users', 'viewers', 'admins'];

export const NewsPublisherTab: React.FC<NewsPublisherTabProps> = ({
    news,
    authorName,
    addNews,
    deleteNews,
}) => {
    const [isCreateNewsModalOpen, setIsCreateNewsModalOpen] = useState(false);

    // Multi-select status filter ("Filter news by"): Active / Inactive
    const [selectedStatuses, setSelectedStatuses] = useState<Array<'active' | 'inactive'>>([]);
    // Multi-select audience scope filter ("Shown to"): Anonymous, Users, Viewers, Admins
    const [selectedScopes, setSelectedScopes] = useState<NewsScope[]>([]);

    // Local status overrides for Activate / Deactivate bulk actions
    const [statusOverrides, setStatusOverrides] = useState<Record<string, 'active' | 'inactive'>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const normalizedNews = useMemo(() => {
        return news.map((n) => ({
            ...n,
            status: statusOverrides[n.id] ?? n.status ?? 'active',
            scopes: n.scopes && n.scopes.length > 0 ? n.scopes : ALL_SCOPES,
            showAuthor: n.showAuthor !== undefined ? n.showAuthor : true,
        }));
    }, [news, statusOverrides]);

    const filteredNews = useMemo(() => {
        return normalizedNews.filter((n) => {
            const matchesStatus =
                selectedStatuses.length === 0 || selectedStatuses.includes(n.status);
            const matchesScope =
                selectedScopes.length === 0 ||
                selectedScopes.some((scope) => n.scopes.includes(scope));
            return matchesStatus && matchesScope;
        });
    }, [normalizedNews, selectedStatuses, selectedScopes]);

    const visibleIds = useMemo(() => filteredNews.map((n) => n.id), [filteredNews]);
    const allVisibleSelected =
        visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    const toggleStatusFilter = (status: 'active' | 'inactive') => {
        setSelectedStatuses((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        );
    };

    const toggleScopeFilter = (scope: NewsScope) => {
        setSelectedScopes((prev) =>
            prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
        );
    };

    const toggleSelectAllVisible = () => {
        if (allVisibleSelected) {
            const visibleSet = new Set(visibleIds);
            setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
        } else {
            const next = new Set(selectedIds);
            visibleIds.forEach((id) => next.add(id));
            setSelectedIds(Array.from(next));
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleBulkStatus = (nextStatus: 'active' | 'inactive') => {
        if (selectedIds.length === 0) return;
        setStatusOverrides((prev) => {
            const updated = { ...prev };
            selectedIds.forEach((id) => {
                updated[id] = nextStatus;
            });
            return updated;
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`¿Eliminar ${selectedIds.length} comunicado(s) seleccionado(s)?`)) return;
        selectedIds.forEach((id) => deleteNews(id));
        setSelectedIds([]);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Top Canvas Toolbar & Quick Actions */}
            <div className="bg-[#0e1b29] text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border-b-4 border-indigo-600 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base sm:text-lg font-black tracking-tight">
                            Publicador de Boletines y Noticias
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5">
                            Filtra por estado o audiencia, gestiona selecciones masivas y publica nuevos comunicados.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateNewsModalOpen(true)}
                        className="min-h-[40px] md:min-h-[36px] px-4 py-2 bg-[#d9251d] hover:bg-[#b81c15] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                        <PlusCircle className="w-4 h-4 shrink-0" />
                        <span>Nuevo Comunicado</span>
                    </button>
                </div>

                {/* Multi-Select Filters Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
                    {/* Filter news by Status (Active / Inactive) */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                            Filtrar por estado:
                        </span>
                        <button
                            type="button"
                            onClick={() => toggleStatusFilter('active')}
                            className={`min-h-[40px] md:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                selectedStatuses.includes('active')
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-[#152538] text-slate-300 hover:text-white border border-slate-700/50'
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Activas</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => toggleStatusFilter('inactive')}
                            className={`min-h-[40px] md:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                selectedStatuses.includes('inactive')
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-[#152538] text-slate-300 hover:text-white border border-slate-700/50'
                            }`}
                        >
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Inactivas</span>
                        </button>
                    </div>

                    {/* Shown to Audience Scope (Anonymous, Users, Viewers, Admins) */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Mostrar a:
                        </span>
                        {ALL_SCOPES.map((scope) => (
                            <button
                                key={scope}
                                type="button"
                                onClick={() => toggleScopeFilter(scope)}
                                className={`min-h-[40px] md:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    selectedScopes.includes(scope)
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-[#152538] text-slate-300 hover:text-white border border-slate-700/50'
                                }`}
                            >
                                {SCOPE_LABELS[scope]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk Selection & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleSelectAllVisible}
                            className="min-h-[40px] md:min-h-[34px] px-3 py-1.5 rounded-lg bg-[#152538] hover:bg-slate-800 border border-slate-700/50 text-xs font-bold text-slate-200 inline-flex items-center gap-2 cursor-pointer"
                        >
                            {allVisibleSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-400" />
                            ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                            )}
                            <span>Seleccionar visibles ({filteredNews.length})</span>
                        </button>

                        <span className="text-xs text-slate-400 tabular-nums">
                            {selectedIds.length} seleccionados
                        </span>
                    </div>

                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleBulkStatus('active')}
                                className="min-h-[40px] md:min-h-[34px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Power className="w-3.5 h-3.5" />
                                <span>Activar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkStatus('inactive')}
                                className="min-h-[40px] md:min-h-[34px] px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <PowerOff className="w-3.5 h-3.5" />
                                <span>Desactivar</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                className="min-h-[40px] md:min-h-[34px] px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar ({selectedIds.length})</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* News Cards Grid */}
            {filteredNews.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                    No hay comunicados que coincidan con los filtros seleccionados.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredNews.map((n) => {
                        const isSelected = selectedIds.includes(n.id);
                        const isActive = n.status === 'active';
                        return (
                            <div
                                key={n.id}
                                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-3 transition-all ${
                                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                                }`}
                            >
                                <div className="space-y-3">
                                    {/* Card Header: Checkbox, Status Badge, Date */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleSelectOne(n.id)}
                                                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer"
                                                aria-label={`Seleccionar ${n.title}`}
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-slate-400" />
                                                )}
                                            </button>

                                            {isActive ? (
                                                <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Activa</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                    <XCircle className="w-3 h-3" />
                                                    <span>Inactiva</span>
                                                </span>
                                            )}
                                        </div>

                                        <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                                            {n.date}
                                        </span>
                                    </div>

                                    {/* Title & Body */}
                                    <div>
                                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                                            {n.title}
                                        </h4>
                                        <p className="text-xs text-slate-600 mt-1.5 line-clamp-3">
                                            {n.content}
                                        </p>
                                    </div>

                                    {/* Scope Indicators */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {n.scopes.map((scope) => (
                                            <span
                                                key={scope}
                                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                                            >
                                                {SCOPE_LABELS[scope]}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer: Author (if visible) + Individual Delete Button */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-slate-500 truncate">
                                        {n.showAuthor ? `Autor: ${n.author}` : 'Autor oculto'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => deleteNews(n.id)}
                                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                        title="Eliminar Noticia"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <CreateNewsModal
                isOpen={isCreateNewsModalOpen}
                onClose={() => setIsCreateNewsModalOpen(false)}
                authorName={authorName}
                addNews={addNews}
            />
        </div>
    );
};
