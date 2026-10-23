'use client';

import React from 'react';
import Image from 'next/image';
import {
  Play,
  ArrowUpRight,
  Flame,
  Factory,
  Layers,
  Cpu,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const CompanyGlimpse = () => {
  const { openVideoModal, openAuthModal, currentUser, setActiveView } = useApp();

  return (
    <section id="nosotros" className="w-full py-20 lg:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Split: Left Video Box & Right Overview with Progress Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left: Video Preview Image with Red Play Button Badge & Industrial Square */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] bg-slate-100 border-2 border-slate-200 group">
              <Image
                src="/images/pexels-jan-van-der-wolf-11680885-16091985.jpg"
                alt="Instalaciones Industriales y Tuberías de Procesamiento"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Red play badge at bottom left (matches reference image) */}
              <button
                onClick={openVideoModal}
                className="absolute bottom-0 left-0 bg-[#d9251d] hover:bg-[#b81c15] text-white p-4 pr-7 rounded-tr-2xl shadow-xl flex items-center gap-3 transition-colors cursor-pointer group/btn"
              >
                <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 fill-white ml-0.5 group-hover/btn:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-red-200 font-bold">
                    Reproducir
                  </div>
                  <div className="text-sm font-black leading-tight">
                    Video Corporativo
                  </div>
                </div>
              </button>

              {/* Decorative Red Square Accent at bottom (matches reference) */}
              <div className="absolute -bottom-2 left-28 w-5 h-5 bg-[#d9251d]" />
            </div>

            {/* Geometric Top Right Corner Element */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-200 -z-10 rounded-sm" />
          </div>

          {/* Right: Company Overview & Progress Bars (exact match to reference) */}
          <div className="lg:col-span-7 space-y-6 lg:pl-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d9251d]">
              <span className="w-2.5 h-0.5 bg-[#d9251d]" />
              Conoce Más Sobre PetroLink
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0e1b29] leading-tight">
              Una Mirada Cercana a Nuestra Empresa Petrolera
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              PetroLink es una corporación líder en la industria de hidrocarburos, petroquímica y servicios energéticos integrales, dedicada a proveer soluciones de vanguardia con alta tecnología, seguridad industrial y responsabilidad ambiental en la Faja Petrolífera del Orinoco.
            </p>

            {/* Progress Bars (matches reference styling) */}
            <div className="space-y-5 pt-3">
              {/* Progress 1: Satisfacción del Cliente */}
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Satisfacción del Cliente</span>
                  <span className="text-[#d9251d]">90%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d9251d] rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              {/* Progress 2: Finalización de Proyectos */}
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Finalización y Entrega de Proyectos</span>
                  <span className="text-[#d9251d]">65%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d9251d] rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              {/* Progress 3: Reducción de Emisiones */}
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Eficiencia en Reducción de Emisiones y Venteo</span>
                  <span className="text-[#d9251d]">25%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d9251d] rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>

            {/* Link button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  if (currentUser) {
                    setActiveView('portal');
                  } else {
                    openAuthModal('register');
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0e1b29] hover:text-[#d9251d] border-b-2 border-[#0e1b29] hover:border-[#d9251d] pb-1 transition-all cursor-pointer"
              >
                <span>Conocer Más Sobre Nuestro Sistema y Registro</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Section: 4 Industrial Service Cards (matches reference cards right side) */}
        <div id="servicios" className="pt-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#d9251d]">
              Líneas Operativas
            </span>
            <h3 className="text-3xl font-black text-[#0e1b29] mt-1">
              Capacidades Estratégicas e Industriales
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Solid Red Card (Matches reference card style) */}
            <div className="bg-[#d9251d] text-white p-7 rounded-xl shadow-lg relative flex flex-col justify-between group overflow-hidden">
              {/* Decorative top right corner square */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-black/15 flex items-center justify-center">
                <div className="w-3 h-3 bg-white/80" />
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-white text-[#d9251d] flex items-center justify-center mb-6 shadow-md">
                  <Flame className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black mb-3 leading-snug">
                  Plataformas de Extracción y Perforación
                </h4>
                <p className="text-red-100 text-sm leading-relaxed mb-6">
                  Soluciones robustas para la operación continua y segura de taladros y plataformas costa afuera y en tierra firme.
                </p>
              </div>

              <a
                href="#contacto"
                className="text-xs uppercase tracking-wider font-black text-white hover:text-red-200 inline-flex items-center gap-1.5"
              >
                <span>Saber Más</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Card 2: White Card with Red Icon (Matches reference card) */}
            <div className="bg-white border border-slate-200 p-7 rounded-xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-slate-100 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#d9251d]" />
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#d9251d] border border-red-100 flex items-center justify-center mb-6">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-[#0e1b29] mb-3 leading-snug">
                  Control de Emisiones y Venteo de Gas
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Minimizamos la quema de gas implementando sistemas de recuperación y compresión de alta eficiencia ambiental.
                </p>
              </div>

              <a
                href="#contacto"
                className="text-xs uppercase tracking-wider font-black text-[#0e1b29] group-hover:text-[#d9251d] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Saber Más</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Card 3: White Card with Red Icon (Refinery) */}
            <div className="bg-white border border-slate-200 p-7 rounded-xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-slate-100 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#d9251d]" />
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#d9251d] border border-red-100 flex items-center justify-center mb-6">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-[#0e1b29] mb-3 leading-snug">
                  Refinación y Procesamiento de Crudo
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Apoyamos la conversión de crudo extrapesado en derivados de alto valor comercial para mercados globales.
                </p>
              </div>

              <a
                href="#contacto"
                className="text-xs uppercase tracking-wider font-black text-[#0e1b29] group-hover:text-[#d9251d] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Saber Más</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Card 4: White Card with Red Icon (Plant Optimization) */}
            <div className="bg-white border border-slate-200 p-7 rounded-xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-slate-100 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#d9251d]" />
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#d9251d] border border-red-100 flex items-center justify-center mb-6">
                  <Factory className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-[#0e1b29] mb-3 leading-snug">
                  Optimización Operativa de Plantas
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Auditorías en campo, mantenimiento predictivo e integración de tecnologías geoespaciales para la integridad de activos.
                </p>
              </div>

              <a
                href="#contacto"
                className="text-xs uppercase tracking-wider font-black text-[#0e1b29] group-hover:text-[#d9251d] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Saber Más</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
