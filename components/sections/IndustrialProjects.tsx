'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, HardHat, Gauge, Droplet, ArrowRight } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialProjects = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();

  const stats = [
    { label: 'Barriles Diarios Fiscalizados', value: '1.2M+', icon: Droplet },
    { label: 'Confiabilidad Operacional', value: '99.8%', icon: Gauge },
    { label: 'Horas Hombre Sin Accidentes', value: '4.5M', icon: HardHat },
    { label: 'Cumplimiento Normativo ISO', value: '100%', icon: ShieldCheck },
  ];

  return (
    <section id="proyectos" className="w-full py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-[#0e1b29] text-white rounded-2xl shadow-xl mb-20 border-b-4 border-[#d9251d]">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-2">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#d9251d] mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs text-slate-300 font-medium mt-1 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Strategic Infrastructure Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#d9251d]">
              Infraestructura y Conectividad
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0e1b29] leading-tight">
              Desarrollo Integral en los Cuadrantes de la Faja del Orinoco
            </h3>
            <p className="text-slate-600 leading-relaxed text-base">
              Nuestra plataforma coordina estaciones de flujo, oleoductos matrices y complejos de mejoramiento. Mediante el portal PetroLink, clientes y auditores autorizados acceden de forma segura a datos certificados, documentación oficial y soporte directo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-sm text-[#0e1b29] mb-1">
                  Transparencia y Seguridad
                </h5>
                <p className="text-xs text-slate-500">
                  Verificación de documentos de identidad con auditoría humana previa a la habilitación en nómina.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-sm text-[#0e1b29] mb-1">
                  Portal Multirrol
                </h5>
                <p className="text-xs text-slate-500">
                  Vistas segmentadas y seguras para Clientes, Administradores y Visores externos.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (currentUser) {
                    setActiveView('portal');
                  } else {
                    openAuthModal('register');
                  }
                }}
                className="px-6 py-3 bg-[#0e1b29] hover:bg-[#1a2c3f] text-white font-bold text-xs uppercase tracking-wider rounded-md shadow transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{currentUser ? 'Ir al Panel de Control' : 'Registrar Empresa o Contratista'}</span>
                <ArrowRight className="w-4 h-4 text-[#d9251d]" />
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/11] bg-slate-100 border border-slate-200">
            <Image
              src="/images/campo-petrolero-1068x712.jpg"
              alt="Campo Petrolero PetroLink"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 text-white max-w-sm">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#d9251d]">
                Complejo Operacional
              </span>
              <h4 className="text-xl font-black mt-1">
                Bloque Carabobo y Junín
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Monitoreo continuo de pozos, separación y despacho automatizado.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
