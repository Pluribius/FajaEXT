'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  Clock,
  AlertTriangle,
  PlusCircle,
  MessageSquare,
  FileText,
  Calendar,
  CheckCircle2,
  Eye,
  X,
  ExternalLink,
  Lock,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';
import { SupportTicket, getUserUID, formatIdNumber } from '@/lib/types';
import { DocumentImage } from '@/lib/DocumentImage';
import { getOriginalDocumentUrl } from '@/lib/documentUtils';
import ContourLines from '@/components/ui/ContourLines';

export const ClientPortal = () => {
  const {
    currentUser,
    news,
    tickets,
    createTicket,
    changeEmail,
    changePassword,
    resendConfirmation,
    updateUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'resumen' | 'documento' | 'noticias' | 'soporte'>('resumen');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Email update state
  const [newEmail, setNewEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // UID copy feedback
  const [copiedUid, setCopiedUid] = useState(false);

  // New ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('Técnico');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('Media');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState(false);

  if (!currentUser) return null;

  const idPrefix = currentUser.idType === false || (currentUser as any).ID_Type === false ? 'E' : 'V';
  const myTickets = tickets.filter(
    (t) =>
      t.userId === currentUser.id ||
      (t.userEmail && currentUser.email && t.userEmail.toLowerCase() === currentUser.email.toLowerCase())
  );

  const handleCopyUid = () => {
    const uid = getUserUID(currentUser);
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2500);
  };

  const handleIdTypeChange = async (newType: boolean) => {
    await updateUser(currentUser.id, { idType: newType });
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isSubmittingEmail) return;
    setIsSubmittingEmail(true);
    setEmailMsg(null);
    const res = await resendConfirmation(currentUser.email);
    setIsSubmittingEmail(false);
    setEmailMsg({
      success: res.success,
      text: res.message || res.error || (res.success ? 'Correo de confirmación enviado exitosamente.' : 'Error al reenviar correo.'),
    });

    if (res.success) {
      setResendCooldown(45);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@') || isSubmittingEmail) return;
    setIsSubmittingEmail(true);
    setEmailMsg(null);
    const res = await changeEmail(newEmail);
    setIsSubmittingEmail(false);
    setEmailMsg({
      success: res.success,
      text: res.message || res.error || (res.success ? 'Correo actualizado con éxito.' : 'Error al actualizar el correo.'),
    });

    if (res.success) {
      setNewEmail('');
      setIsEditingEmail(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6 || isSubmittingPassword) return;

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ success: false, text: 'Las contraseñas no coinciden.' });
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordMsg(null);
    const res = await changePassword(newPassword);
    setIsSubmittingPassword(false);
    setPasswordMsg({
      success: res.success,
      text: res.message || res.error || (res.success ? 'Contraseña actualizada con éxito.' : 'Error al cambiar contraseña.'),
    });

    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    createTicket({
      subject: ticketSubject.trim(),
      category: ticketCategory,
      priority: ticketPriority,
      message: ticketMessage.trim(),
    });

    setTicketSubject('');
    setTicketMessage('');
    setTicketSuccessMsg(true);
    setTimeout(() => {
      setTicketSuccessMsg(false);
      setIsTicketModalOpen(false);
    }, 1500);
  };

  // Progress computation
  const isApproved = currentUser.status === 'aprobado';
  const isPending = currentUser.status === 'pendiente';
  const progressPercent = isApproved ? 100 : isPending ? 65 : 40;

  return (
    <div className="relative w-full min-h-screen text-slate-100 flex flex-col font-sans overflow-x-clip pb-12">
      {/* Background Animated Contour Lines */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <ContourLines bgColor="#030a13" lineColor="#00b4d8" />
        <div className="absolute inset-0 bg-[#030a13]/70 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-3 sm:px-5 py-4 space-y-3.5">

        {/* Condensed Header Bar (MarineTraffic Style) */}
        <div className="bg-[#0b1622]/95 border border-slate-700/60 rounded-xl p-3 sm:p-4 shadow-sm backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left: Entity Name, Flags & Chips */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                  {currentUser.fullName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {formatIdNumber(currentUser)}
                </span>
              </div>

              {/* Status Badge */}
              {isApproved ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Aprobado / Certificado</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Clock className="w-3 h-3" />
                  <span>En Validación Oficial</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Observado</span>
                </span>
              )}

              <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
                UID: <strong className="text-slate-200">{getUserUID(currentUser)}</strong>
              </span>
            </div>

            {/* Right: Action Buttons Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyUid}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Copiar Código UID"
              >
                {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span className="hidden sm:inline">{copiedUid ? 'Copiado' : 'Copiar UID'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  isEditingEmail
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Correo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditingPassword(!isEditingPassword)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  isEditingPassword
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Seguridad</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#d9251d] hover:bg-[#b81c15] text-white shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Crear Ticket</span>
              </button>
            </div>
          </div>

          {/* Integrated Navigation Tabs Strip */}
          <div className="flex items-center gap-1 border-t border-slate-800/80 pt-2.5 mt-3 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'resumen'
                  ? 'bg-white/10 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Ficha & Expediente
            </button>

            <button
              onClick={() => setActiveTab('documento')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'documento'
                  ? 'bg-white/10 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Cédula Digitalizada
            </button>

            <button
              onClick={() => setActiveTab('noticias')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'noticias'
                  ? 'bg-white/10 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Noticias Oficiales</span>
              {news.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-500 text-white">
                  {news.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('soporte')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'soporte'
                  ? 'bg-white/10 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Tickets de Soporte</span>
              {myTickets.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-slate-950">
                  {myTickets.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Inline Modals for Email and Password updates */}
        {isEditingEmail && (
          <div className="bg-[#0b1622]/95 border border-indigo-500/40 rounded-xl p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Actualizar Dirección de Correo Electrónico
              </span>
              <button onClick={() => setIsEditingEmail(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleChangeEmailSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="email"
                placeholder={currentUser.email}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
              <button
                type="submit"
                disabled={isSubmittingEmail}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {isSubmittingEmail ? 'Guardando...' : 'Guardar Nuevo Correo'}
              </button>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || isSubmittingEmail}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-colors whitespace-nowrap border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar Confirmación'}
              </button>
            </form>
            {emailMsg && (
              <p className={`text-xs mt-2 ${emailMsg.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {emailMsg.text}
              </p>
            )}
          </div>
        )}

        {isEditingPassword && (
          <div className="bg-[#0b1622]/95 border border-indigo-500/40 rounded-xl p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Cambio de Contraseña de Acceso
              </span>
              <button onClick={() => setIsEditingPassword(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="password"
                placeholder="Nueva Contraseña (mín 6 car.)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
            {passwordMsg && (
              <p className={`text-xs mt-2 ${passwordMsg.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {passwordMsg.text}
              </p>
            )}
          </div>
        )}

        {/* TAB 1: RESUMEN & EXPEDIENTE (The Condensed Telemetry Grid) */}
        {activeTab === 'resumen' && (
          <div className="space-y-3.5">
            {/* Voyage / Expediente Progress Card (MarineTraffic Signature Element) */}
            <div className="bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-3.5 sm:p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Progreso de Validación del Expediente
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {progressPercent}% Completado
                </span>
              </div>

              {/* Step Bar Track */}
              <div className="relative py-2">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  />
                </div>

                {/* Milestone Markers */}
                <div className="grid grid-cols-4 text-center mt-3 gap-2">
                  <div className="flex flex-col items-center">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">✓</span>
                    <span className="text-[11px] font-bold text-slate-200 mt-1">1. Registro</span>
                    <span className="text-[10px] text-slate-500">{currentUser.createdAt}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">✓</span>
                    <span className="text-[11px] font-bold text-slate-200 mt-1">2. Cédula Adjunta</span>
                    <span className="text-[10px] text-slate-500">Digitalizada</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isApproved ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950 animate-pulse'
                    }`}>
                      {isApproved ? '✓' : '•'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-200 mt-1">3. Auditoría</span>
                    <span className="text-[10px] text-slate-500">{isApproved ? 'Certificada' : 'En Cola'}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isApproved ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_#10b981]' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {isApproved ? '✓' : '4'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-200 mt-1">4. Acta Convenio</span>
                    <span className="text-[10px] text-slate-500">{isApproved ? 'Nómina Oficial' : 'Pendiente'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dense 3-Column Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              
              {/* Column 1: Ficha Técnica del Titular (General Specs Table) */}
              <div className="lg:col-span-5 bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-3.5 sm:p-4 shadow-sm backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Ficha Técnica del Titular
                    </span>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  {/* Dense Key-Value Rows */}
                  <div className="divide-y divide-slate-800/60 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Nombre Legal:</span>
                      <span className="font-bold text-white text-right">{currentUser.fullName}</span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Tipo de Documento:</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={idPrefix}
                          onChange={(e) => handleIdTypeChange(e.target.value === 'V')}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px] font-bold text-indigo-400 focus:outline-none"
                        >
                          <option value="V">V (Venezolana)</option>
                          <option value="E">E (Extranjera)</option>
                        </select>
                        <span className="font-mono font-bold text-white">{currentUser.idNumber}</span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Teléfono Móvil:</span>
                      <span className="font-mono text-slate-200">{currentUser.phone || 'No registrado'}</span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Correo Registrado:</span>
                      <span className="font-mono text-slate-200 truncate max-w-[200px]" title={currentUser.email}>
                        {currentUser.email}
                      </span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Lote Asignado:</span>
                      <span className="font-bold text-indigo-300 font-mono">
                        {currentUser.batchId || 'Lote Inicial 01'}
                      </span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Código UID Token:</span>
                      <span className="font-mono text-[11px] text-emerald-400 font-black">
                        {getUserUID(currentUser)}
                      </span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Fecha de Registro:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{currentUser.createdAt}</span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Estatus en Nómina:</span>
                      <span className={`text-[11px] font-black uppercase ${isApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {currentUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Auditoría Acta Convenio</span>
                  <span className="text-slate-300 font-mono">Activo</span>
                </div>
              </div>

              {/* Column 2: Cédula de Identidad Digitalizada (Vessel Photo Style) */}
              <div className="lg:col-span-4 bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-3.5 sm:p-4 shadow-sm backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Cédula Digitalizada
                    </span>
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  {/* Photo Preview Container */}
                  <div className="relative w-full h-44 bg-slate-950/80 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group">
                    <DocumentImage
                      src={currentUser.idPhotoUrl}
                      alt={currentUser.fullName}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay Action Buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoModal(currentUser.idPhotoUrl)}
                        className="px-3 py-1.5 bg-[#d9251d] text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 cursor-pointer hover:bg-[#b81c15]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Zoom</span>
                      </button>

                      {getOriginalDocumentUrl(currentUser.idPhotoUrl) && (
                        <a
                          href={getOriginalDocumentUrl(currentUser.idPhotoUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 cursor-pointer hover:bg-slate-700 border border-slate-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Original</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Sub-table below photo */}
                  <div className="divide-y divide-slate-800/60 text-xs mt-3">
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Tipo de Documento:</span>
                      <span className="text-slate-200 font-bold">{idPrefix === 'V' ? 'Cédula Venezolana' : 'Cédula Extranjera'}</span>
                    </div>
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Identificador:</span>
                      <span className="text-white font-mono font-bold">{currentUser.idNumber}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPhotoModal(currentUser.idPhotoUrl)}
                  className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Inspeccionar Imagen Completa</span>
                </button>
              </div>

              {/* Column 3: Resumen de Seguridad & Auditoría */}
              <div className="lg:col-span-3 bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-3.5 sm:p-4 shadow-sm backdrop-blur-md flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Auditoría & Seguridad
                    </span>
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className="space-y-2.5">
                    {/* Status Box */}
                    <div className={`p-2.5 rounded-lg border text-xs ${
                      isApproved
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : isPending
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}>
                      <div className="font-bold flex items-center gap-1.5">
                        {isApproved ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        <span>{isApproved ? 'Expediente Verificado' : 'Revisión en Proceso'}</span>
                      </div>
                      <p className="text-[11px] mt-1 opacity-90 leading-tight">
                        {isApproved
                          ? 'Tu expediente se encuentra certificado en la base de datos de auditoría externa para nómina.'
                          : 'Tus documentos están siendo validados por el equipo administrativo.'}
                      </p>
                    </div>

                    {/* Notes if available */}
                    {currentUser.notes && (
                      <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                        <strong className="block text-slate-400 uppercase text-[10px]">Nota de Auditoría:</strong>
                        {currentUser.notes}
                      </div>
                    )}

                    {/* Quick Ticket Summary */}
                    <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
                      <div className="flex justify-between items-center text-slate-400 text-[11px] mb-1">
                        <span>Tickets de Soporte:</span>
                        <strong className="text-white">{myTickets.length}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('soporte')}
                        className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Ver historial de tickets →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                    className="w-full py-1.5 bg-[#d9251d] hover:bg-[#b81c15] text-white text-xs font-bold uppercase rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reportar o Consultar</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENTO COMPLETO */}
        {activeTab === 'documento' && (
          <div className="bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-4 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Inspección de Cédula de Identidad
                </h3>
                <p className="text-xs text-slate-400">
                  Vista oficial digitalizada del documento de identidad cargado en la plataforma.
                </p>
              </div>

              {getOriginalDocumentUrl(currentUser.idPhotoUrl) && (
                <a
                  href={getOriginalDocumentUrl(currentUser.idPhotoUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Descargar Archivo Original</span>
                </a>
              )}
            </div>

            <div className="w-full min-h-[400px] max-h-[600px] bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex items-center justify-center relative">
              <DocumentImage
                src={currentUser.idPhotoUrl}
                alt={currentUser.fullName}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* TAB 3: NOTICIAS OFICIALES */}
        {activeTab === 'noticias' && (
          <div className="bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-4 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Comunicados Oficiales & Noticias ({news.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Boletines informativos sobre los avances del censo de la Faja Petrolífera del Orinoco.
                </p>
              </div>
            </div>

            {news.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No hay comunicados publicados actualmente.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {news.map((item) => (
                  <div key={item.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-indigo-400 uppercase tracking-wider">{item.category}</span>
                      <span>{item.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                    <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800/80">
                      Publicado por: {item.author}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TICKETS DE SOPORTE */}
        {activeTab === 'soporte' && (
          <div className="bg-[#0b1622]/90 border border-slate-700/60 rounded-xl p-4 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mis Tickets de Soporte ({myTickets.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Seguimiento de consultas, reportes técnicos y solicitudes de corrección de datos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="px-3 py-1.5 bg-[#d9251d] hover:bg-[#b81c15] text-white text-xs font-bold uppercase rounded-lg shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nuevo Ticket</span>
              </button>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No tienes tickets abiertos. Si requieres asistencia o corregir tus datos, haz clic en "Nuevo Ticket".
              </div>
            ) : (
              <div className="space-y-3">
                {myTickets.map((t) => (
                  <div key={t.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">
                          #{t.id.slice(0, 8)}
                        </span>
                        <h4 className="font-bold text-white text-sm">{t.subject}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300">
                          {t.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          t.status === 'Resuelto'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{t.message}</p>
                    {t.reply && (
                      <div className="mt-2 p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-200">
                        <strong className="block text-[10px] text-emerald-400 uppercase font-black mb-0.5">
                          Respuesta de Administración:
                        </strong>
                        {t.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Photo Zoom Modal */}
      {selectedPhotoModal && (
        <div
          onClick={() => setSelectedPhotoModal(null)}
          className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#0b1622] border border-slate-700 rounded-2xl p-4 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Visualización en Alta Resolución
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-[65vh] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
              <DocumentImage
                src={selectedPhotoModal}
                alt="Documento en alta resolución"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0b1622] border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100">
            <div className="bg-[#07101a] p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#d9251d]" />
                <h3 className="text-sm font-bold text-white">Crear Ticket de Soporte</h3>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="p-4 space-y-3">
              {ticketSuccessMsg && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket registrado exitosamente. Te responderemos a la brevedad.</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Asunto del Ticket
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Corrección en número de cédula o teléfono"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#d9251d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Categoría
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#d9251d]"
                  >
                    <option value="Técnico">Soporte Técnico</option>
                    <option value="Validación">Validación de Datos</option>
                    <option value="Corrección de Cédula">Corrección de Cédula</option>
                    <option value="Pago / Lote">Consulta de Nómina</option>
                    <option value="Otro">Otro Asunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#d9251d]"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explica detalladamente tu solicitud..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#d9251d] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-700 text-slate-300 font-bold text-xs uppercase rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs uppercase rounded-lg shadow cursor-pointer transition-colors"
                >
                  Enviar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
