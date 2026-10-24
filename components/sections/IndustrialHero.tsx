'use client';

import React from 'react';
import { ArrowRight, ChevronDown, CheckCircle, FileText, Search } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialHero = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();

  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-screen flex flex-col justify-end overflow-hidden bg-slate-950 pb-16 sm:pb-24 pt-32">

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



      {/* Main Content Area matching reference image (Giant WHAT WE DO / NUESTRA LABOR) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full text-center">



        {/* Giant Hero Title - Outlined + Solid font like "WHAT WE DO" */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white uppercase select-none leading-none mb-6">
          <span
            className="text-transparent"
            style={{
              WebkitTextStroke: '2px rgba(255, 255, 255, 0.85)',
              textShadow: '0 0 25px rgba(0,0,0,0.6)'
            }}
          >
            NUESTRA
          </span>{' '}
          <span className="text-white drop-shadow-2xl">
            MISIÓN
          </span>
        </h1>

        {/* Descriptive Subtitle - Context of the Debt Settlement & Information Compilation */}
        <p className="max-w-3xl mx-auto text-slate-200 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-8 drop-shadow-md">
          Plataforma voluntaria de compilación y validación de expedientes laborales de ex-trabajadores
          de la <strong className="text-white font-semibold">Faja Petrolífera del Orinoco</strong> (1990–2010 / Proyecto Hamaca),
          canalizando de forma unificada la información hacia <strong className="text-white font-semibold">PDVSA</strong> para el reconocimiento de beneficios pendientes con las operadoras internacionales.
        </p>

        {/* Action Buttons matching aesthetic */}
        <div className="flex flex-wrap items-center justify-center gap-4">
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

      {/* Bottom Scroll Indicator */}
      <div className="relative z-20 mt-12 flex justify-center">
        <a
          href="#proceso"
          className="flex flex-col items-center gap-1.5 text-white/60 hover:text-white transition-colors text-[11px] font-mono uppercase tracking-widest"
        >
          <span>Conoce el Proceso</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#d9251d]" />
        </a>
      </div>

    </section>
  );
};