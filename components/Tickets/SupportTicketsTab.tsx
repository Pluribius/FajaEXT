'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  GitBranch,
  MessageSquarePlus,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SupportTicket, TicketNode } from '@/lib/types';

interface SupportTicketsTabProps {
  tickets: SupportTicket[];
  replyToTicket: (ticketId: string, replyText: string, status: SupportTicket['status']) => void;
  currentAdminName?: string;
}

const ISSUE_CATEGORIES: Array<'Todas' | SupportTicket['category']> = [
  'Todas',
  'Técnico',
  'Documentación',
  'Operaciones',
  'Facturación',
  'Otro',
];

function hydrateTicketNodes(ticket: SupportTicket): TicketNode[] {
  if (ticket.nodes && ticket.nodes.length > 0) {
    return ticket.nodes;
  }

  const startNodeId = `N-${ticket.id}-01`;
  const nodes: TicketNode[] = [
    {
      node_id: startNodeId,
      parent_node_id: null,
      type: 'start',
      author: ticket.userName,
      date: ticket.createdAt,
      issueType: ticket.category,
      body: ticket.message,
    },
  ];

  let lastNodeId = startNodeId;
  if (ticket.adminReply) {
    const middleId = `N-${ticket.id}-02`;
    nodes.push({
      node_id: middleId,
      parent_node_id: lastNodeId,
      type: 'middle',
      author: 'Administrador de Soporte',
      date: ticket.repliedAt || ticket.createdAt,
      body: ticket.adminReply,
    });
    lastNodeId = middleId;
  }

  if (ticket.status === 'Resuelto') {
    nodes.push({
      node_id: `N-${ticket.id}-END`,
      parent_node_id: lastNodeId,
      type: 'end',
      author: 'Administrador de Soporte',
      date: ticket.repliedAt || ticket.createdAt,
      body: ticket.adminReply || 'Caso cerrado y validado por administración.',
    });
  }

  return nodes;
}

