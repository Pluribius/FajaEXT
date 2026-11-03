'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';

export const IndustrialNews = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();

  const companies = [
    {
      title: 'Ameriven / Hamaca',
      desc: <>Bloque Ayacucho • Operaciones de extracción<br className="hidden lg:block" /> y mejorador de Jose</>,
      image: '/images/HAMACA.jpg',
      tag: 'Consorcio Hamaca',
    },
    {
      title: 'Sincor / Total / Statoil',
      desc: 'Bloque Junín • Crudo extrapesado y plantas de coquificación',
      image: '/images/SINCOR.jpg',
      tag: 'Proyecto Sincor',
    },
    {
      title: 'Petrozuata / Conoco',
      desc: 'Convenio de asociación matriz de perforación profunda',
      image: '/images/CONOCOPHILLIPS.jpg',
      tag: 'ConocoPhillips',
    },
    {
      title: 'Cerro Negro / ExxonMobil',
      desc: 'Bloque Carabobo • Complejo de refinación y despacho',
      image: '/images/EXXON.jpg',
      tag: 'Exxon / Mobil',
    },
    {
      title: 'Contratistas de Servicio',
      desc: <>Mantenimiento, soldadura, transporte<br className="hidden lg:block" /> fluvial e ingeniería civil</>,
      image: '/images/SUBCONTRATOS.jpg',
      tag: 'Subcontratos',
    },
  ];

  return (
    <section id="empresas" className="w-full pt-20 lg:pt-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Split Header: Bold Headline on Left, Context & Blue Pill Button on Right */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-14">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0e1b29] tracking-tight leading-[1.15]">
              Empresas Participantes en la Acta Convenio.
            </h2>
          </div>

          <div className="max-w-md space-y-4">
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Trabajadores con experiencia demostrable en estas empresas pueden inscribirse en nuestro directorio, no obstante la aprobacion de pago de pasivos queda bajo la autoridad de las entidades correspondientes.
            </p>
          </div>
        </div>
      </div>

      {/* Minimalist Horizontal Stack taking the entire viewport width */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 pb-[5%]" style={{ marginBottom: '-1px' }}>
        {companies.map((item, idx) => (
          <div
            key={idx}
            className="group relative w-full aspect-square bg-slate-900 overflow-hidden flex flex-col justify-end p-6 border-r border-b border-white/10"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95"
            />

            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            {/* Content info */}
            <div className="relative z-10 text-white space-y-1.5">
              <span className="text-[20px] font-black uppercase tracking-widest text-[#d9251d] block">
                {item.tag}
              </span>
              <h4 className="text-base font-black text-white leading-snug">
                {item.title}
              </h4>
              <div className="text-xs text-slate-300 leading-relaxed min-h-[2rem]">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Wave / Brush Stroke Accent */}
      <div className="w-full relative h-10 sm:h-14 overflow-hidden pointer-events-none -my-1 bg-white">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-[#d9251d] fill-current">
          <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" opacity="0.15"></path>
          <path d="M0,20 C200,110 400,-20 650,80 C850,160 1050,40 1200,70 L1200,120 L0,120 Z" opacity="100"></path>
        </svg>
      </div>

      {/* Wide Refinery Photo Banner */}
      <div className="relative w-full h-60 sm:h-96 lg:h-[260px] bg-[#d9251d] overflow-hidden pt-[2%]">
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="max-w-8xl space-y-2">
            <h3 className="text-4xl sm:text-7xl lg:text-10xl font-black text-white tracking-tight leading-tight">
              Uniendo Esfuerzos por el Bienestar de Quienes Forjaron la Faja
            </h3>
          </div>
        </div>
      </div>

      {/* Modern Wave / Brush Stroke Accent bridging directly into the blue footer (#00529b) */}
      <div className="w-full relative h-12 sm:h-16 overflow-hidden pointer-events-none bg-[#00529b]" style={{ marginBottom: '-2px' }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-[#d9251d] fill-current scale-y-[-1]">
          <path d="M0,0 C300,90 600,0 900,60 C1050,90 1150,30 1200,20 L1200,120 L0,120 Z" opacity="1"></path>
        </svg>
      </div>

    </section>
  );
};