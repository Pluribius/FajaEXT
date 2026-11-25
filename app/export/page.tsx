
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/auth/AppContext';
import { formatIdNumber, getUserUID } from '@/lib/types';
import { exportUsersToCSV, exportUsersToExcel } from '@/lib/viewerExports';
import {
  DEFAULT_REPORT_OPTIONS,
  EXPORT_STATE_STORAGE_KEY,
  PersistedExportState,
  ReportLayout,
  ReportOptions,
  SelectedDocument,
} from '@/components/listing/types';
import { ExportToolbar } from '@/components/export/ExportToolbar';
import { ExportUsersTable } from '@/components/export/ExportUsersTable';
import { DocumentPreviewModal } from '@/components/listing/DocumentPreviewModal';
import ContourLines from '@/components/ui/ContourLines';

const EXPORT_TOGGLES_STORAGE_KEY = 'fajaext_export_toolbar_toggles_v3';

interface PersistedExportToggles {
  showVisibleScope: boolean;
  showInvisibleScope: boolean;
  showApprovedStatus: boolean;
  showRejectedStatus: boolean;
}

export default function ExportPage() {
  const {
    currentUser,
    isSupabaseLoading,
    users,
    refreshSupabaseUsers,
  } = useApp();

  const router = useRouter();
  const hasHydratedToggles = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showVisibleScope, setShowVisibleScope] = useState(true);
  const [showInvisibleScope, setShowInvisibleScope] = useState(false);
  const [showApprovedStatus, setShowApprovedStatus] = useState(true);
  const [showRejectedStatus, setShowRejectedStatus] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>(DEFAULT_REPORT_OPTIONS);
  const [selectedDoc, setSelectedDoc] = useState<SelectedDocument | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isSupabaseLoading) {
      if (!currentUser) {
        router.replace('/home');
      } else if (currentUser.role === 'client') {
        router.replace('/user');
      }
    }
  }, [currentUser, isSupabaseLoading, router]);

  useEffect(() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'viewer') {
      refreshSupabaseUsers();
    }
  }, [currentUser, refreshSupabaseUsers]);

  // Restore saved toolbar toggles from localStorage + sessionStorage report state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let restoredVisible = true;
    let restoredInvisible = false;
    let restoredApproved = true;
    let restoredRejected = false;

    try {
      const localRaw = window.localStorage.getItem(EXPORT_TOGGLES_STORAGE_KEY);
      if (localRaw) {
        const parsedLocal = JSON.parse(localRaw) as Partial<PersistedExportToggles>;
        if (typeof parsedLocal.showVisibleScope === 'boolean') {
          restoredVisible = parsedLocal.showVisibleScope;
        }
        if (typeof parsedLocal.showInvisibleScope === 'boolean') {
          restoredInvisible = parsedLocal.showInvisibleScope;
        }
        if (typeof parsedLocal.showApprovedStatus === 'boolean') {
          restoredApproved = parsedLocal.showApprovedStatus;
        }
        if (typeof parsedLocal.showRejectedStatus === 'boolean') {
          restoredRejected = parsedLocal.showRejectedStatus;
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    try {
      const raw = window.sessionStorage.getItem(EXPORT_STATE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedExportState>;
        if (typeof parsed.searchQuery === 'string') setSearchQuery(parsed.searchQuery);
        if (parsed.reportOptions) {
          setReportOptions((prev) => ({ ...prev, ...parsed.reportOptions }));
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }

    setShowVisibleScope(restoredVisible);
    setShowInvisibleScope(restoredInvisible);
    setShowApprovedStatus(restoredApproved);
    setShowRejectedStatus(restoredRejected);
    hasHydratedToggles.current = true;
  }, []);

  // Persist ExportToolbar toggles in localStorage
  useEffect(() => {
    if (!hasHydratedToggles.current || typeof window === 'undefined') return;
    try {
      const payload: PersistedExportToggles = {
        showVisibleScope,
        showInvisibleScope,
        showApprovedStatus,
        showRejectedStatus,
      };
      window.localStorage.setItem(EXPORT_TOGGLES_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore localStorage errors
    }
  }, [showVisibleScope, showInvisibleScope, showApprovedStatus, showRejectedStatus]);

  const visibleUsersCount = useMemo(
    () => users.filter((u) => u.visibleToViewers).length,
    [users]
  );

  const invisibleUsersCount = useMemo(
    () => users.filter((u) => !u.visibleToViewers).length,
    [users]
  );

  // Effective scope: both ON -> all users; both OFF -> default to visible; otherwise match active toggle
  const effectiveVisibleScope = !showVisibleScope && !showInvisibleScope ? true : showVisibleScope;
  const effectiveInvisibleScope = !showVisibleScope && !showInvisibleScope ? false : showInvisibleScope;

  const baseUsers = useMemo(() => {
    if (currentUser?.role !== 'admin') {
      return users.filter((u) => u.visibleToViewers);
    }
    if (effectiveVisibleScope && effectiveInvisibleScope) {
      return users;
    }
    if (effectiveVisibleScope) {
      return users.filter((u) => u.visibleToViewers);
    }
    return users.filter((u) => !u.visibleToViewers);
  }, [currentUser?.role, users, effectiveVisibleScope, effectiveInvisibleScope]);

  // Effective status: both OFF -> default to aprobado; otherwise match active status toggle(s)
  const effectiveApprovedStatus =
    !showApprovedStatus && !showRejectedStatus ? true : showApprovedStatus;
  const effectiveRejectedStatus =
    !showApprovedStatus && !showRejectedStatus ? false : showRejectedStatus;

  const approvedUsersCount = useMemo(
    () => baseUsers.filter((u) => u.status === 'aprobado').length,
    [baseUsers]
  );

  const rejectedUsersCount = useMemo(
    () => baseUsers.filter((u) => u.status === 'rechazado').length,
    [baseUsers]
  );

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return baseUsers
      .filter((u) => {
        const matchesStatus =
          (effectiveApprovedStatus && u.status === 'aprobado') ||
          (effectiveRejectedStatus && u.status === 'rechazado');
        if (!matchesStatus) return false;

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
  }, [baseUsers, searchQuery, effectiveApprovedStatus, effectiveRejectedStatus]);

  const derivedAdminScope: 'all' | 'visible' =
    effectiveVisibleScope && !effectiveInvisibleScope ? 'visible' : 'all';

  // Persist active filter & options in sessionStorage for /print
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload: PersistedExportState = {
        searchQuery,
        adminScope: derivedAdminScope,
        reportOptions,
      };
      window.sessionStorage.setItem(EXPORT_STATE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore sessionStorage errors
    }
  }, [searchQuery, derivedAdminScope, reportOptions]);

  if (!currentUser || currentUser.role === 'client') {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#030a13] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
            Cargando Módulo de Exportación...
          </p>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    exportUsersToCSV(filteredUsers);
  };

  const handleExportExcel = async () => {
    if (isExportingExcel) return;
    setIsExportingExcel(true);
    setStatusMessage(null);

    try {
      await exportUsersToExcel(filteredUsers);
    } catch {
      setStatusMessage({ type: 'error', text: 'Hubo un error al generar el archivo Excel.' });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleNavigateToPrint = (layoutOverride?: ReportLayout) => {
    const nextOptions = layoutOverride
      ? { ...reportOptions, reportLayout: layoutOverride }
      : reportOptions;

    if (layoutOverride) {
      setReportOptions(nextOptions);
    }

    if (typeof window !== 'undefined') {
      try {
        const payload: PersistedExportState = {
          searchQuery,
          adminScope: derivedAdminScope,
          reportOptions: nextOptions,
        };
        window.sessionStorage.setItem(EXPORT_STATE_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage errors
      }
    }

    const query = layoutOverride ? `?layout=${layoutOverride}` : '';
    router.push(`/print${query}`);
  };

  return (
    <div className="bg-slate-200 relative w-full min-h-screen text-slate-100 flex flex-col font-sans overflow-x-clip pb-12">

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        <ExportToolbar
          isAdmin={currentUser.role === 'admin'}
          visibleUsersCount={visibleUsersCount}
          invisibleUsersCount={invisibleUsersCount}
          approvedUsersCount={approvedUsersCount}
          rejectedUsersCount={rejectedUsersCount}
          showVisibleScope={showVisibleScope}
          showInvisibleScope={showInvisibleScope}
          showApprovedStatus={showApprovedStatus}
          showRejectedStatus={showRejectedStatus}
          isExportingExcel={isExportingExcel}
          onToggleVisibleScope={() => setShowVisibleScope((prev) => !prev)}
          onToggleInvisibleScope={() => setShowInvisibleScope((prev) => !prev)}
          onToggleApprovedStatus={() => setShowApprovedStatus((prev) => !prev)}
          onToggleRejectedStatus={() => setShowRejectedStatus((prev) => !prev)}
          onNavigateToPrint={handleNavigateToPrint}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
        />

        {statusMessage && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${statusMessage.type === 'success'
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

        <ExportUsersTable
          users={filteredUsers}
          allowedUsersCount={visibleUsersCount}
          searchQuery={searchQuery}
          isExportingExcel={isExportingExcel}
          onSearchChange={setSearchQuery}
          onSelectDoc={setSelectedDoc}
          onNavigateToPrint={handleNavigateToPrint}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
        />
      </div>

      <DocumentPreviewModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}