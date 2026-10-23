'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  PlusCircle,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  Newspaper,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Phone,
  Mail,
  CreditCard,
  Send,
  Lock,
  RefreshCw,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  MinusSquare,
  Sparkles,
  Database,
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { AppUser, SupportTicket, UserRole, VerificationStatus } from '@/lib/types';
import { DocumentImage } from '@/components/ui/DocumentImage';
import { getOriginalDocumentUrl } from '@/lib/documentUtils';

type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'date-desc'
  | 'date-asc'
  | 'id-asc'
  | 'id-desc'
  | 'status';

export const AdminDashboard = () => {
  const {
    currentUser,
    users,
    tickets,
    news,
    adminSubView,
    setAdminSubView,
    supabaseConnected,
    isSupabaseLoading,
    refreshSupabaseUsers,
    addUser,
    updateUser,
    deleteUser,
    toggleViewerVisibility,
    reviewUserStatus,
    bulkReviewUserStatus,
    bulkToggleViewerVisibility,
    replyToTicket,
    addNews,
    deleteNews,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'usuarios' | 'revision' | 'tickets' | 'noticias'>('usuarios');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Review tab continuous pagination state (load 20 at a time)
  const [visibleReviewCount, setVisibleReviewCount] = useState<number>(20);
  const reviewSentinelRef = useRef<HTMLDivElement | null>(null);

  // Review tab selection state
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);

  // Modals state
  const [reviewingUser, setReviewingUser] = useState<AppUser | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [replyingTicket, setReplyingTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketReplyStatus, setTicketReplyStatus] = useState<SupportTicket['status']>('Resuelto');
  const [isCreateNewsModalOpen, setIsCreateNewsModalOpen] = useState(false);

  // New news form state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Operaciones');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImportant, setNewsImportant] = useState(false);

  // Trigger data reload on component mount to ensure fresh Supabase database sync
  useEffect(() => {
    refreshSupabaseUsers();
  }, [refreshSupabaseUsers]);


  // Metrics (computed from full database list)
  const totalUsers = users.length;
  const pendingReviews = users.filter((u) => u.status === 'pendiente').length;
  const approvedUsers = users.filter((u) => u.status === 'aprobado').length;
  const rejectedUsers = users.filter((u) => u.status === 'rechazado').length;
  const pendingTickets = tickets.filter((t) => t.status !== 'Resuelto').length;
  const viewerAllowedUsers = users.filter((u) => u.visibleToViewers).length;

  // Pending users for revision tab (loaded in continuous 20-item batches)
  const pendingUsers = useMemo(() => users.filter((u) => u.status === 'pendiente'), [users]);
  const displayedPendingUsers = useMemo(
    () => pendingUsers.slice(0, visibleReviewCount),
    [pendingUsers, visibleReviewCount]
  );

  // Continuous infinite scroll observer for revision tab
  useEffect(() => {
    if (activeTab !== 'revision') return;
    const sentinel = reviewSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleReviewCount((prev) => {
            if (prev < pendingUsers.length) {
              return Math.min(prev + 20, pendingUsers.length);
            }
            return prev;
          });
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [activeTab, pendingUsers.length, visibleReviewCount]);

  // Filtered & Sorted users
  const filteredUsers = useMemo(() => {
    const rawSearch = searchQuery.trim().toLowerCase();
    const cleanDigits = searchQuery.replace(/\D/g, '');

    const filtered = users.filter((u) => {
      // Search matches phone, government id number, email, or name
      const matchesSearch =
        !rawSearch ||
        u.email.toLowerCase().includes(rawSearch) ||
        u.fullName.toLowerCase().includes(rawSearch) ||
        u.idNumber.toLowerCase().includes(rawSearch) ||
        u.phone.toLowerCase().includes(rawSearch) ||
        (cleanDigits.length > 0 && u.idNumber.replace(/\D/g, '').includes(cleanDigits)) ||
        (cleanDigits.length > 0 && u.phone.replace(/\D/g, '').includes(cleanDigits));

      // Role filter
      const matchesRole = roleFilter === 'todos' || u.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === 'todos' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
        case 'name-desc':
          return b.fullName.localeCompare(a.fullName, 'es', { sensitivity: 'base' });
        case 'date-desc':
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        case 'date-asc':
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        case 'id-asc': {
          const numA = parseInt(a.idNumber.replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(b.idNumber.replace(/\D/g, ''), 10) || 0;
          return numA - numB;
        }
        case 'id-desc': {
          const numA = parseInt(a.idNumber.replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(b.idNumber.replace(/\D/g, ''), 10) || 0;
          return numB - numA;
        }
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [users, searchQuery, roleFilter, statusFilter, sortBy]);

  // Reset page to 1 whenever filters or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, sortBy, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * itemsPerPage;
  const endIndex = Math.min(filteredUsers.length, startIndex + itemsPerPage);
  const paginatedUsers = useMemo(() => {
    if (itemsPerPage >= 9999) return filteredUsers;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, startIndex, endIndex, itemsPerPage]);

  // Selection helpers for Current Page & All Filtered
  const isAllCurrentPageSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedUserIds.includes(u.id));

  const isSomeCurrentPageSelected =
    paginatedUsers.some((u) => selectedUserIds.includes(u.id)) &&
    !isAllCurrentPageSelected;

  const handleToggleSelectAllPage = () => {
    if (isAllCurrentPageSelected) {
      // Deselect all on current page
      const pageIds = new Set(paginatedUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      // Select all on current page
      const newIds = new Set(selectedUserIds);
      paginatedUsers.forEach((u) => newIds.add(u.id));
      setSelectedUserIds(Array.from(newIds));
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedUserIds(filteredUsers.map((u) => u.id));
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
  };

  const handleToggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Bulk Actions
  const handleBulkStatusChange = async (status: VerificationStatus) => {
    if (selectedUserIds.length === 0) return;
    const count = selectedUserIds.length;
    await bulkReviewUserStatus(
      selectedUserIds,
      status,
      `Actualización masiva de estado a "${status}" por administrador`
    );
    handleClearSelection();
  };

  const handleBulkViewerVisibility = (visible: boolean) => {
    if (selectedUserIds.length === 0) return;
    bulkToggleViewerVisibility(selectedUserIds, visible);
    handleClearSelection();
  };

  // Single Actions

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      fullName: editingUser.fullName,
      email: editingUser.email,
      phone: editingUser.phone,
      idNumber: editingUser.idNumber,
      role: editingUser.role,
      status: editingUser.status,
      visibleToViewers: editingUser.visibleToViewers,
      notes: editingUser.notes,
    });
    setEditingUser(null);
  };

  const handleReviewDecision = (status: VerificationStatus) => {
    if (!reviewingUser) return;
    reviewUserStatus(reviewingUser.id, status, reviewNotes || undefined);
    setReviewingUser(null);
    setReviewNotes('');
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTicket || !ticketReplyText.trim()) return;

    replyToTicket(replyingTicket.id, ticketReplyText.trim(), ticketReplyStatus);
    setReplyingTicket(null);
    setTicketReplyText('');
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    addNews({
      title: newsTitle.trim(),
      category: newsCategory,
      summary: newsSummary.trim() || newsContent.slice(0, 100) + '...',
      content: newsContent.trim(),
      author: currentUser?.fullName || 'Dirección de Administración',
      important: newsImportant,
      imageUrl: '/images/campo-petrolero-1068x712.jpg',
    });

    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
    setIsCreateNewsModalOpen(false);
  };

  // Header column click toggle sorting
  const toggleSort = (type: 'name' | 'id' | 'status' | 'date') => {
    if (type === 'name') {
      setSortBy((prev) => (prev === 'name-asc' ? 'name-desc' : 'name-asc'));
    } else if (type === 'id') {
      setSortBy((prev) => (prev === 'id-asc' ? 'id-desc' : 'id-asc'));
    } else if (type === 'status') {
      setSortBy('status');
    } else if (type === 'date') {
      setSortBy((prev) => (prev === 'date-desc' ? 'date-asc' : 'date-desc'));
    }
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total en Supabase
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {totalUsers}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {approvedUsers} aprobados • {rejectedUsers} rechazados
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0e1b29] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('revision');
            }}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cédulas por Revisar
              </div>
              <div className="text-3xl font-black text-amber-600 mt-1">
                {pendingReviews}
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                Haz clic para revisar en cola
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('tickets')}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-400 transition-colors"
          >
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tickets Pendientes
              </div>
              <div className="text-3xl font-black text-[#d9251d] mt-1">
                {pendingTickets}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Casos que requieren solución
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#d9251d] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => setAdminSubView('viewer')}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all"
            title="Haz clic para abrir el Portal de Visor y exportar archivos"
          >
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Lista para Visores
              </div>
              <div className="text-3xl font-black text-indigo-700 mt-1">
                {viewerAllowedUsers}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Visibles en auditoría externa (Clic para ver)
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl p-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'usuarios'
              ? 'bg-[#0e1b29] text-white shadow-md'
              : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Usuarios ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className={`py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'revision'
              ? 'bg-[#0e1b29] text-white shadow-md'
              : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
              }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Revisar Cédulas ({pendingReviews})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'tickets'
              ? 'bg-[#0e1b29] text-white shadow-md'
              : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tickets de Soporte ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('noticias')}
            className={`py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'noticias'
              ? 'bg-[#0e1b29] text-white shadow-md'
              : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
              }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Publicador de Noticias ({news.length})</span>
          </button>
        </div>

        {/* TAB 1: USERS MANAGEMENT TABLE */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search and Advanced Filters Toolbar */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Search input (phone number, government id, email, name) */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por teléfono, cédula o correo..."
                    className="w-full pl-10 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d9251d] shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter and Sorting dropdowns */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Status filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                      Estado:
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#d9251d] shadow-sm"
                    >
                      <option value="todos">Todos los Estados ({totalUsers})</option>
                      <option value="pendiente">Pendientes ({pendingReviews})</option>
                      <option value="aprobado">Aprobados ({approvedUsers})</option>
                      <option value="rechazado">Rechazados ({rejectedUsers})</option>
                    </select>
                  </div>

                  {/* Sorting dropdown (alphabetical, date, id) */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                      Ordenar:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#d9251d] shadow-sm"
                    >
                      <option value="name-asc">Alfabético: A → Z (Nombre)</option>
                      <option value="name-desc">Alfabético: Z → A (Nombre)</option>
                      <option value="date-desc">Más recientes primero (Fecha)</option>
                      <option value="date-asc">Más antiguos primero (Fecha)</option>
                      <option value="id-asc">Cédula: Menor a Mayor</option>
                      <option value="id-desc">Cédula: Mayor a Menor</option>
                      <option value="status">Por Estado de Verificación</option>
                    </select>
                  </div>

                  {/* Role filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                      Rol:
                    </span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#d9251d] shadow-sm"
                    >
                      <option value="todos">Todos los Roles</option>
                      <option value="client">Clientes</option>
                      <option value="viewer">Visores</option>
                      <option value="admin">Administradores</option>
                    </select>
                  </div>

                  {/* Items per page selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                      Por Página:
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#d9251d] shadow-sm"
                    >
                      <option value={10}>10 usuarios</option>
                      <option value={25}>25 usuarios</option>
                      <option value={50}>50 usuarios</option>
                      <option value={100}>100 usuarios</option>
                      <option value={9999}>Mostrar Todos ({totalUsers})</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status and count sub-bar */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">
                    Mostrando {filteredUsers.length === 0 ? 0 : startIndex + 1} -{' '}
                    {endIndex} de {filteredUsers.length} usuarios
                  </span>
                  {searchQuery && (
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                      Filtrado por: &quot;{searchQuery}&quot;
                    </span>
                  )}
                  {statusFilter !== 'todos' && (
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] capitalize">
                      Estado: {statusFilter}
                    </span>
                  )}
                </div>

                {/* Quick select all toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSelectAllPage}
                    className="text-xs font-bold text-[#0e1b29] hover:text-[#d9251d] flex items-center gap-1 transition-colors"
                  >
                    {isAllCurrentPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#d9251d]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {isAllCurrentPageSelected
                        ? 'Deseleccionar Página Actual'
                        : 'Seleccionar Página Actual'}
                    </span>
                  </button>

                  {filteredUsers.length > paginatedUsers.length && (
                    <button
                      onClick={handleSelectAllFiltered}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline ml-2"
                    >
                      Seleccionar los {filteredUsers.length} usuarios coincidentes
                    </button>
                  )}
                </div>
              </div>

              {/* Floating / Sticky Bulk Action Bar when items are selected */}
              {selectedUserIds.length > 0 && (
                <div className="bg-[#0e1b29] text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#d9251d] text-white flex items-center justify-center font-bold text-xs">
                      {selectedUserIds.length}
                    </span>
                    <span className="text-xs font-bold tracking-wide">
                      {selectedUserIds.length === 1
                        ? '1 usuario seleccionado'
                        : `${selectedUserIds.length} usuarios seleccionados`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold hidden md:inline">
                      Acciones Masivas:
                    </span>
                    <button
                      onClick={() => handleBulkStatusChange('aprobado')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprobar Cédulas</span>
                    </button>

                    <button
                      onClick={() => handleBulkStatusChange('rechazado')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>

                    <button
                      onClick={() => handleBulkStatusChange('pendiente')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Marcar Pendiente</span>
                    </button>

                    <button
                      onClick={() => handleBulkViewerVisibility(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hacer Visibles</span>
                    </button>

                    <button
                      onClick={() => handleBulkViewerVisibility(false)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar</span>
                    </button>

                    <button
                      onClick={handleClearSelection}
                      className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    {/* Master Checkbox */}
                    <th className="py-3.5 px-4 w-10 text-center">
                      <button
                        onClick={handleToggleSelectAllPage}
                        className="p-1 text-slate-500 hover:text-[#d9251d] transition-colors"
                        title={
                          isAllCurrentPageSelected
                            ? 'Deseleccionar todos los de la página'
                            : 'Seleccionar todos los de la página'
                        }
                      >
                        {isAllCurrentPageSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#d9251d]" />
                        ) : isSomeCurrentPageSelected ? (
                          <MinusSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>

                    {/* Column: Name (Clickable Sort) */}
                    <th
                      onClick={() => toggleSort('name')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/80 transition-colors select-none"
                      title="Haz clic para ordenar alfabéticamente"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Usuario / Nombre Oficial</span>
                        {sortBy === 'name-asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#d9251d]" />
                        ) : sortBy === 'name-desc' ? (
                          <ArrowDown className="w-3.5 h-3.5 text-[#d9251d]" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* Column: ID / Cédula (Clickable Sort) */}
                    <th
                      onClick={() => toggleSort('id')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/80 transition-colors select-none"
                      title="Haz clic para ordenar por número de cédula"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Cédula Oficial</span>
                        {sortBy === 'id-asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#d9251d]" />
                        ) : sortBy === 'id-desc' ? (
                          <ArrowDown className="w-3.5 h-3.5 text-[#d9251d]" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5 px-4">Teléfono de Contacto</th>
                    <th className="py-3.5 px-4">Rol</th>

                    {/* Column: Verification Status (Clickable Sort) */}
                    <th
                      onClick={() => toggleSort('status')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/80 transition-colors select-none"
                      title="Haz clic para ordenar por estado"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Estado Cédula</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>

                    <th className="py-3.5 px-4 text-center">Visible para Visores</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <div className="text-sm font-bold text-slate-700">
                          No se encontraron usuarios coincidentes
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Prueba ajustando el texto de búsqueda o los filtros seleccionados.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors ${isSelected
                            ? 'bg-amber-50/70 hover:bg-amber-50'
                            : 'hover:bg-slate-50/80'
                            }`}
                        >
                          {/* Row Checkbox */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleUserSelection(user.id)}
                              className="p-1 text-slate-500 hover:text-[#d9251d] transition-colors"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#d9251d]" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                              )}
                            </button>
                          </td>

                          {/* Name & ID Photo thumbnail */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setReviewingUser(user);
                                  setReviewNotes(user.notes || '');
                                }}
                                className="w-12 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative group shadow-2xs hover:border-[#d9251d] transition-all"
                                title="Haz clic para inspeccionar documento de identidad"
                              >
                                <DocumentImage
                                  src={user.idPhotoUrl}
                                  alt={user.fullName}
                                  objectFit="cover"
                                  showLoadingSpinner={false}
                                  className="group-hover:scale-110 transition-transform duration-200"
                                />
                              </button>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">
                                  {user.fullName}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{user.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* ID Number */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            V-{user.idNumber}
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {user.phone || 'No registrado'}
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${user.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : user.role === 'viewer'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-emerald-100 text-emerald-800'
                                }`}
                            >
                              {user.role === 'admin'
                                ? 'Admin'
                                : user.role === 'viewer'
                                  ? 'Visor'
                                  : 'Cliente'}
                            </span>
                          </td>

                          {/* Verification Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${user.status === 'aprobado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : user.status === 'pendiente'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                            >
                              {user.status === 'aprobado' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : user.status === 'pendiente' ? (
                                <AlertCircle className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              <span className="capitalize">{user.status}</span>
                            </span>
                          </td>

                          {/* Visible to Viewers Switch */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleViewerVisibility(user.id)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all inline-flex items-center gap-1.5 ${user.visibleToViewers
                                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              title={
                                user.visibleToViewers
                                  ? 'Habilitado para vista del Visor. Haz clic para ocultar.'
                                  : 'No visible para Visores. Haz clic para habilitar.'
                              }
                            >
                              {user.visibleToViewers ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>En Lista</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Oculto</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setReviewingUser(user);
                                  setReviewNotes(user.notes || '');
                                }}
                                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-[#0e1b29]"
                                title="Revisar Cédula y Datos"
                              >
                                <FileCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingUser(user)}
                                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-[#0e1b29]"
                                title="Editar Datos"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar al usuario ${user.fullName}?`)) {
                                    deleteUser(user.id);
                                  }
                                }}
                                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                                title="Eliminar Usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {itemsPerPage < 9999 && totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  Página <strong className="text-slate-900">{effectivePage}</strong> de{' '}
                  <strong className="text-slate-900">{totalPages}</strong> ({filteredUsers.length} usuarios totales)
                </div>

                <div className="flex items-center gap-1.5">
                  {/* First page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={effectivePage <= 1}
                    className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Primera página"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous page */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={effectivePage <= 1}
                    className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page number chips */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        // Show first, last, and window around current page
                        return (
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - effectivePage) <= 1
                        );
                      })
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && p - prev > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && (
                              <span className="px-2 text-xs text-slate-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(p)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === effectivePage
                                ? 'bg-[#d9251d] text-white shadow-md'
                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  {/* Next page */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={effectivePage >= totalPages}
                    className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={effectivePage >= totalPages}
                    className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Última página"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REVIEW USER DATA */}
        {activeTab === 'revision' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#0e1b29]">
                  Cola de Revisión y Cotejo de Cédulas
                </h3>
                <p className="text-xs text-slate-500">
                  Verifica que la fotografía del documento adjunta coincida exactamente con el nombre oficial y número de cédula ingresado.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {displayedPendingUsers.length} de {pendingReviews} cédulas mostradas ({visibleReviewCount < pendingReviews ? 'lotes continuos de 20' : 'todas cargadas'})
                </span>

                {pendingReviews > 0 && (
                  <button
                    onClick={async () => {
                      const pendingIds = pendingUsers.map((u) => u.id);
                      if (
                        confirm(
                          `¿Aprobar todas las ${pendingIds.length} cédulas pendientes simultáneamente?`
                        )
                      ) {
                        await bulkReviewUserStatus(
                          pendingIds,
                          'aprobado',
                          'Aprobación masiva desde cola de revisión'
                        );
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
                <div
                  key={u.id}
                  className="bg-white rounded-xl border-2 border-amber-300 p-6 shadow-sm space-y-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Esperando Aprobación
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-1">
                        {u.fullName}
                      </h4>
                      <div className="text-xs text-slate-500 font-mono">
                        Cédula ingresada: V-{u.idNumber}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{u.createdAt}</span>
                  </div>

                  {/* ID Photo display */}
                  <div className="relative aspect-[16/10] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-300">
                    <DocumentImage
                      src={u.idPhotoUrl}
                      alt={`Foto de Cédula de ${u.fullName}`}
                      objectFit="contain"
                      showOpenButton={true}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 space-y-1">
                    <div>
                      <strong>Correo:</strong> {u.email}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {u.phone || 'No registrado'}
                    </div>
                    {u.notes && (
                      <div>
                        <strong>Notas previas:</strong> {u.notes}
                      </div>
                    )}
                  </div>

                  {/* Decision buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() =>
                        reviewUserStatus(
                          u.id,
                          'aprobado',
                          'Documento verificado y aprobado formalmente'
                        )
                      }
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aprobar Usuario</span>
                    </button>

                    <button
                      onClick={() =>
                        reviewUserStatus(
                          u.id,
                          'rechazado',
                          'Foto ilegible o inconsistencia de cédula'
                        )
                      }
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Rechazar / Observar</span>
                    </button>
                  </div>
                </div>
              ))}

              {pendingUsers.length === 0 && (
                <div className="col-span-2 bg-white rounded-xl p-12 text-center border border-slate-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">
                    ¡No hay documentos pendientes de revisión!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Todas las solicitudes de registro en la base de datos de Supabase han sido procesadas exitosamente.
                  </p>
                </div>
              )}
            </div>

            {/* Continuous scroll sentinel and load more indicator */}
            {visibleReviewCount < pendingUsers.length && (
              <div
                ref={reviewSentinelRef}
                className="py-6 text-center bg-white rounded-xl border border-dashed border-amber-300 p-6 shadow-xs flex flex-col items-center justify-center gap-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                  <span>
                    Cargando siguientes 20 cédulas ({displayedPendingUsers.length} de {pendingUsers.length} mostradas)...
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Desplázate hacia abajo para carga continua automática o pulsa el botón
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setVisibleReviewCount((prev) => Math.min(prev + 20, pendingUsers.length))
                  }
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Cargar 20 más ({pendingUsers.length - visibleReviewCount} restantes)
                </button>
              </div>
            )}

            {pendingUsers.length > 20 && visibleReviewCount >= pendingUsers.length && (
              <div className="py-3.5 text-center text-xs font-bold text-slate-500 bg-slate-100 rounded-xl border border-slate-200">
                ✓ Se han cargado todas las {pendingUsers.length} cédulas pendientes para cotejo continuo
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUPPORT TICKETS MANAGEMENT */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#0e1b29]">
                  Bandeja Central de Soporte y Casos
                </h3>
                <p className="text-xs text-slate-500">
                  Responde a las solicitudes de los clientes y actualiza el estado de atención.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-[#d9251d] text-xs font-bold">
                {pendingTickets} casos abiertos
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-700">
                        {t.id}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{t.subject}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {t.category}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${t.status === 'Resuelto'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'En Proceso'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    <strong>Cliente:</strong> {t.userName} ({t.userEmail}) • {t.createdAt}
                  </div>

                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {t.message}
                  </p>

                  {t.adminReply && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                      <strong>Respuesta enviada ({t.repliedAt}):</strong> {t.adminReply}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setReplyingTicket(t);
                        setTicketReplyText(t.adminReply || '');
                      }}
                      className="px-4 py-2 bg-[#0e1b29] hover:bg-[#1a2c3f] text-white text-xs font-bold uppercase rounded-lg shadow flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#d9251d]" />
                      <span>
                        {t.adminReply ? 'Editar Respuesta' : 'Responder al Cliente'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NEWS PUBLISHER */}
        {activeTab === 'noticias' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#0e1b29]">
                  Publicador de Boletines y Noticias
                </h3>
                <p className="text-xs text-slate-500">
                  Los comunicados redactados aquí se publicarán inmediatamente en el portal de los clientes y la página de inicio.
                </p>
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
                <div
                  key={n.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 relative group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-[#0e1b29] bg-slate-100 px-2 py-0.5 rounded">
                      {n.category}
                    </span>
                    <span>{n.date}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {n.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-3">{n.content}</p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Autor: {n.author}</span>
                    <button
                      onClick={() => deleteNews(n.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Eliminar Noticia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: REVIEW USER DETAILS & ID PHOTO */}
      {reviewingUser && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#d9251d]" />
                <h3 className="text-base font-bold">Auditoría de Documento de Identidad</h3>
              </div>
              <button
                onClick={() => setReviewingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold uppercase">
                    Nombre Completo
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {reviewingUser.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase">
                    Cédula Declarada
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    V-{reviewingUser.idNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase">
                    Correo Electrónico
                  </span>
                  <span className="text-slate-800">{reviewingUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase">
                    Teléfono
                  </span>
                  <span className="text-slate-800">
                    {reviewingUser.phone || 'No registrado'}
                  </span>
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
                  onClick={() => handleReviewDecision('aprobado')}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprobar Cédula</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewDecision('rechazado')}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Rechazar Documento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
              <h3 className="text-base font-bold">Editar Usuario</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, fullName: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Cédula
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.idNumber}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        idNumber: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, phone: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Rol
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="client">Cliente</option>
                    <option value="viewer">Visor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Estatus
                  </label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        status: e.target.value as VerificationStatus,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="aprobado">Aprobado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="visibleToViewersEdit"
                  checked={editingUser.visibleToViewers}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      visibleToViewers: e.target.checked,
                    })
                  }
                  className="rounded text-[#d9251d]"
                />
                <label
                  htmlFor="visibleToViewersEdit"
                  className="font-semibold text-slate-700"
                >
                  Visible en la lista para Visores / Auditores
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold rounded-lg shadow"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      n

      {/* MODAL: REPLY TO TICKET */}
      {replyingTicket && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
              <h3 className="text-base font-bold">
                Responder al Ticket {replyingTicket.id}
              </h3>
              <button
                onClick={() => setReplyingTicket(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTicketReply} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">
                  {replyingTicket.subject}
                </div>
                <div className="text-slate-600 mt-1">{replyingTicket.message}</div>
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
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nuevo Estado del Caso
                </label>
                <select
                  value={ticketReplyStatus}
                  onChange={(e) =>
                    setTicketReplyStatus(e.target.value as SupportTicket['status'])
                  }
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
                  onClick={() => setReplyingTicket(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold"
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
      )}

      {/* MODAL: CREATE NEWS */}
      {isCreateNewsModalOpen && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
              <h3 className="text-base font-bold">Publicar Comunicado Oficial</h3>
              <button
                onClick={() => setIsCreateNewsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNews} className="p-6 space-y-4 text-xs">
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
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
                    id="newsImportant"
                    checked={newsImportant}
                    onChange={(e) => setNewsImportant(e.target.checked)}
                    className="rounded text-[#d9251d]"
                  />
                  <label htmlFor="newsImportant" className="font-semibold text-slate-700">
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
                  onClick={() => setIsCreateNewsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold"
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
      )}
    </div>
  );
};
