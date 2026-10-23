'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Phone, ArrowRight, Play, ShieldAlert } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialHero = () => {
  const { openAuthModal, openVideoModal, currentUser, setActiveView } = useApp();

  return (
    <section className="relative w-full bg-[#f4f7fa] overflow-hidden border-b border-slate-200">
      {/* Subtle industrial grid lines background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column (Heading, Subtitle, CTA, Pagination) */}
          <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-6">


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0e1b29] leading-[1.08] tracking-tight">
              El Vínculo con la{' '}
              <span className="text-[#0e1b29] relative inline-block">
                Excelencia
                <span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#d9251d]/15 -z-10 rounded-sm" />
              </span>{' '}
              <span className="text-[#d9251d]">Petrolera</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              Nos posicionamos como el referente primordial hacia la excelencia en el sector de energía e hidrocarburos, impulsando el progreso técnico, la integridad operacional y el desarrollo sostenible para el futuro.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  if (currentUser) {
                    setActiveView('portal');
                  } else {
                    openAuthModal('register');
                  }
                }}
                className="px-7 py-3.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-sm tracking-wider uppercase rounded-md shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <span>{currentUser ? 'Ir a Mi Portal' : 'Explorar Más'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={openVideoModal}
                className="px-6 py-3.5 bg-white hover:bg-slate-100 text-[#0e1b29] font-bold text-sm tracking-wider uppercase rounded-md border border-slate-300 shadow-sm transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#d9251d]/10 flex items-center justify-center text-[#d9251d]">
                  <Play className="w-3.5 h-3.5 fill-[#d9251d]" />
                </div>
                <span>Video Operacional</span>
              </button>
            </div>

            {/* Pagination Style Markers (01, 02, 03) like in reference photo */}
            <div className="flex items-center gap-6 pt-6 text-xs font-mono font-bold text-slate-400">
              <span className="cursor-pointer hover:text-slate-700 transition-colors">01</span>
              <span className="w-8 h-8 rounded-full border-2 border-[#0e1b29] text-[#0e1b29] flex items-center justify-center shadow-sm">
                02
              </span>
              <span className="cursor-pointer hover:text-slate-700 transition-colors">03</span>
              <div className="h-px bg-slate-300 flex-1 max-w-[120px]" />
            </div>
          </div>

          {/* Right Column (Hero Refinery Photo & Floating Contact Red Badge) */}
          <div className="lg:col-span-6 relative">
            {/* Main Refinery Image Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200 aspect-[4/3] sm:aspect-[16/11]">
              <Image
                src="/images/pexels-jan-van-der-wolf-11680885-13565263.jpg"
                alt="Instalaciones de Refinación y Destilación PetroLink"
                fill
                priority
                className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Decorative industrial square corner like reference */}
              <div className="absolute top-4 right-4 w-4 h-4 bg-[#d9251d] shadow" />
            </div>

            {/* Floating Solid Red Information Badge (Exact match to reference image bottom-right widget) */}
            <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-8 sm:right-6 bg-[#d9251d] text-white p-5 rounded-xl shadow-2xl border-2 border-white flex flex-col sm:flex-row items-start sm:items-center gap-6 z-20">

              {/* Location info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-red-200 font-semibold">
                    Ubicación Operativa
                  </div>
                  <div className="text-sm font-bold leading-tight">
                    Faja del Orinoco, Venezuela
                  </div>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-red-400/60" />

              {/* Phone info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-red-200 font-semibold">
                    Atención Central
                  </div>
                  <div className="text-sm font-bold leading-tight">
                    (+58) 212-700-PETRO
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
