'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, ShieldAlert, FileSpreadsheet, Building2, UserCheck } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialProjects = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();

  const operationalCards = [
    {
      title: 'Validación de Cédulas y Nóminas',
      subtitle: 'Fase de Depuración',
      desc: 'Cruce sistemático de nóminas históricas de subcontratistas y consorcios operacionales con la base de datos nacional.',
      image: '/images/platform-oil.jpg',
      badge: 'Auditoría Activa',
    },
    {
      title: 'Consorcio Petrolero Hamaca',
      subtitle: 'Bloque Ayacucho & Mejorador',
      desc: 'Ex-trabajadores de campo, soldadores, operadores de planta y personal técnico bajo contratos directos e indirectos.',
      image: '/images/campo-petrolero-1068x712.jpg',
      badge: 'Sincor / Hamaca',
    },
    {
      title: 'Expediente Digital Unificado',
      subtitle: 'Cédula, RIF, IVSS y Finiquitos',
      desc: 'Carga de comprobantes digitalizados en alta resolución para sustentar la carpeta individual ante la comisión de enlace PDVSA.',
      image: '/images/exploracion.jpg',
      badge: 'Sustento Legal',
    },
    {
      title: 'Transparencia y Consulta Pública',
      subtitle: 'Portal de Verificación',
      desc: 'Cada usuario dispone de un código UID único para certificar su estatus de elegibilidad de forma directa y sin intermediarios.',
      image: '/images/pexels-jan-van-der-wolf-11680885-16091985.jpg',
      badge: 'Acceso Inmediato',
    },
  ];

  return (
    <section id="censos" className="w-full py-24 bg-[#c81919] text-white relative overflow-hidden">
      
      {/* Background Subtle Wave Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Top Split Headline (Exact match to Red Section in Reference image) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] uppercase">
              Transformando el Reclamo en Justicia Concreta
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-red-100 text-sm sm:text-base leading-relaxed font-normal">
              Facilitamos el puente técnico y documental para que las transnacionales petroleras liquiden los montos adeudados a través de los canales institucionales de PDVSA, asegurando el beneficio a cada familia trabajadora.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid - 2x2 layout matching reference image with curved cards and rounded pill buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {operationalCards.map((item, index) => (
            <div
              key={index}
              className="group relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-slate-900 shadow-2xl border border-white/20 flex flex-col justify-end p-6 sm:p-8 transition-transform duration-500 hover:-translate-y-1.5"
            >
              {/* Card Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-90"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Bottom Card Content */}
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="space-y-1.5 max-w-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                    {item.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* White / Dark Pill Button like reference "Lihat Detail" */}
                <button
                  onClick={() => {
                    if (currentUser) {
                      setActiveView('portal');
                    } else {
                      openAuthModal('register');
                    }
                  }}
                  className="shrink-0 px-5 py-2 rounded-full bg-white/95 hover:bg-white text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                >
                  <span>Consultar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

