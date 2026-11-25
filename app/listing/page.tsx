'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, Users } from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';
import { AppUser } from '@/lib/types';
import { UserManagementTab } from '@/components/listing/UserManagementTab';
import { DocumentReviewTab } from '@/components/listing/DocumentReviewTab';
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

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#030a13] text-slate-300">
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

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-clip bg-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        {/* Tab Selection */}
        <div className="w-full bg-[#0e1b29] text-white rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-xl border-b-4 border-violet-600 mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={`min-h-[40px] md:min-h-[36px] py-2 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap cursor-pointer tabular-nums ${activeTab === 'usuarios'
              ? 'bg-violet-600 text-white shadow-md'
              : 'bg-[#152538] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50'
              }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Gestión y Filtrado de Usuarios ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revision')}
            className={`min-h-[40px] md:min-h-[36px] py-2 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap cursor-pointer tabular-nums ${activeTab === 'revision'
              ? 'bg-violet-600 text-white shadow-md'
              : 'bg-[#152538] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50'
              }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span>Revisar Cédulas en Cola ({pendingReviews})</span>
          </button>
        </div>

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

      {/* Listing Modals */}
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
    </div>
  );
}