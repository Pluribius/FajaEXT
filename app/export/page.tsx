'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

export default function ExportPage() {
  const {
    currentUser,
    isSupabaseLoading,
    users,
    refreshSupabaseUsers,
  } = useApp();

  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [adminScope, setAdminScope] = useState<'all' | 'visible'>('all');
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(EXPORT_STATE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedExportState>;
      if (typeof parsed.searchQuery === 'string') setSearchQuery(parsed.searchQuery);
      if (parsed.adminScope === 'all' || parsed.adminScope === 'visible') {
        setAdminScope(parsed.adminScope);
      }
      if (parsed.reportOptions) {
        setReportOptions((prev) => ({ ...prev, ...parsed.reportOptions }));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload: PersistedExportState = {
        searchQuery,
        adminScope,
        reportOptions,
      };
      window.sessionStorage.setItem(EXPORT_STATE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [searchQuery, adminScope, reportOptions]);

  const allowedUsers = useMemo(
    () => users.filter((u) => u.visibleToViewers),
    [users]
  );

  const baseUsers = useMemo(
    () => (currentUser?.role === 'admin' && adminScope === 'all' ? users : allowedUsers),
    [currentUser?.role, adminScope, users, allowedUsers]
  );

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return baseUsers
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
  }, [baseUsers, searchQuery]);

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
          adminScope,
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
    <div className="relative w-full min-h-screen text-slate-100 flex flex-col font-sans overflow-x-clip pb-12">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <ContourLines bgColor="#030a13" lineColor="#00b4d8" />
        <div className="absolute inset-0 bg-[#030a13]/70 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <ExportToolbar
          isAdmin={currentUser.role === 'admin'}
          totalUsersCount={users.length}
          allowedUsersCount={allowedUsers.length}
          adminScope={adminScope}
          isExportingExcel={isExportingExcel}
          onAdminScopeChange={setAdminScope}
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
          allowedUsersCount={allowedUsers.length}
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