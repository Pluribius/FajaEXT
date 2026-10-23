'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Mail, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialFooter = () => {
  const { openAuthModal } = useApp();

  return (
    <footer id="contacto" className="bg-[#08111b] text-slate-400 text-sm border-t-4 border-[#d9251d]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand and Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#d9251d] flex items-center justify-center text-white">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black tracking-tight text-white">
                Petro<span className="text-[#d9251d]">Link</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Plataforma unificada para el seguimiento de procesos ACTA CONVENIO para la Faja Petrolífera del Orinoco.
            </p>

            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Certificación ISO 9001 / OHSAS 18001 en Seguridad Industrial</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Navegación
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#nosotros" className="hover:text-white transition-colors">Sobre Nosotros</a>
              </li>
              <li>
                <a href="#Acta Convenio" className="hover:text-white transition-colors">Acta Convenio</a>
              </li>
              <li>
                <a href="#Empresas" className="hover:text-white transition-colors">Empresas</a>
              </li>
              <li>
                <a href="#noticias" className="hover:text-white transition-colors">Noticias y Boletines</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Contacto Central
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d9251d] shrink-0" />
                <span>(+58) 212-700-PETRO</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d9251d] shrink-0" />
                <span>contacto@petrolink.com</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} PetroLink Corp. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Términos de Servicio</span>
            <span className="hover:text-slate-400 cursor-pointer">Política de Privacidad</span>
            <span className="hover:text-slate-400 cursor-pointer">Seguridad Geoespacial</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
