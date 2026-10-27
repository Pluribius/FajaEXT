'use client';

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { SupportTicket } from '@/lib/types';
import { ReplyTicketModal } from '@/components/admin/modals/ReplyTicketModal';

interface SupportTicketsTabProps {
    tickets: SupportTicket[];
    replyToTicket: (ticketId: string, replyText: string, status: SupportTicket['status']) => void;
}

export const SupportTicketsTab: React.FC<SupportTicketsTabProps> = ({ tickets, replyToTicket }) => {
    const [replyingTicket, setReplyingTicket] = useState<SupportTicket | null>(null);
    const pendingTickets = tickets.filter((t) => t.status !== 'Resuelto').length;

    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-[#0e1b29]">Bandeja Central de Soporte y Casos</h3>
                    <p className="text-xs text-slate-500">Responde a las solicitudes de los clientes y actualiza el estado de atención.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-100 text-[#d9251d] text-xs font-bold">
                    {pendingTickets} casos abiertos
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tickets.map((t) => (
                    <div key={t.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-700">{t.id}</span>
                                <h4 className="text-base font-bold text-slate-900">{t.subject}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{t.category}</span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${t.status === 'Resuelto' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                    {t.status}
                                </span>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500">
                            <strong>Cliente:</strong> {t.userName} ({t.userEmail}) • {t.createdAt}
                        </div>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">{t.message}</p>

                        {t.adminReply && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                                <strong>Respuesta enviada ({t.repliedAt}):</strong> {t.adminReply}
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setReplyingTicket(t)}
                                className="px-4 py-2 bg-[#0e1b29] hover:bg-[#1a2c3f] text-white text-xs font-bold uppercase rounded-lg shadow flex items-center gap-2 cursor-pointer"
                            >
                                <MessageSquare className="w-3.5 h-3.5 text-[#d9251d]" />
                                <span>{t.adminReply ? 'Editar Respuesta' : 'Responder al Cliente'}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ReplyTicketModal
                replyingTicket={replyingTicket}
                onClose={() => setReplyingTicket(null)}
                onReply={replyToTicket}
            />
        </div>
    );
};