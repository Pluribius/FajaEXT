'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { SupportTicket } from '@/lib/types';

interface ReplyTicketModalProps {
    replyingTicket: SupportTicket | null;
    onClose: () => void;
    onReply: (ticketId: string, replyText: string, status: SupportTicket['status']) => void;
}

export const ReplyTicketModal: React.FC<ReplyTicketModalProps> = ({
    replyingTicket,
    onClose,
    onReply,
}) => {
    const [ticketReplyText, setTicketReplyText] = useState('');
    const [ticketReplyStatus, setTicketReplyStatus] = useState<SupportTicket['status']>('Resuelto');

    useEffect(() => {
        if (replyingTicket) {
            setTicketReplyText(replyingTicket.adminReply || '');
            setTicketReplyStatus(replyingTicket.status || 'Resuelto');
        }
    }, [replyingTicket]);

    if (!replyingTicket) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketReplyText.trim()) return;

        onReply(replyingTicket.id, ticketReplyText.trim(), ticketReplyStatus);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
                <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
                    <h3 className="text-base font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#d9251d]" />
                        Responder al Ticket {replyingTicket.id}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-800 mb-1">{replyingTicket.subject}</div>
                        <div className="text-slate-600 leading-relaxed">{replyingTicket.message}</div>
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                            Respuesta Oficial *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={ticketReplyText}
                            onChange={(e) => setTicketReplyText(e.target.value)}
                            placeholder="Redacta la respuesta o solución para el cliente..."
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                            Nuevo Estado del Caso
                        </label>
                        <select
                            value={ticketReplyStatus}
                            onChange={(e) => setTicketReplyStatus(e.target.value as SupportTicket['status'])}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        >
                            <option value="Resuelto">Resuelto</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Abierto">Abierto</option>
                        </select>
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
                            Enviar Respuesta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};