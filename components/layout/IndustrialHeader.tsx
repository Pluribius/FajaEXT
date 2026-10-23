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
  // New user form state
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  {/* MODAL: CREATE USER */ }
  {
    isCreateUserModalOpen && (
      <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
            <h3 className="text-base font-bold">Crear Nuevo Usuario</h3>
            <button
              onClick={() => setIsCreateUserModalOpen(false)}
              className="text-slate-400 hover:text-white"
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
                className="font-semibold text-slate-700"
              >
                Incluir en la lista visible para Visores
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold rounded-lg shadow"
              >
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Top Demo Helper Bar */}
      <div className="bg-[#08111b] text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800 z-[110] relative">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d9251d] animate-pulse" />
              <span className="font-semibold text-slate-200 uppercase tracking-wider">
                FajaEXT • Dev Build:
              </span>
            </div>

            {/* Supabase backend status pill */}
            <div
              onClick={() => refreshSupabaseUsers()}
              className="hidden sm:flex items-center gap-1.5 text-[10px] bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/80 cursor-pointer hover:border-slate-500 transition-colors"
              title="Haga clic para sincronizar perfiles con Supabase"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isSupabaseLoading
                  ? 'bg-amber-400 animate-ping'
                  : supabaseConnected
                    ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    : 'bg-amber-400'
                  }`}
              />
              <span className="font-mono text-slate-300">
                {isSupabaseLoading
                  ? 'Sincronizando Supabase...'
                  : supabaseConnected
                    ? `Supabase Conectado (${totalUsers} registros)`
                    : 'Supabase Offline (Demo Local)'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">

            <button
              onClick={() => openAuthModal('register')}
              className="px-2 py-0.5 rounded font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 transition-all"
              title="Abrir formulario de registro"
            >
              📝 Registrar Nuevo
            </button>
            <button
              onClick={resetDemoData}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1"
              title="Restablecer datos demo"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main PetroLink Header (matches reference image) */}
      <header
        className={`sticky top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3.5 border-b border-slate-200'
          : 'bg-white py-5 border-b border-slate-100'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo PetroLink */}
          <Link
            href="/"
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-[#0e1b29] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-[#d9251d]" />
            </div>
            <div className="text-2xl font-black tracking-tight text-[#0e1b29]">
              Petro<span className="text-[#d9251d]">Link</span>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (



              <div className="flex items-center gap-3">
                {/*Export button*/}
                {currentUser.role === 'admin' && activeView === 'portal' && (
                  <button
                    onClick={() => setAdminSubView(adminSubView === 'viewer' ? 'dashboard' : 'viewer')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${adminSubView === 'viewer'
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
                      }`}
                    title={
                      adminSubView === 'viewer'
                        ? 'Volver al Panel de Administración'
                        : 'Ver Modo Visor para exportar cédulas y nóminas'
                    }
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{adminSubView === 'viewer' ? '← Panel Admin' : 'Modo Visor (Exportar)'}</span>
                  </button>
                )}

                {/*Create Users*/}
                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className={`"px-5 py-3 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs
                     uppercase tracking-wider rounded-lg shadow transition-all flex items-center 
                     gap-2 cursor-pointer"
                     
                    }`}

                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear Usuario</span>
                </button>


                <button
                  onClick={() => setActiveView(activeView === 'portal' ? 'landing' : 'portal')}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#d9251d]" />
                  <span>{activeView === 'portal' ? 'Ver Página Principal' : 'Ir a Mi Portal'}</span>
                </button>

                <div className="flex items-center gap-2 bg-[#0e1b29] text-white px-3.5 py-1.5 rounded-lg shadow-sm">
                  <div className="text-right">
                    <div className="text-xs font-bold truncate max-w-[140px] leading-tight">
                      {currentUser.fullName}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#d9251d]">
                      {currentUser.role === 'admin'
                        ? 'Administrador'
                        : currentUser.role === 'viewer'
                          ? 'Visor Autorizado'
                          : 'Cliente'}
                    </span>
                  </div>
                  {/* Logout Button*/}
                  <button
                    onClick={logout}
                    title="Cerrar Sesión"
                    className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0e1b29] hover:text-[#d9251d] transition-colors"
                >
                  Registrarse
                </button>

                {/* Dark Navy CTA Button like reference image "Request A Quote" / "Iniciar Sesión" */}
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider bg-[#0e1b29] hover:bg-[#1a2c3f] text-white shadow-md hover:shadow-lg transition-all"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
            <div className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              <button
                onClick={() => {
                  setActiveView('landing');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 hover:text-[#d9251d]"
              >
                Inicio
              </button>
              <a
                href="#nosotros"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#d9251d]"
              >
                Nosotros
              </a>
              <a
                href="#servicios"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#d9251d]"
              >
                Servicios
              </a>
              <a
                href="#noticias"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#d9251d]"
              >
                Noticias
              </a>
              <a
                href="#contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#d9251d]"
              >
                Contacto
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {currentUser ? (
                <>
                  <button
                    onClick={() => {
                      setActiveView(activeView === 'portal' ? 'landing' : 'portal');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded bg-[#0e1b29] text-white font-bold text-xs uppercase"
                  >
                    {activeView === 'portal' ? 'Ver Página Principal' : 'Ir a Mi Portal'}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded bg-slate-100 text-slate-700 font-bold text-xs uppercase flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      openAuthModal('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded bg-[#0e1b29] text-white font-bold text-xs uppercase"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded bg-[#d9251d] text-white font-bold text-xs uppercase"
                  >
                    Crear Cuenta de Cliente
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
