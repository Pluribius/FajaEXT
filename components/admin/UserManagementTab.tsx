'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Users,
    Search,
    X,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    FileCheck,
    CheckSquare,
    Square,
    MinusSquare,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Mail,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    RotateCw,
} from 'lucide-react';
import { AppUser, UserRole, VerificationStatus, formatIdNumber } from '@/lib/types';
import { DocumentImage } from '@/lib/DocumentImage';

type SortOption =
    | 'name-asc'
    | 'name-desc'
    | 'date-desc'
    | 'date-asc'
    | 'id-asc'
    | 'id-desc'
    | 'status';

interface UserManagementTabProps {
    users: AppUser[];
    setEditingUser: (user: AppUser) => void;
    deleteUser: (id: string) => void;
    bulkDeleteUsers?: (ids: string[]) => Promise<void>;
    toggleViewerVisibility: (id: string) => void;
    reviewUserStatus: (id: string, status: VerificationStatus, notes?: string) => void;
    bulkReviewUserStatus: (ids: string[], status: VerificationStatus, notes?: string) => void;
    bulkToggleViewerVisibility: (ids: string[], visible: boolean) => void;
    forceReloadUserPictures?: (ids: string[]) => void;
    onSelectUserForReview: (user: AppUser) => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
    users,
    setEditingUser,
    deleteUser,
    bulkDeleteUsers,
    toggleViewerVisibility,
    bulkReviewUserStatus,
    bulkToggleViewerVisibility,
    forceReloadUserPictures,
    onSelectUserForReview,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('todos');
    const [statusFilter, setStatusFilter] = useState<string>('todos');
    const [sortBy, setSortBy] = useState<SortOption>('name-asc');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(25);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Mass / Single Deletion Confirmation Modal State
    const [deleteModalState, setDeleteModalState] = useState<{
        isOpen: boolean;
        targetIds: string[];
        confirmText: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        targetIds: [],
        confirmText: '',
        isDeleting: false,
    });

    const totalUsers = users.length;
    const pendingReviews = users.filter((u) => u.status === 'pendiente').length;
    const approvedUsers = users.filter((u) => u.status === 'aprobado').length;
    const rejectedUsers = users.filter((u) => u.status === 'rechazado').length;

    const filteredUsers = useMemo(() => {
        const rawSearch = searchQuery.trim().toLowerCase();
        const cleanDigits = searchQuery.replace(/\D/g, '');

        const filtered = users.filter((u) => {
            const formattedId = formatIdNumber(u).toLowerCase();
            const matchesSearch =
                !rawSearch ||
                u.email.toLowerCase().includes(rawSearch) ||
                u.fullName.toLowerCase().includes(rawSearch) ||
                u.idNumber.toLowerCase().includes(rawSearch) ||
                formattedId.includes(rawSearch) ||
                u.phone.toLowerCase().includes(rawSearch) ||
                (cleanDigits.length > 0 && u.idNumber.replace(/\D/g, '').includes(cleanDigits)) ||
                (cleanDigits.length > 0 && u.phone.replace(/\D/g, '').includes(cleanDigits));

            const matchesRole = roleFilter === 'todos' || u.role === roleFilter;
            const matchesStatus = statusFilter === 'todos' || u.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter, statusFilter, sortBy, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
    const effectivePage = Math.min(currentPage, totalPages);
    const startIndex = (effectivePage - 1) * itemsPerPage;
    const endIndex = Math.min(filteredUsers.length, startIndex + itemsPerPage);
    const paginatedUsers = useMemo(() => {
        if (itemsPerPage >= 9999) return filteredUsers;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, startIndex, endIndex, itemsPerPage]);

    const isAllCurrentPageSelected =
        paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUserIds.includes(u.id));
    const isSomeCurrentPageSelected =
        paginatedUsers.some((u) => selectedUserIds.includes(u.id)) && !isAllCurrentPageSelected;

    const handleToggleSelectAllPage = () => {
        if (isAllCurrentPageSelected) {
            const pageIds = new Set(paginatedUsers.map((u) => u.id));
            setSelectedUserIds((prev) => prev.filter((id) => !pageIds.has(id)));
        } else {
            const newIds = new Set(selectedUserIds);
            paginatedUsers.forEach((u) => newIds.add(u.id));
            setSelectedUserIds(Array.from(newIds));
        }
    };

    const handleSelectAllFiltered = () => setSelectedUserIds(filteredUsers.map((u) => u.id));
    const handleClearSelection = () => setSelectedUserIds([]);
    const handleToggleUserSelection = (userId: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleBulkStatusChange = async (status: VerificationStatus) => {
        if (selectedUserIds.length === 0) return;
        await bulkReviewUserStatus(selectedUserIds, status, `Actualización masiva a "${status}"`);
        handleClearSelection();
    };

    const handleBulkViewerVisibility = (visible: boolean) => {
        if (selectedUserIds.length === 0) return;
        bulkToggleViewerVisibility(selectedUserIds, visible);
        handleClearSelection();
    };

    const handleOpenDeleteModal = (targetIds: string[]) => {
        setDeleteModalState({
            isOpen: true,
            targetIds,
            confirmText: '',
            isDeleting: false,
        });
    };

    const handleExecuteDelete = async () => {
        if (deleteModalState.confirmText.trim().toUpperCase() !== 'ELIMINAR') {
            return;
        }

        setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

        try {
            if (deleteModalState.targetIds.length === 1) {
                deleteUser(deleteModalState.targetIds[0]);
            } else if (bulkDeleteUsers) {
                await bulkDeleteUsers(deleteModalState.targetIds);
            } else {
                for (const id of deleteModalState.targetIds) {
                    deleteUser(id);
                }
            }

            // Remove deleted users from selection if they were selected
            setSelectedUserIds((prev) => prev.filter((id) => !deleteModalState.targetIds.includes(id)));
            setDeleteModalState({
                isOpen: false,
                targetIds: [],
                confirmText: '',
                isDeleting: false,
            });
        } catch (err) {
            console.error('Error deleting users:', err);
            setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    const toggleSort = (type: 'name' | 'id' | 'status' | 'date') => {
        if (type === 'name') setSortBy((prev) => (prev === 'name-asc' ? 'name-desc' : 'name-asc'));
        else if (type === 'id') setSortBy((prev) => (prev === 'id-asc' ? 'id-desc' : 'id-asc'));
        else if (type === 'status') setSortBy('status');
        else if (type === 'date') setSortBy((prev) => (prev === 'date-desc' ? 'date-asc' : 'date-desc'));
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
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
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Estado:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-sm"
                            >
                                <option value="todos">Todos los Estados ({totalUsers})</option>
                                <option value="pendiente">Pendientes ({pendingReviews})</option>
                                <option value="aprobado">Aprobados ({approvedUsers})</option>
                                <option value="rechazado">Rechazados ({rejectedUsers})</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Ordenar:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-sm"
                            >
                                <option value="name-asc">Alfabético: A → Z (Nombre)</option>
                                <option value="name-desc">Alfabético: Z → A (Nombre)</option>
                                <option value="date-desc">Más recientes primero</option>
                                <option value="date-asc">Más antiguos primero</option>
                                <option value="id-asc">Cédula: Menor a Mayor[cite: 3]</option>
                                <option value="id-desc">Cédula: Mayor a Menor[cite: 3]</option>
                                <option value="status">Por Estado de Verificación</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Rol:</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-sm"
                            >
                                <option value="todos">Todos los Roles</option>
                                <option value="client">Clientes</option>
                                <option value="viewer">Visores</option>
                                <option value="admin">Administradores</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Por Pág:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-sm"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={9999}>Todos ({totalUsers})</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 gap-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">
                            Mostrando {filteredUsers.length === 0 ? 0 : startIndex + 1} - {endIndex} de {filteredUsers.length} usuarios
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleSelectAllPage}
                            className="text-xs font-bold text-[#0e1b29] hover:text-[#d9251d] flex items-center gap-1 transition-colors"
                        >
                            {isAllCurrentPageSelected ? <CheckSquare className="w-4 h-4 text-[#d9251d]" /> : <Square className="w-4 h-4 text-slate-400" />}
                            <span>{isAllCurrentPageSelected ? 'Deseleccionar Página' : 'Seleccionar Página'}</span>
                        </button>
                        {filteredUsers.length > paginatedUsers.length && (
                            <button onClick={handleSelectAllFiltered} className="text-xs font-bold text-indigo-700 hover:underline ml-2">
                                Seleccionar los {filteredUsers.length} coincidentes
                            </button>
                        )}
                    </div>
                </div>

                {selectedUserIds.length > 0 && (
                    <div className="bg-[#0e1b29] text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-700">
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#d9251d] text-white flex items-center justify-center font-bold text-xs">
                                {selectedUserIds.length}
                            </span>
                            <span className="text-xs font-bold tracking-wide">
                                {selectedUserIds.length === 1 ? '1 seleccionado' : `${selectedUserIds.length} seleccionados`}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {forceReloadUserPictures && (
                                <button
                                    onClick={() => {
                                        forceReloadUserPictures(selectedUserIds);
                                    }}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-colors cursor-pointer"
                                    title="Forzar actualización y descarga limpia de fotos para los usuarios seleccionados"
                                >
                                    <RotateCw className="w-3.5 h-3.5" />
                                    <span>Recargar Fotos ({selectedUserIds.length})</span>
                                </button>
                            )}
                            <button onClick={() => handleBulkStatusChange('aprobado')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow">
                                Aprobar Cédulas
                            </button>
                            <button onClick={() => handleBulkStatusChange('rechazado')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow">
                                Rechazar
                            </button>
                            <button onClick={() => handleBulkViewerVisibility(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow">
                                Hacer Visibles
                            </button>
                            <button
                                onClick={() => handleOpenDeleteModal(selectedUserIds)}
                                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Eliminar masivamente los usuarios seleccionados"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar ({selectedUserIds.length})</span>
                            </button>
                            <button onClick={handleClearSelection} className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3.5 px-4 w-10 text-center">
                                <button onClick={handleToggleSelectAllPage} className="p-1 text-slate-500 hover:text-[#d9251d]">
                                    {isAllCurrentPageSelected ? <CheckSquare className="w-4 h-4 text-[#d9251d]" /> : <Square className="w-4 h-4 text-slate-400" />}
                                </button>
                            </th>
                            <th onClick={() => toggleSort('name')} className="py-3.5 px-4 cursor-pointer">
                                <div className="flex items-center gap-1.5">
                                    <span>Usuario / Nombre Oficial</span>
                                    {sortBy === 'name-asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#d9251d]" /> : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                                </div>
                            </th>
                            <th onClick={() => toggleSort('id')} className="py-3.5 px-4 cursor-pointer">
                                <div className="flex items-center gap-1.5">
                                    <span>Cédula Oficial</span>
                                    {sortBy === 'id-asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#d9251d]" /> : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                                </div>
                            </th>
                            <th className="py-3.5 px-4">Teléfono</th>
                            <th className="py-3.5 px-4">Rol</th>
                            <th onClick={() => toggleSort('status')} className="py-3.5 px-4 cursor-pointer">Estado Cédula</th>
                            <th className="py-3.5 px-4 text-center">Visible para Visores</th>
                            <th className="py-3.5 px-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedUsers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-slate-500">
                                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <div className="text-sm font-bold text-slate-700">No se encontraron usuarios coincidentes</div>
                                </td>
                            </tr>
                        ) : (
                            paginatedUsers.map((user) => {
                                const isSelected = selectedUserIds.includes(user.id);
                                return (
                                    <tr key={user.id} className={`transition-colors ${isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'}`}>
                                        <td className="py-3.5 px-4 text-center">
                                            <button onClick={() => handleToggleUserSelection(user.id)} className="p-1 text-slate-500 hover:text-[#d9251d]">
                                                {isSelected ? <CheckSquare className="w-4 h-4 text-[#d9251d]" /> : <Square className="w-4 h-4 text-slate-300" />}
                                            </button>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => onSelectUserForReview(user)}
                                                    className="w-12 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative group"
                                                >
                                                    <DocumentImage src={user.idPhotoUrl} alt={user.fullName} objectFit="cover" showLoadingSpinner={false} />
                                                </button>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{user.fullName}</div>
                                                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        <span>{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{formatIdNumber(user)}</td>
                                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{user.phone || 'No registrado'}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="capitalize">{user.status}</span>
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleViewerVisibility(user.id)}
                                                className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${user.visibleToViewers ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                {user.visibleToViewers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                <span>{user.visibleToViewers ? 'En Lista' : 'Oculto'}</span>
                                            </button>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {forceReloadUserPictures && (
                                                    <button
                                                        onClick={() => forceReloadUserPictures([user.id])}
                                                        className="p-1.5 rounded hover:bg-amber-100 text-amber-700 hover:text-amber-900"
                                                        title="Recargar Foto de Cédula"
                                                    >
                                                        <RotateCw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => onSelectUserForReview(user)} className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Revisar Cédula">
                                                    <FileCheck className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingUser(user)} className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Editar">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDeleteModal([user.id])}
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

            {itemsPerPage < 9999 && totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-600">
                        Página <strong className="text-slate-900">{effectivePage}</strong> de <strong className="text-slate-900">{totalPages}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setCurrentPage(1)} disabled={effectivePage <= 1} className="p-2 border rounded bg-white disabled:opacity-40">
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={effectivePage <= 1} className="p-2 border rounded bg-white disabled:opacity-40">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={effectivePage >= totalPages} className="p-2 border rounded bg-white disabled:opacity-40">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={effectivePage >= totalPages} className="p-2 border rounded bg-white disabled:opacity-40">
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Estricta para Eliminación Masiva o Individual */}
            {deleteModalState.isOpen && (
                <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="bg-red-700 text-white p-5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <AlertCircle className="w-5 h-5 text-white" />
                                <h3 className="text-base font-bold">
                                    {deleteModalState.targetIds.length > 1
                                        ? `¿Eliminar ${deleteModalState.targetIds.length} Usuarios?`
                                        : '¿Eliminar Usuario Definitivamente?'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setDeleteModalState({ isOpen: false, targetIds: [], confirmText: '', isDeleting: false })}
                                className="text-red-200 hover:text-white p-1 rounded-lg"
                                disabled={deleteModalState.isDeleting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 text-xs text-slate-700">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1.5 text-red-900">
                                <p className="font-bold text-sm text-red-700">⚠️ Esta acción es irreversible.</p>
                                <p>
                                    Se eliminarán de forma permanente los perfiles seleccionados, sus datos de contacto, documentos adjuntos, estatus de verificación y registros vinculados en la base de datos de Supabase.
                                </p>
                            </div>

                            {/* Summary of affected users */}
                            <div>
                                <span className="font-bold uppercase text-[11px] text-slate-500 block mb-1">
                                    Usuarios que se eliminarán ({deleteModalState.targetIds.length}):
                                </span>
                                <div className="max-h-32 overflow-y-auto bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                                    {users
                                        .filter((u) => deleteModalState.targetIds.includes(u.id))
                                        .map((u) => (
                                            <div key={u.id} className="flex items-center justify-between text-[11px]">
                                                <span className="font-bold text-slate-800">{u.fullName}</span>
                                                <span className="font-mono text-slate-500">{formatIdNumber(u)}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Safety confirmation input */}
                            <div className="space-y-1.5 pt-2">
                                <label className="block font-bold text-slate-800">
                                    Para confirmar la eliminación, escribe la palabra <span className="text-red-600 font-mono font-black">ELIMINAR</span> a continuación:
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={deleteModalState.confirmText}
                                    onChange={(e) => setDeleteModalState((prev) => ({ ...prev, confirmText: e.target.value }))}
                                    placeholder="Escribe ELIMINAR para habilitar el botón"
                                    disabled={deleteModalState.isDeleting}
                                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 focus:border-red-600 rounded-lg text-slate-900 font-mono font-bold tracking-wider text-sm focus:outline-none"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={deleteModalState.isDeleting}
                                    onClick={() => setDeleteModalState({ isOpen: false, targetIds: [], confirmText: '', isDeleting: false })}
                                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg font-bold text-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    disabled={deleteModalState.confirmText.trim().toUpperCase() !== 'ELIMINAR' || deleteModalState.isDeleting}
                                    onClick={handleExecuteDelete}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow transition-all flex items-center gap-2"
                                >
                                    {deleteModalState.isDeleting ? (
                                        <>
                                            <RotateCw className="w-4 h-4 animate-spin" />
                                            <span>Eliminando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span>Confirmar y Eliminar Definitivamente</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};