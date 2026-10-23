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
  ChevronRight,
  Eye,
  X,
  ExternalLink,
  Sparkles,
  Lock,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { SupportTicket, getUserUID } from '@/lib/types';
import { DocumentImage } from '@/components/ui/DocumentImage';
import { getOriginalDocumentUrl } from '@/lib/documentUtils';

export const ClientPortal = () => {
  const {
    currentUser,
    news,
    tickets,
    createTicket,
    changeEmail,
    changePassword,
    resendConfirmation,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'perfil' | 'noticias' | 'soporte'>('perfil');
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

  const handleCopyUid = () => {
    const uid = getUserUID(currentUser);
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2500);
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

    if (res.success) {
      setIsEditingEmail(false);
      setNewEmail('');
      setEmailMsg({
        success: true,
        text: res.message || `Correo actualizado a ${newEmail}. Se ha reenviado la confirmación al nuevo buzón.`,
      });
    } else {
      setEmailMsg({
        success: false,
        text: res.error || 'Error al actualizar el correo.',
      });
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ success: false, text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ success: false, text: 'Las contraseñas no coinciden.' });
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordMsg(null);
    const res = await changePassword(newPassword);
    setIsSubmittingPassword(false);

    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({
        success: true,
        text: res.message || 'Contraseña actualizada correctamente.',
      });
    } else {
      setPasswordMsg({
        success: false,
        text: res.error || 'No se pudo actualizar la contraseña.',
      });
    }
  };


  // Filter only tickets belonging to THIS user
  const myTickets = tickets.filter((t) => t.userId === currentUser.id);

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

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Welcome Header */}
        <div className="bg-[#0e1b29] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl border-b-4 border-[#d9251d] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#d9251d] bg-white/10 px-2.5 py-0.5 rounded">
                  Portal Exclusivo de Cliente
                </span>
                <span className="text-xs text-slate-300">
                  ID: {currentUser.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Hola, {currentUser.fullName}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Bienvenido a tu espacio personal. Aquí solo tú puedes consultar tus datos certificados, ver comunicados y solicitar soporte técnico.
              </p>
            </div>

            {/* Verification Status Badge */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl flex items-center gap-3 shrink-0">
              {currentUser.status === 'aprobado' ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-emerald-400">
                      Documento Aprobado
                    </div>
                    <div className="text-sm font-black text-white">
                      Identidad Verificada
                    </div>
                  </div>
                </>
              ) : currentUser.status === 'pendiente' ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-amber-400">
                      En Revisión Oficial
                    </div>
                    <div className="text-sm font-black text-white">
                      Cédula en Validación
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-red-400">
                      Documento Observado
                    </div>
                    <div className="text-sm font-black text-white">
                      Requiere Actualización
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mb-8 bg-white rounded-t-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'perfil'
                ? 'bg-[#0e1b29] text-white shadow-md'
                : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mis Datos Personales</span>
          </button>

          <button
            onClick={() => setActiveTab('noticias')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'noticias'
                ? 'bg-[#0e1b29] text-white shadow-md'
                : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Noticias y Comunicados ({news.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('soporte')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'soporte'
                ? 'bg-[#0e1b29] text-white shadow-md'
                : 'text-slate-600 hover:text-[#0e1b29] hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tickets de Soporte ({myTickets.length})</span>
          </button>
        </div>

        {/* TAB 1: PERSONAL DATA & ID PHOTO */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Formatted Personal Details */}
            <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-[#0e1b29]">
                  Ficha de Registro Personal Certificada
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Registrado: {currentUser.createdAt}
                </span>
              </div>

              {currentUser.status === 'pendiente' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Documentación en Proceso de Verificación:</strong>
                    Tu cédula de identidad y foto adjunta están siendo validadas por el personal de seguridad administrativa. Te llegará una notificación cuando sea aprobada formalmente.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#d9251d]" />
                    Nombre Completo Legal
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {currentUser.fullName}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#d9251d]" />
                    Cédula / Documento de Identidad
                  </div>
                  <div className="text-sm font-mono font-black text-slate-900">
                    V-{currentUser.idNumber}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#d9251d]" />
                    Correo Electrónico
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {currentUser.email}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#d9251d]" />
                    Teléfono de Contacto
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {currentUser.phone}
                  </div>
                </div>
              </div>

              {currentUser.notes && (
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800 block mb-1">Notas Administrativas:</strong>
                  {currentUser.notes}
                </div>
              )}
            </div>

            {/* Right: Uploaded ID Document Card */}
            <div className="lg:col-span-5 bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-base font-black text-[#0e1b29]">
                  Fotografía de Cédula Subida
                </h4>
                <button
                  onClick={() => setSelectedPhotoModal(currentUser.idPhotoUrl)}
                  className="text-xs font-bold text-[#d9251d] hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ampliar
                </button>
              </div>

              <div
                onClick={() => setSelectedPhotoModal(currentUser.idPhotoUrl)}
                className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-100 cursor-pointer group hover:border-[#d9251d] transition-all"
              >
                <DocumentImage
                  src={currentUser.idPhotoUrl}
                  alt="Documento de Identidad"
                  objectFit="cover"
                  showOpenButton={true}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 pointer-events-none">
                  <Eye className="w-5 h-5" />
                  <span>Click para ver en tamaño completo</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Documento verificado:</span>
                  <span className="font-semibold text-slate-800">Cédula Oficial</span>
                </div>
                <div className="flex justify-between">
                  <span>Número cotejado:</span>
                  <span className="font-mono font-semibold text-slate-800">{currentUser.idNumber}</span>
                </div>
              </div>
            </div>

            {/* Official UID Control Card */}
            <div className="lg:col-span-12 bg-gradient-to-r from-[#0e1b29] to-[#1a2f47] text-white rounded-xl p-6 border-b-4 border-[#d9251d] shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#d9251d]/20 border border-[#d9251d] flex items-center justify-center text-[#d9251d]">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-[#d9251d] font-bold">
                      Control Gubernamental Certificado
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ACTIVO
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>UID: {getUserUID(currentUser)}</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Identificador único para reportes, auditorías en garitas y convenios de la Faja del Orinoco.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyUid}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                {copiedUid ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                <span>{copiedUid ? '¡UID Copiado al Portapapeles!' : 'Copiar UID de Control'}</span>
              </button>
            </div>

            {/* Account Security & Access Settings */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Card 1: Change Email & Resend Verification */}
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-[#d9251d]/10 text-[#d9251d] flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0e1b29]">
                      Gestión de Correo Electrónico
                    </h4>
                    <span className="text-xs text-slate-500">
                      Actualiza tu correo y reenvía el enlace de verificación
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Correo Actual Registrado:
                    </span>
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={isSubmittingEmail || resendCooldown > 0}
                      className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                        resendCooldown > 0
                          ? 'text-slate-400 bg-slate-200 cursor-not-allowed'
                          : 'text-[#d9251d] hover:bg-red-50 bg-white border border-red-200'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isSubmittingEmail ? 'animate-spin' : ''}`} />
                      <span>{resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar Verificación'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {currentUser.email}
                  </div>
                </div>

                {emailMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                      emailMsg.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {emailMsg.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{emailMsg.text}</span>
                  </div>
                )}

                {!isEditingEmail ? (
                  <button
                    type="button"
                    onClick={() => {
                      setNewEmail(currentUser.email);
                      setIsEditingEmail(true);
                      setEmailMsg(null);
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-300 transition-colors"
                  >
                    ✏️ Cambiar Dirección de Correo Electrónico
                  </button>
                ) : (
                  <form onSubmit={handleChangeEmailSubmit} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nuevo Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="tu-nuevo-correo@ejemplo.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isSubmittingEmail}
                        className="flex-1 py-2.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        {isSubmittingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Guardar y Reenviar Verificación</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(false)}
                        className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Card 2: Change Password */}
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-[#0e1b29]/10 text-[#0e1b29] flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-[#0e1b29]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0e1b29]">
                      Seguridad y Contraseña
                    </h4>
                    <span className="text-xs text-slate-500">
                      Actualiza tu clave de acceso al portal corporativo
                    </span>
                  </div>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e1b29]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirmar Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e1b29]"
                        required
                      />
                    </div>
                  </div>

                  {passwordMsg && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                        passwordMsg.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {passwordMsg.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="w-full py-2.5 bg-[#0e1b29] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    {isSubmittingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>Actualizar Contraseña de Acceso</span>
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: NEWS UPDATES FROM ADMIN */}
        {activeTab === 'noticias' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#0e1b29]">
                Boletines y Comunicados Recientes
              </h3>
              <span className="text-xs text-slate-500">
                Actualizado en tiempo real por el equipo de administración
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative h-44 w-full bg-slate-200">
                    <Image
                      src={n.imageUrl || '/images/campo-petrolero-1068x712.jpg'}
                      alt={n.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#0e1b29] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {n.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {n.date} • {n.author}
                      </div>
                      <h4 className="text-base font-bold text-[#0e1b29] leading-snug mb-2">
                        {n.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {n.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-[#d9251d]">
                      Comunicado Interno Oficial
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SUPPORT TICKETS */}
        {activeTab === 'soporte' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[#0e1b29]">
                  Mis Tickets de Soporte
                </h3>
                <p className="text-xs text-slate-500">
                  Crea solicitudes para asistencia técnica, documentación, accesos a planta o facturación.
                </p>
              </div>

              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="px-5 py-2.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2 self-start cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Crear Ticket de Soporte</span>
              </button>
            </div>

            {myTickets.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800 mb-1">
                  No tienes tickets de soporte activos
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Si necesitas asistencia con tu documentación, permisos o acceso a plataformas, abre un caso de soporte aquí.
                </p>
                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="px-4 py-2 bg-[#0e1b29] text-white text-xs font-bold uppercase rounded-md shadow"
                >
                  Abrir mi Primer Ticket
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-700">
                          {ticket.id}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          {ticket.subject}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                          {ticket.category}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded ${
                            ticket.status === 'Resuelto'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ticket.status === 'En Proceso'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {ticket.message}
                    </p>

                    <div className="text-xs text-slate-400">
                      Fecha de Apertura: {ticket.createdAt}
                    </div>

                    {/* Admin Response Box if available */}
                    {ticket.adminReply && (
                      <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Respuesta del Administrador ({ticket.repliedAt}):</span>
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          {ticket.adminReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* CREATE TICKET MODAL */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#d9251d]" />
                <h3 className="text-base font-bold">Crear Ticket de Soporte</h3>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="p-6 space-y-4">
              {ticketSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ticket registrado con éxito. El equipo responderá a la brevedad.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Asunto del Ticket *
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ej. Solicitud de autorización para planta"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as SupportTicket['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                  >
                    <option value="Técnico">Técnico</option>
                    <option value="Documentación">Documentación</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Facturación">Facturación</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as SupportTicket['priority'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Descripción Detallada *
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Explica detalladamente la ayuda que requieres..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase rounded-lg hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs uppercase rounded-lg shadow"
                >
                  Enviar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PHOTO ZOOM MODAL */}
      {selectedPhotoModal && (
        <div
          onClick={() => setSelectedPhotoModal(null)}
          className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-xl p-4 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Documento de Identidad Oficial (Cédula)
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-200 p-2 flex items-center justify-center">
              <DocumentImage
                src={selectedPhotoModal}
                alt="Cédula de Identidad en Detalle"
                objectFit="contain"
                showOpenButton={true}
                className="w-full h-auto rounded-lg object-contain max-h-[70vh] shadow-sm"
              />
            </div>

            {selectedPhotoModal && selectedPhotoModal.startsWith('http') && (
              <div className="mt-3 flex justify-end">
                <a
                  href={getOriginalDocumentUrl(selectedPhotoModal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Abrir en Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
