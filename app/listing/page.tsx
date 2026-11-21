'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Download,
  FileCheck,
  FileSpreadsheet,
  LayoutGrid,
  Loader2,
  Printer,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';
import { AppUser, formatIdNumber, getUserUID } from '@/lib/types';
import {
  clearImageCache,
  exportUsersToCSV,
  exportUsersToExcel,
  fetchAndCacheImageAsBase64,
} from '@/lib/viewerExports';
import {
  DEFAULT_REPORT_OPTIONS,
  ReportLayout,
  ReportOptions,
  SelectedDocument,
} from '@/components/listing/types';
import { UserManagementTab } from '@/components/listing/UserManagementTab';
import { DocumentReviewTab } from '@/components/listing/DocumentReviewTab';
import { ReportOptionsPanel } from '@/components/print/ReportOptionsPanel';
import { DocumentPreviewModal } from '@/components/listing/DocumentPreviewModal';
import { PrintReportModal } from '@/components/print/PrintReportModal';
import { EditUserModal } from '@/components/listing/EditUserModal';
import { ReviewDocModal } from '@/components/listing/ReviewDocModal';

export default function ListingPage() {
  const {
    currentUser,
    isSupabaseLoading,
    users,
    refreshSupabaseUsers,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    toggleViewerVisibility,
    reviewUserStatus,
    bulkReviewUserStatus,
    bulkToggleViewerVisibility,
    forceReloadUserPictures,
  } = useApp();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'revision'>('usuarios');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [reviewingUser, setReviewingUser] = useState<AppUser | null>(null);

  // Listing export & report state
  const [exportSearchQuery, setExportSearchQuery] = useState('');
  const [adminScope, setAdminScope] = useState<'all' | 'visible'>('all');
  const [reportOptions, setReportOptions] = useState<ReportOptions>(DEFAULT_REPORT_OPTIONS);
  const [selectedDoc, setSelectedDoc] = useState<SelectedDocument | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isSupabaseLoading) {
      if (!currentUser) {
        router.replace('/home');
      } else if (currentUser.role === 'viewer') {
        router.replace('/export');
      } else if (currentUser.role === 'client') {
        router.replace('/user');
      }
    }
  }, [currentUser, isSupabaseLoading, router]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      refreshSupabaseUsers();
    }
  }, [currentUser, refreshSupabaseUsers]);

  const allowedUsers = useMemo(
    () => users.filter((u) => u.visibleToViewers),
    [users]
  );

  const baseExportUsers = useMemo(
    () => (currentUser?.role === 'admin' && adminScope === 'all' ? users : allowedUsers),
    [currentUser?.role, adminScope, users, allowedUsers]
  );

  const filteredExportUsers = useMemo(() => {
    const q = exportSearchQuery.trim().toLowerCase();
    return baseExportUsers
      .filter((u) => {
        if (!q) return true;
        const uid = getUserUID(u).toLowerCase();
        const formattedId = formatIdNumber(u).toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.idNumber.toLowerCase().includes(q) ||
          formattedId.includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          uid.includes(q)
        );
      })
      .sort((a, b) => {
        const numA = parseInt(a.idNumber.replace(/[^0-9]/g, '') || '0', 10);
        const numB = parseInt(b.idNumber.replace(/[^0-9]/g, '') || '0', 10);
        return numA - numB;
      });
  }, [baseExportUsers, exportSearchQuery]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#01161e] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
            Cargando Gestión de Usuarios...
          </p>
        </div>
      </div>
    );
  }

  const pendingReviews = users.filter((u) => u.status === 'pendiente').length;

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      fullName: editingUser.fullName,
      email: editingUser.email,
      phone: editingUser.phone,
      idNumber: editingUser.idNumber,
      idType: editingUser.idType,
      role: editingUser.role,
      status: editingUser.status,
      visibleToViewers: editingUser.visibleToViewers,
      notes: editingUser.notes,
      idPhotoUrl: editingUser.idPhotoUrl,
    });
    setEditingUser(null);
  };

  const handleClearImageCache = async () => {
    if (isClearingCache) return;
    setIsClearingCache(true);
    setStatusMessage(null);

    try {
      clearImageCache();

      let serverPurgeMsg = 'Caché de disco eliminada';
      try {
        const res = await fetch('/api/document-image', { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          serverPurgeMsg = data.message || serverPurgeMsg;
        }
      } catch {
        // Ignore server cache endpoint failure and continue client refresh
      }

      if (forceReloadUserPictures && users.length > 0) {
        forceReloadUserPictures(users.map((u) => u.id));
      }

      const approvedWithPhotos = users.filter((u) => u.visibleToViewers && u.idPhotoUrl);
      let successCount = 0;

      const batchSize = 6;
      for (let i = 0; i < approvedWithPhotos.length; i += batchSize) {
        const batch = approvedWithPhotos.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (u) => {
            const sep = u.idPhotoUrl.includes('?') ? '&' : '?';
            const freshUrl = `${u.idPhotoUrl}${sep}refresh=true&t=${Date.now()}`;
            const cached = await fetchAndCacheImageAsBase64(freshUrl, 300, 180, u.idPhotoUrl);
            if (cached) successCount++;
          })
        );
      }

      setStatusMessage({
        type: 'success',
        text: `${serverPurgeMsg} • Imágenes recargadas: ${successCount} de ${approvedWithPhotos.length}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setStatusMessage({ type: 'error', text: `Error al limpiar la caché: ${msg}` });
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleExportCSV = () => {
    exportUsersToCSV(filteredExportUsers);
  };

  const handleExportExcel = async () => {
    if (isExportingExcel) return;
    setIsExportingExcel(true);
    setStatusMessage(null);

    try {
      await exportUsersToExcel(filteredExportUsers);
    } catch {
      setStatusMessage({ type: 'error', text: 'Hubo un error al generar el archivo Excel.' });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleOpenPrintModal = async (layoutOverride?: ReportLayout) => {
    if (layoutOverride) {
      setReportOptions((prev) => ({ ...prev, reportLayout: layoutOverride }));
    }

    setIsPrintModalOpen(true);

    for (const u of filteredExportUsers) {
      if (u.idPhotoUrl) {
        await fetchAndCacheImageAsBase64(u.idPhotoUrl, 400, 250, u.idPhotoUrl);
      }
    }
  };

  return (
    <div className="w-full bg-[#01161e] min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={`py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'usuarios'
              ? 'bg-[#0e1b29] text-white shadow-md'
              : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión y Filtrado de Usuarios ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revision')}
            className={`py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'revision'
              ? 'bg-[#0e1b29] text-white shadow-md'
              : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
              }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Revisar Cédulas en Cola ({pendingReviews})</span>
          </button>
        </div>

        {statusMessage && (
          <div
            className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
              }`}
          >
            <span>{statusMessage.text}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-xs underline ml-4 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        <ReportOptionsPanel
          isOpen={isOptionsOpen}
          options={reportOptions}
          isClearingCache={isClearingCache}
          onChange={setReportOptions}
          onClearCache={handleClearImageCache}
          onPreview={() => handleOpenPrintModal()}
          onClose={() => setIsOptionsOpen(false)}
        />

        {/* Tab Content */}
        {activeTab === 'usuarios' && (
          <UserManagementTab
            users={users}
            setEditingUser={setEditingUser}
            deleteUser={deleteUser}
            bulkDeleteUsers={bulkDeleteUsers}
            toggleViewerVisibility={toggleViewerVisibility}
            reviewUserStatus={reviewUserStatus}
            bulkReviewUserStatus={bulkReviewUserStatus}
            bulkToggleViewerVisibility={bulkToggleViewerVisibility}
            forceReloadUserPictures={forceReloadUserPictures}
            onSelectUserForReview={setReviewingUser}
          />
        )}

        {activeTab === 'revision' && (
          <DocumentReviewTab
            users={users}
            reviewUserStatus={reviewUserStatus}
            bulkReviewUserStatus={bulkReviewUserStatus}
            forceReloadUserPictures={forceReloadUserPictures}
          />
        )}
      </div>

      {/* Shared & Listing Modals */}
      {editingUser && (
        <EditUserModal
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          onSave={handleSaveEditUser}
        />
      )}

      <ReviewDocModal
        reviewingUser={reviewingUser}
        onClose={() => setReviewingUser(null)}
        onReviewDecision={reviewUserStatus}
        onForceReload={(userId) => forceReloadUserPictures([userId])}
        onUpdatePicture={(userId, newPhotoUrl) => updateUser(userId, { idPhotoUrl: newPhotoUrl })}
      />

      <DocumentPreviewModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        users={filteredExportUsers}
        auditorName={currentUser.fullName}
        options={reportOptions}
        onChangeOptions={setReportOptions}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}