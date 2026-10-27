'use client';

import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { NewsPost } from '@/lib/types';
import { CreateNewsModal } from '@/components/admin/modals/CreateNewsModal';

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
    }) => void;
    deleteNews: (id: string) => void;
}

export const NewsPublisherTab: React.FC<NewsPublisherTabProps> = ({
    news,
    authorName,
    addNews,
    deleteNews,
}) => {
    const [isCreateNewsModalOpen, setIsCreateNewsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-[#0e1b29]">Publicador de Boletines y Noticias</h3>
                    <p className="text-xs text-slate-500">Los comunicados se publicarán inmediatamente en el portal de los clientes.</p>
                </div>
                <button
                    onClick={() => setIsCreateNewsModalOpen(true)}
                    className="px-4 py-2.5 bg-[#d9251d] hover:bg-[#b81c15] text-white text-xs font-bold uppercase rounded-lg shadow flex items-center gap-2 cursor-pointer"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Nuevo Comunicado</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {news.map((n) => (
                    <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 relative group">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-bold text-[#0e1b29] bg-slate-100 px-2 py-0.5 rounded">{n.category}</span>
                            <span>{n.date}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">{n.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3">{n.content}</p>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Autor: {n.author}</span>
                            <button onClick={() => deleteNews(n.id)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar Noticia">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <CreateNewsModal
                isOpen={isCreateNewsModalOpen}
                onClose={() => setIsCreateNewsModalOpen(false)}
                authorName={authorName}
                addNews={addNews}
            />
        </div>
    );
};