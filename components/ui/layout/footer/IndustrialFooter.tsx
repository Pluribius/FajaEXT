'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Mail, MapPin, ArrowUpRight, ShieldCheck, FileText } from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';

export const IndustrialFooter = () => {
  const { openAuthModal } = useApp();

  return (
    <footer id="contacto" className="bg-[#00529b] text-white/80 text-xs sm:text-sm pt-15">
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-30oi pb-6">

        {/* 4 Columns Row matching bottom blue footer of reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/20">

          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center gap-4.5">
              <div className="w-16 h-16x rounded-lg bg-white flex items-center justify-center text-[#d9251d] shadow-sm">
                <Flame className="w-10 h-10 text-[#d9251d]" />
              </div>
              <div className="text-5xl font-black tracking-tight text-black">
                FAJA<span className="text-red-400">EXT</span>
              </div>
            </div>

            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-sm">
              Programa voluntario de compilación y digitalización documental de ex-trabajadores de la Faja Petrolífera del Orinoco (1990–2010 / Proyecto Hamaca) para la regularización de pasivos laborales ante PDVSA y operadoras internacionales.
            </p>

          </div>

          {/* Column 1: Expediente & Consulta */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">
              Censo & Expediente
            </h5>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <a href="#proceso" className="hover:text-white transition-colors">Requisitos de Inscripción</a>
              </li>
              <li>
                <a href="#acta" className="hover:text-white transition-colors">Acta Convenio</a>
              </li>
              <li>
                <a href="#empresas" className="hover:text-white transition-colors">Empresas Participantes</a>
              </li>
              <li>
                <button onClick={() => openAuthModal('register')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Registrarse
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Marco Institucional */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">
              Marco de Enlace
            </h5>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <span>PDVSA Casa Matriz</span>
              </li>
              <li>
                <span>Decreto de Nacionalización 2007</span>
              </li>
              <li>
                <span>Acta Convenio Colectiva</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Contacto & Canales */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">
              Canal Oficial
            </h5>
            <div className="space-y-2.5 text-xs text-white/75">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-300 shrink-0" />
                <a href="mailto:FAJAEXT@GMAIL.COM" className="hover:text-white transition-colors font-medium">
                  FAJAEXT@GMAIL.COM
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright and Legal Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            © {new Date().getFullYear()} FAJAEXT 🇻🇪 • Made by LUA
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terminos" className="hover:text-white transition-colors">
              Términos de Consulta
            </Link>
            <Link href="/privacidad" className="hover:text-white transition-colors">
              Protección de Datos Laborales
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};