export const SupportTicketsTab: React.FC<SupportTicketsTabProps> = ({
  tickets,
  replyToTicket,
  currentAdminName = 'Administrador',
}) => {
  const [threadOverrides, setThreadOverrides] = useState<Record<string, TicketNode[]>>({});
  const [forkedTickets, setForkedTickets] = useState<SupportTicket[]>([]);
  const [expandedTicketIds, setExpandedTicketIds] = useState<Record<string, boolean>>({});

  // Filters: default to OPEN tickets
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [categoryFilter, setCategoryFilter] = useState<'Todas' | SupportTicket['category']>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Per-ticket composer states
  const [stepDrafts, setStepDrafts] = useState<Record<string, string>>({});
  const [closingDrafts, setClosingDrafts] = useState<Record<string, string>>({});
  const [closingModeIds, setClosingModeIds] = useState<Record<string, boolean>>({});

  const allTicketsWithNodes = useMemo(() => {
    const combined = [...forkedTickets, ...tickets];
    return combined.map((t) => {
      const nodes = threadOverrides[t.id] || hydrateTicketNodes(t);
      const endNode = nodes.find((n) => n.type === 'end') || null;
      const isClosed = Boolean(endNode);
      return {
        ...t,
        nodes,
        endNode,
        isClosed,
      };
    });
  }, [tickets, forkedTickets, threadOverrides]);

  const summaryStats = useMemo(() => {
    const total = allTicketsWithNodes.length;
    const open = allTicketsWithNodes.filter((t) => !t.isClosed).length;
    const closed = allTicketsWithNodes.filter((t) => t.isClosed).length;
    const totalNodes = allTicketsWithNodes.reduce((acc, t) => acc + t.nodes.length, 0);
    return { total, open, closed, totalNodes };
  }, [allTicketsWithNodes]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allTicketsWithNodes
      .filter((t) => {
        if (statusFilter === 'open' && t.isClosed) return false;
        if (statusFilter === 'closed' && !t.isClosed) return false;
        if (categoryFilter !== 'Todas' && t.category !== categoryFilter) return false;
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q) ||
          t.nodes.some((n) => n.node_id.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [allTicketsWithNodes, statusFilter, categoryFilter, searchQuery]);

  const toggleAccordion = (ticketId: string) => {
    setExpandedTicketIds((prev) => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

  const handleAddMiddleNode = (ticket: SupportTicket & { nodes: TicketNode[] }) => {
    const body = (stepDrafts[ticket.id] || '').trim();
    if (!body) return;

    const lastNode = ticket.nodes[ticket.nodes.length - 1];
    const nextIndex = String(ticket.nodes.length + 1).padStart(2, '0');
    const newNode: TicketNode = {
      node_id: `N-${ticket.id}-${nextIndex}`,
      parent_node_id: lastNode ? lastNode.node_id : null,
      type: 'middle',
      author: currentAdminName,
      date: new Date().toISOString().split('T')[0],
      body,
    };

    setThreadOverrides((prev) => ({
      ...prev,
      [ticket.id]: [...ticket.nodes, newNode],
    }));
    setStepDrafts((prev) => ({ ...prev, [ticket.id]: '' }));

    if (!ticket.forkedFrom) {
      replyToTicket(ticket.id, body, 'En Proceso');
    }
  };

  const handleCloseWithEndNode = (ticket: SupportTicket & { nodes: TicketNode[] }) => {
    const summary = (closingDrafts[ticket.id] || '').trim() || 'Hilo cerrado y resuelto por administración.';
    const lastNode = ticket.nodes[ticket.nodes.length - 1];
    const endNode: TicketNode = {
      node_id: `N-${ticket.id}-END`,
      parent_node_id: lastNode ? lastNode.node_id : null,
      type: 'end',
      author: currentAdminName,
      date: new Date().toISOString().split('T')[0],
      body: summary,
    };

    setThreadOverrides((prev) => ({
      ...prev,
      [ticket.id]: [...ticket.nodes, endNode],
    }));
    setClosingDrafts((prev) => ({ ...prev, [ticket.id]: '' }));
    setClosingModeIds((prev) => ({ ...prev, [ticket.id]: false }));

    if (!ticket.forkedFrom) {
      replyToTicket(ticket.id, summary, 'Resuelto');
    }
  };

  const handleForkNode = (ticket: SupportTicket, sourceNode: TicketNode) => {
    const forkId = `${ticket.id}-FORK-${forkedTickets.length + 1}`;
    const today = new Date().toISOString().split('T')[0];
    const forkedStartNode: TicketNode = {
      node_id: `N-${forkId}-01`,
      parent_node_id: sourceNode.node_id,
      type: 'start',
      author: currentAdminName,
      date: today,
      issueType: ticket.category,
      body: `[Bifurcado desde ${sourceNode.node_id}] ${sourceNode.body}`,
    };

    const newTicket: SupportTicket = {
      id: forkId,
      userId: ticket.userId,
      userName: currentAdminName,
      userEmail: ticket.userEmail,
      subject: `Bifurcación: ${ticket.subject}`,
      category: ticket.category,
      priority: ticket.priority,
      message: forkedStartNode.body,
      status: 'Abierto',
      createdAt: today,
      nodes: [forkedStartNode],
      forkedFrom: {
        ticketId: ticket.id,
        nodeId: sourceNode.node_id,
      },
    };

    setForkedTickets((prev) => [newTicket, ...prev]);
    setExpandedTicketIds((prev) => ({ ...prev, [forkId]: true }));
    setStatusFilter('open');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Summary Statistics & Filter Bar */}
      <div className="bg-[#0e1b29] text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border-b-4 border-indigo-600 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Bandeja Central de Soporte y Nodos
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Hilos de seguimiento por nodos (inicio, pasos intermedios, bifurcaciones y cierre).
            </p>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-[#152538] border border-slate-700/60 rounded-lg px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Abiertos
              </span>
              <span className="text-sm sm:text-base font-black text-amber-400 tabular-nums">
                {summaryStats.open}
              </span>
            </div>
            <div className="bg-[#152538] border border-slate-700/60 rounded-lg px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Cerrados
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-400 tabular-nums">
                {summaryStats.closed}
              </span>
            </div>
            <div className="bg-[#152538] border border-slate-700/60 rounded-lg px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Total Hilos
              </span>
              <span className="text-sm sm:text-base font-black text-white tabular-nums">
                {summaryStats.total}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('open')}
              className={`min-h-[40px] md:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer tabular-nums ${statusFilter === 'open'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#152538] text-slate-300 hover:text-white border border-slate-700/50'
                }`}
            >
              Abiertos ({summaryStats.open})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('closed')}
              className={`min-h-[40px] md:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer tabular-nums ${statusFilter === 'closed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#152538] text-slate-300 hover:text-white border border-slate-700/50'
                }`}
            >
              Cerrados ({summaryStats.closed})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`min-h-[40px] md:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer tabular-nums ${statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#152538] text-slate-300 hover:text-white border border-slate-700/50'
                }`}
            >
              Todos ({summaryStats.total})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'Todas' | SupportTicket['category'])}
              className="min-h-[40px] md:min-h-[36px] px-3 py-1.5 bg-[#152538] border border-slate-700/60 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Todas' ? 'Tipo: Todos' : cat}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ticket, autor o node_id..."
                className="w-full min-h-[40px] md:min-h-[36px] pl-9 pr-3 py-1.5 bg-[#152538] border border-slate-700/60 rounded-lg text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Folded Accordions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No hay tickets que coincidan con los filtros seleccionados.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isExpanded = Boolean(expandedTicketIds[ticket.id]);
            const startNode = ticket.nodes[0];
            const middleNodes = ticket.nodes.filter((n) => n.type === 'middle');
            const endNode = ticket.endNode;

            return (
              <div key={ticket.id} className="bg-white">
                {/* Accordion Header (Folded by default) */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(ticket.id)}
                  className="w-full min-h-[52px] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 tabular-nums shrink-0">
                      {ticket.id}
                    </span>
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {ticket.subject}
                    </span>
                    {ticket.forkedFrom && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        Bifurcado
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                      {ticket.createdAt}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {ticket.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                      {ticket.nodes.length} nodos
                    </span>
                    {ticket.isClosed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Cerrado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>Abierto</span>
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded Thread Body */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-2 bg-slate-50/70 border-t border-slate-200 space-y-4">
                    {/* Start Node */}
                    {startNode && (
                      <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 shadow-xs space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                              Nodo Inicio
                            </span>
                            <span className="font-mono text-xs font-bold text-indigo-700 tabular-nums">
                              node_id: {startNode.node_id}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleForkNode(ticket, startNode)}
                            className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-700 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>Bifurcar Hilo</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                          <div>
                            <span className="font-bold text-slate-800">Fecha de creación:</span>{' '}
                            <span className="font-mono tabular-nums">{startNode.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-bold text-slate-800">Autor (firmado):</span>{' '}
                            <span>{startNode.author}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">Tipo de problema:</span>{' '}
                            <span>{startNode.issueType || ticket.category}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {startNode.body}
                        </p>
                      </div>
                    )}

                    {/* Middle (Step) Connecting Nodes */}
                    {middleNodes.map((node) => (
                      <div
                        key={node.node_id}
                        className="ml-3 sm:ml-6 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5 relative"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-white">
                              Nodo Paso
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                              node_id: {node.node_id}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                              padre: {node.parent_node_id}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleForkNode(ticket, node)}
                            className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-700 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>Bifurcar Hilo</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>
                            <span className="font-bold text-slate-800">Fecha de actualización:</span>{' '}
                            <span className="font-mono tabular-nums">{node.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="font-bold text-slate-800">Firmado por:</span>{' '}
                            <span>{node.author}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {node.body}
                        </p>
                      </div>
                    ))}

                    {/* Closed Thread View (End Node) */}
                    {endNode ? (
                      <div className="ml-3 sm:ml-6 bg-emerald-50 rounded-xl border-2 border-emerald-300 p-4 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-200">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                              Hilo Cerrado (Nodo Final)
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-emerald-800 tabular-nums">
                            {endNode.node_id}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-emerald-900">
                          <div>
                            <strong>Fecha de cierre:</strong>{' '}
                            <span className="font-mono tabular-nums">{endNode.date}</span>
                          </div>
                          <div>
                            <strong>Nodo padre:</strong>{' '}
                            <span className="font-mono tabular-nums">{endNode.parent_node_id}</span>
                          </div>
                          <div>
                            <strong>Administrador:</strong> {endNode.author}
                          </div>
                        </div>
                        <div className="text-xs text-emerald-950 bg-white/80 p-3 rounded-lg border border-emerald-200">
                          <strong className="block mb-1">Resumen del hilo:</strong>
                          {endNode.body}
                        </div>
                      </div>
                    ) : (
                      /* Open Thread Actions: Add Middle Node or Append End Node */
                      <div className="ml-3 sm:ml-6 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
                            Agregar Nodo de Seguimiento
                          </span>
                          <span>
                            Firma automática: <strong className="text-slate-800">{currentAdminName}</strong>
                          </span>
                        </div>

                        <textarea
                          rows={2}
                          value={stepDrafts[ticket.id] || ''}
                          onChange={(e) =>
                            setStepDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                          }
                          placeholder="Escribe el avance o respuesta para el siguiente nodo..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />

                        {closingModeIds[ticket.id] && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                            <label className="block text-xs font-bold text-emerald-900">
                              Resumen de cierre del hilo (Nodo Final):
                            </label>
                            <textarea
                              rows={2}
                              value={closingDrafts[ticket.id] || ''}
                              onChange={(e) =>
                                setClosingDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                              }
                              placeholder="Resumen final de resolución firmado por el administrador..."
                              className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {!closingModeIds[ticket.id] ? (
                            <button
                              type="button"
                              onClick={() =>
                                setClosingModeIds((prev) => ({ ...prev, [ticket.id]: true }))
                              }
                              className="min-h-[40px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Cerrar Hilo (Nodo Final)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCloseWithEndNode(ticket)}
                              className="min-h-[40px] px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirmar Cierre</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddMiddleNode(ticket)}
                            className="min-h-[40px] px-4 py-2 bg-[#0e1b29] hover:bg-[#1a2c3f] text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-[#d9251d]" />
                            <span>Agregar Nodo Paso</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
