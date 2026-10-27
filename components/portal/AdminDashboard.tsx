'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileCheck, MessageSquare, Newspaper } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { AppUser } from '@/lib/types';
import { AdminMetrics } from '@/components/admin/AdminMetrics';
import { UserManagementTab } from '@/components/admin/UserManagementTab';
import { DocumentReviewTab } from '@/components/admin/DocumentReviewTab';
import { SupportTicketsTab } from '@/components/admin/SupportTicketsTab';
import { NewsPublisherTab } from '@/components/admin/NewsPublisherTab';
import { EditUserModal } from '@/components/admin/modals/EditUserModal';
import { ReviewDocModal } from '@/components/admin/modals/ReviewDocModal';

export const AdminDashboard = () => {
  const {
    currentUser,
    users,
    tickets,
    news,
    setAdminSubView,
    refreshSupabaseUsers,
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
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [reviewingUser, setReviewingUser] = useState<AppUser | null>(null);

  useEffect(() => {
    refreshSupabaseUsers();
  }, [refreshSupabaseUsers]);

  const totalUsers = users.length;
  const pendingReviews = users.filter((u) => u.status === 'pendiente').length;
  const approvedUsers = users.filter((u) => u.status === 'aprobado').length;
  const rejectedUsers = users.filter((u) => u.status === 'rechazado').length;
  const pendingTickets = tickets.filter((t) => t.status !== 'Resuelto').length;
  const viewerAllowedUsers = users.filter((u) => u.visibleToViewers).length;

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
    });
    setEditingUser(null);
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Metric Overview */}
        <AdminMetrics
          totalUsers={totalUsers}
          approvedUsers={approvedUsers}
          rejectedUsers={rejectedUsers}
          pendingReviews={pendingReviews}
          pendingTickets={pendingTickets}
          viewerAllowedUsers={viewerAllowedUsers}
          onTabChange={setActiveTab}
          onOpenViewer={() => setAdminSubView('viewer')}
        />

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

        {/* Tab Views */}
        {activeTab === 'usuarios' && (
          <UserManagementTab
            users={users}
            setEditingUser={setEditingUser}
            deleteUser={deleteUser}
            toggleViewerVisibility={toggleViewerVisibility}
            reviewUserStatus={reviewUserStatus}
            bulkReviewUserStatus={bulkReviewUserStatus}
            bulkToggleViewerVisibility={bulkToggleViewerVisibility}
            onSelectUserForReview={setReviewingUser}
          />
        )}

        {activeTab === 'revision' && (
          <DocumentReviewTab
            users={users}
            reviewUserStatus={reviewUserStatus}
            bulkReviewUserStatus={bulkReviewUserStatus}
          />
        )}

        {activeTab === 'tickets' && (
          <SupportTicketsTab tickets={tickets} replyToTicket={replyToTicket} />
        )}

        {activeTab === 'noticias' && (
          <NewsPublisherTab
            news={news}
            authorName={currentUser?.fullName || 'Dirección de Administración'}
            addNews={addNews}
            deleteNews={deleteNews}
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
      />
    </div>
  );
};