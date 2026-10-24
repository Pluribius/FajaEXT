'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, VerificationStatus } from '@/lib/types';
import Link from 'next/link';
import {
  Shield,
  User,
  Eye,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Flame,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialHeader = () => {
  const {
    addUser,
    currentUser,
    users,
    logout,
    openAuthModal,
    quickSwitchRole,
    resetDemoData,
    activeView,
    setActiveView,
    adminSubView,
    setAdminSubView,
    supabaseConnected,
    isSupabaseLoading,
    refreshSupabaseUsers,
  } = useApp();

  const totalUsers = users.length;
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIdNumber, setNewIdNumber] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('client');
  const [newStatus, setNewStatus] = useState<VerificationStatus>('aprobado');
  const [newVisibleToViewers, setNewVisibleToViewers] = useState(false);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newIdNumber) return;

    addUser({
      fullName: newFullName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || '+58 412-0000000',
      idNumber: newIdNumber.replace(/\D/g, ''),
      idPhotoUrl: '/images/formato vacio rif.png',
      role: newRole,
      status: newStatus,
      visibleToViewers: newVisibleToViewers,
      notes: 'Usuario creado directamente desde el panel de administración.',
    });

    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setNewIdNumber('');
    setIsCreateUserModalOpen(false);
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* MODAL: CREATE USER */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
            <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
              <h3 className="text-base font-bold">Crear Nuevo Usuario</h3>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nombre Completo Legal *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ej. Ing. Juan Pérez"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="usuario@petrolink.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Cédula (números) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newIdNumber}
                    onChange={(e) =>
                      setNewIdNumber(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="18492043"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+58 412-1234567"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Rol Inicial
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="client">Cliente</option>
                    <option value="viewer">Visor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Estado
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as VerificationStatus)
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="aprobado">Aprobado</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newVisibleToViewers"
                  checked={newVisibleToViewers}
                  onChange={(e) => setNewVisibleToViewers(e.target.checked)}
                  className="rounded text-[#d9251d]"
                />
                <label
                  htmlFor="newVisibleToViewers"
                  className="font-semibold text-slate-700 cursor-pointer"
                >
                  Incluir en la lista visible para Visores
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold rounded-lg shadow cursor-pointer"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Header (Transparent on Hero, Solid White on Scroll) */}
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3.5 border-b border-slate-200 text-slate-900'
            : 'bg-transparent py-5 border-b border-transparent text-white'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo FAJAEXT */}
          <Link
            href="/"
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-[#d9251d] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className={`text-2xl font-black tracking-tight ${scrolled ? 'text-[#0e1b29]' : 'text-white'}`}>
              FAJA<span className="text-[#d9251d]">EXT</span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links (Matching Reference Nav: Tentang Kami, Bisnis Kami, etc) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider">
            <a
              href="#hero"
              className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'}`}
            >
              Inicio
            </a>
            <a
              href="#proceso"
              className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'}`}
            >
              Proyecto Hamaca
            </a>
            <a
              href="#censos"
              className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'}`}
            >
              Proceso y Registro
            </a>
            <a
              href="#empresas"
              className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'}`}
            >
              Consorcios
            </a>
            <a
              href="#contacto"
              className={`transition-colors hover:text-[#d9251d] ${scrolled ? 'text-slate-700' : 'text-white/90'}`}
            >
              Contacto
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUser.role === 'admin' && activeView === 'portal' && (
                  <button
                    onClick={() => setAdminSubView(adminSubView === 'viewer' ? 'dashboard' : 'viewer')}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${adminSubView === 'viewer'
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{adminSubView === 'viewer' ? '← Panel Admin' : 'Modo Visor (Exportar)'}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="px-4 py-2.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear Usuario</span>
                </button>

                <button
                  onClick={() => setActiveView(activeView === 'portal' ? 'landing' : 'portal')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${scrolled
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#d9251d]" />
                  <span>{activeView === 'portal' ? 'Ver Página Principal' : 'Ir a Mi Portal'}</span>
                </button>

                {/* User Info & Logout Badge */}
                <div className={`flex items-center justify-between gap-2.5 px-4 py-2 rounded-lg shadow-sm border ${scrolled ? 'bg-[#0e1b29] text-white border-slate-800' : 'bg-black/40 backdrop-blur-md text-white border-white/20'
                  }`}>
                  <div className="text-right">
                    <div className="text-xs font-bold truncate max-w-[130px] leading-tight">
                      {currentUser.fullName}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#d9251d] tracking-wider">
                      {currentUser.role === 'admin'
                        ? 'Administrador'
                        : currentUser.role === 'viewer'
                          ? 'Visor Autorizado'
                          : 'Cliente'}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    title="Cerrar Sesión"
                    className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAuthModal('register')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer shadow-sm ${scrolled
                      ? 'bg-slate-100 hover:bg-slate-200 text-[#0e1b29]'
                      : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20'
                    }`}
                >
                  Registrarse
                </button>

                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#0e1b29] hover:bg-[#1a2c3f] text-white shadow-sm transition-all flex items-center justify-center cursor-pointer border border-slate-800"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};