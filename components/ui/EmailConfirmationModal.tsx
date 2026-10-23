'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  Mail,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Edit2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const EmailConfirmationModal = () => {
  const { confirmationEmailData, closeConfirmationEmail, resendConfirmation, changeEmail } = useApp();

  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Quick edit email state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  if (!confirmationEmailData) return null;

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendStatus(null);

    const res = await resendConfirmation(confirmationEmailData.email);
    setIsResending(false);
    setResendStatus({
      success: res.success,
      message: res.message || res.error || (res.success ? 'Correo de verificación reenviado exitosamente.' : 'Error al reenviar'),
    });

    if (res.success) {
      setCooldown(45);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleSaveNewEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedEmail || !editedEmail.includes('@') || isUpdatingEmail) return;

    setIsUpdatingEmail(true);
    const res = await changeEmail(editedEmail);
    setIsUpdatingEmail(false);

    if (res.success) {
      setIsEditingEmail(false);
      setResendStatus({
        success: true,
        message: `Correo actualizado a ${editedEmail}. Se ha enviado un nuevo enlace de confirmación.`,
      });
    } else {
      setResendStatus({
        success: false,
        message: res.error || 'No se pudo actualizar el correo.',
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="bg-[#0e1b29] text-white p-6 relative flex items-center justify-between border-b-4 border-[#d9251d]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d9251d]/20 border border-[#d9251d] flex items-center justify-center text-[#d9251d]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#d9251d]">
                  Notificación del Sistema
                </span>
                <h3 className="text-lg font-bold">Correo de Confirmación Enviado</h3>
              </div>
            </div>
            <button
              onClick={closeConfirmationEmail}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email Preview Card */}
          <div className="p-6 space-y-5 bg-slate-50">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500 gap-2">
                <div>
                  <span className="font-semibold text-slate-700">De:</span> registro@petrolink.com
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Para:</span>
                  <span className="font-mono text-slate-800 font-bold">{confirmationEmailData.email}</span>
                  {!isEditingEmail && (
                    <button
                      onClick={() => {
                        setEditedEmail(confirmationEmailData.email);
                        setIsEditingEmail(true);
                      }}
                      className="text-xs text-[#d9251d] hover:underline flex items-center gap-1 ml-1"
                      title="Cambiar dirección de correo"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Cambiar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* In-modal Email Edit Form */}
              {isEditingEmail && (
                <form onSubmit={handleSaveNewEmail} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Modificar correo y reenviar confirmación:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      placeholder="nuevo-correo@ejemplo.com"
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d9251d]"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingEmail}
                      className="px-3 py-1.5 bg-[#d9251d] text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-[#b81c15] transition-colors"
                    >
                      {isUpdatingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Guardar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="px-2 py-1.5 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#d9251d] rounded-sm" />
                  <span className="font-bold text-sm text-[#0e1b29]">PetroLink Corp. | Faja del Orinoco</span>
                </div>

                <h4 className="text-base font-bold text-slate-900">
                  ¡Bienvenido(a), {confirmationEmailData.fullName}!
                </h4>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Hemos recibido exitosamente tu solicitud de registro con documento de identidad N°{' '}
                  <strong className="text-slate-900">V-{confirmationEmailData.idNumber}</strong>.
                </p>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Proceso de Verificación de Identidad:</strong> Tu documento fotográfico ha sido enviado a la mesa de control de seguridad. Un administrador revisará tu cédula en un lapso no mayor a 24 horas.
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
                  <span>Código de Verificación:</span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                    PL-VERIF-{(Math.random() * 900000 + 100000).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Resend Status Banner */}
            {resendStatus && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  resendStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {resendStatus.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{resendStatus.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                  cooldown > 0
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin text-[#d9251d]' : ''}`} />
                <span>
                  {isResending
                    ? 'Reenviando...'
                    : cooldown > 0
                    ? `Reenviar en (${cooldown}s)`
                    : 'Reenviar Correo de Confirmación'}
                </span>
              </button>

              <button
                onClick={closeConfirmationEmail}
                className="px-5 py-2.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-semibold text-sm rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <span>Entendido, Ir a Mi Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
