'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, FileCheck, Building, Landmark, ChevronRight } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialNews = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();

  const companies = [
    {
      title: 'Ameriven / Hamaca',
      desc: 'Bloque Ayacucho • Operaciones de extracción y mejorador de Jose',
      image: '/images/platform-oil.jpg',
      tag: 'Consorcio Hamaca',
    },
    {
      title: 'Sincor / Total / Statoil',
      desc: 'Bloque Junín • Crudo extrapesado y plantas de coquificación',
      image: '/images/refinery-workers.jpg',
      tag: 'Proyecto Sincor',
    },
    {
      title: 'Petrozuata / Conoco',
      desc: 'Convenio de asociación matriz de perforación profunda',
      image: '/images/exploracion.jpg',
      tag: 'ConocoPhillips',
    },
    {
      title: 'Cerro Negro / ExxonMobil',
      desc: 'Bloque Carabobo • Complejo de refinación y despacho',
      image: '/images/campo-petrolero-1068x712.jpg',
      tag: 'Exxon / Mobil',
    },
    {
      title: 'Contratistas de Servicio',
      desc: 'Mantenimiento, soldadura, transporte fluvial e ingeniería civil',
      image: '/images/oil-industry.jpg',
      tag: 'Subcontratos',
    },
  ];

  return (
    <section id="empresas" className="w-full bg-white pt-20 pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        
        {/* Section Header: Left Title, Right Pill Button (Matches Reference Image) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0e1b29] tracking-tight leading-tight">
              Empresas y Convenios en Proceso de Regularización
            </h2>
          </div>

          <button
            onClick={() => {
              if (currentUser) {
                setActiveView('portal');
              } else {
                openAuthModal('register');
              }
            }}
            className="self-start sm:self-auto px-6 py-2.5 rounded-full border border-slate-300 hover:border-[#0060af] text-[#0060af] hover:bg-[#0060af] hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Ver Listado Completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Column Vertical Cards (Exact match to the 5 thin rounded cards in reference image) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {companies.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden aspect-[9/14] bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-4 border border-slate-200"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              <div className="relative z-10 text-white space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-red-400 block">
                  {item.tag}
                </span>
                <h4 className="text-sm font-black text-white leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modern Wave / Brush Stroke Accent from Reference */}
      <div className="w-full relative h-10 sm:h-14 overflow-hidden pointer-events-none -mb-1">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-[#d9251d] fill-current">
          <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" opacity="0.15"></path>
          <path d="M0,20 C200,110 400,-20 650,80 C850,160 1050,40 1200,70 L1200,120 L0,120 Z" opacity="0.3"></path>
        </svg>
      </div>

      {/* Wide Refinery Photo Banner (Matching bottom photo banner with workers walking in refinery from reference) */}
      <div className="relative w-full h-80 sm:h-96 lg:h-[460px] bg-slate-950 overflow-hidden">
        <Image
          src="/images/refinery-workers.jpg"
          alt="Trabajadores petroleros en planta industrial de almacenamiento"
          fill
          className="object-cover object-center brightness-90 contrast-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-center justify-center p-6 text-center">
          <div className="max-w-3xl space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-[#d9251d] text-white text-xs font-black uppercase tracking-widest inline-block shadow-lg">
              Compromiso Moral y Laboral
            </span>
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Uniendo Esfuerzos por el Bienestar de Quienes Forjaron la Faja
            </h3>
            <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto drop-shadow">
              Cada registro completado en esta plataforma fortalece la representatividad colectiva ante las mesas técnicas de liquidación.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};

