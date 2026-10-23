'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  User,
  LayoutDashboard,
  Home,
  CreditCard,
  Mail
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { getUserUID } from '@/lib/types';

export const UserUidBadge = () => {
  const { currentUser, activeView, setActiveView } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  const uid = getUserUID(currentUser);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleLabel =
    currentUser.role === 'admin'
      ? '👑 Administrador'
      : currentUser.role === 'viewer'
        ? '👁️ Auditor'
        : '👤 Cliente';

  return (
    <div className="fixed bottom-4 right-4 z-[130] font-sans selection:bg-[#d9251d] selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-[#0e1b29]/95 text-white border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden max-w-xs sm:max-w-sm transition-all"
      >
        {/* Main Tab Pill */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/60 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </span>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <span>UID CONTROL</span>
                <span className="text-emerald-400 font-mono text-[9px]">• ACTIVO</span>
              </div>
              <span className="font-mono font-black text-xs sm:text-sm text-slate-100 tracking-wide truncate">
                {uid}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-lg border text-xs transition-all ${copied
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
                }`}
              title="Copiar UID oficial"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Expand / Collapse Button */}
            <button
              type="button"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition-colors"
              title={isExpanded ? 'Ocultar detalles' : 'Ver ficha de sesión'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-800 px-3.5 py-3 bg-[#08111b]/95 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#d9251d]" />
                  Usuario:
                </span>
                <span className="font-bold text-slate-200 truncate max-w-[170px]">
                  {currentUser.fullName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  Rol:
                </span>
                <span className="font-semibold text-slate-300">{roleLabel}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-amber-400" />
                  Cédula:
                </span>
                <span className="font-mono text-slate-300">V-{currentUser.idNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-400" />
                  Correo:
                </span>
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[170px]">
                  {currentUser.email}
                </span>
              </div>

              {/* View Switcher Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {activeView === 'landing' ? (
                  <button
                    type="button"
                    onClick={() => setActiveView('portal')}
                    className="w-full py-1.5 px-3 bg-[#d9251d] hover:bg-[#b81c15] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Ir a Mi Portal</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveView('landing')}
                    className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Ver Página Principal</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
