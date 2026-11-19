'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileCheck } from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';
import { AppUser } from '@/lib/types';
import { AdminSubNav } from '@/components/admin/AdminSubNav';
import { UserManagementTab } from '@/components/admin/UserManagementTab';
import { DocumentReviewTab } from '@/components/admin/DocumentReviewTab';
import { EditUserModal } from '@/components/modals/EditUserModal';
import { ReviewDocModal } from '@/components/modals/ReviewDocModal';

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
      <div className="min-h-screen flex-1 flex items-center justify-center bg-[#01161e] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d9251d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Cargando Gestión de Usuarios...</p>
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
    <div className="w-full bg-[#01161e] min-h-screen flex flex-col">
      <AdminSubNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl p-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-[#0e1b29] text-white shadow-md'
                : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión y Filtrado de Usuarios ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className={`py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'revision'
                ? 'bg-[#0e1b29] text-white shadow-md'
                : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
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

      {/* Shared Modals */}
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
