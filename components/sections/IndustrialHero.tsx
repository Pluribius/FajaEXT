'use client';

import React from 'react';
import { ArrowRight, ChevronDown, FileText, Search } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialHero = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();

  return (
    <>
      {/* 1. Fullscreen Hero Video Section (Strict 100vh / 100dvh) */}
      <section className="relative w-full h-[100dvh] min-h-[640px] flex flex-col justify-end overflow-hidden bg-slate-950 pb-8 sm:pb-12">

        {/* Background Video Covering Entire Screen */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/video/heroban (2).mp4" type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>

        {/* Cinematic Gradient & Dark Overlay to make typography pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08111b] via-[#08111b]/40 to-black/30 z-10 pointer-events-none" />

        {/* Main Content Area: Placed directly in Lower Third */}
        <div className="relative z-20 max-w-7xl mx-auto px-2 sm:px-6 w-full text-center">

          {/* Giant Hero Title - Occupies full horizontal space on mobile for maximum impact */}
          <h1 className="w-full flex flex-col sm:inline-block text-[14.5vw] xs:text-[15.5vw] sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight sm:tracking-tight md:tracking-tighter text-white uppercase select-none leading-[0.92] sm:leading-none mb-3 sm:mb-4">
            <span
              className="text-transparent inline-block mr-0 sm:mr-3"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.95)',
                textShadow: '0 0 20px rgba(0,0,0,0.7)'
              }}
            >
              ACTA
            </span>
            <span className="text-white drop-shadow-2xl inline-block">
              CONVENIO
            </span>
          </h1>

        </div>

        {/* Bottom Scroll Indicator - Anchored right below the title in the lower third */}
        <div className="relative z-20 mt-4 sm:mt-6 flex justify-center">
          <a
            href="#mision-banner"
            className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors text-[10px] sm:text-[11px] font-mono uppercase tracking-widest"
          >
            <span>Desplazar</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#d9251d]" />
          </a>
        </div>

      </section>

      {/* 2. Text & CTA Banner under the Fullscreen Hero Video (Visible ONLY when scrolling down) */}
      <section id="mision-banner" className="relative w-full bg-[#08111b] text-white pt-16 pb-20 px-6 overflow-hidden border-b border-slate-800">

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">

          {/* Descriptive Subtitle - Cleanly presented once the user scrolls */}
          <p className="text-slate-200 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-3xl mx-auto">
            Plataforma voluntaria de compilación y validación de expedientes laborales de ex-trabajadores
            de la <strong className="text-white font-semibold">Faja Petrolífera del Orinoco</strong> (1990–2010 / Proyecto Hamaca),
            canalizando de forma unificada la información hacia <strong className="text-white font-semibold">PDVSA</strong> para el reconocimiento de beneficios pendientes con las operadoras internacionales.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                if (currentUser) {
                  setActiveView('portal');
                } else {
                  openAuthModal('register');
                }
              }}
              className="px-8 py-3.5 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-full shadow-2xl hover:shadow-red-600/30 transition-all flex items-center gap-2.5 cursor-pointer group"
            >
              <FileText className="w-4 h-4" />
              <span>{currentUser ? 'Ir a Mi Portal / Expediente' : 'Registrar Mi Expediente'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#censos"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-full backdrop-blur-md border border-white/25 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Search className="w-4 h-4 text-slate-300" />
              <span>Consultar Información</span>
            </a>
          </div>

        </div>

      </section>
    </>
  );
};