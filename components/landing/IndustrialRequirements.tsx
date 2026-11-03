'use client';

import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/all';
import { useApp } from '@/components/auth/AppContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const IndustrialProjects = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const operationalCards = [
    {
      title: 'Validación de Cédulas y Nóminas',
      desc: 'Cruce sistemático de nóminas históricas de subcontratistas y consorcios operacionales con la base de datos nacional.',
    },
    {
      title: 'Consorcio Petrolero Hamaca',
      desc: 'Ex-trabajadores de campo, soldadores, operadores de planta y personal técnico bajo contratos directos e indirectos.',
    },
    {
      title: 'Expediente Digital Unificado',
      desc: 'Carga de comprobantes digitalizados en alta resolución para sustentar la carpeta individual ante la comisión de enlace PDVSA.',
    },
    {
      title: 'Transparencia y Consulta Pública',
      desc: 'Cada usuario dispone de un código UID único para certificar su estatus de elegibilidad de forma directa y sin intermediarios.',
    },
  ];

  // GSAP ScrollTrigger with expanded activation bounds to prevent skipping drawers
  useGSAP(() => {
    const cards = gsap.utils.toArray('.scroll-drawer-item') as HTMLElement[];

    cards.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        // Expanded trigger boundaries: activates earlier when entering the viewport 
        // and stays active longer until scrolling past its lower quarter.
        start: 'top 75%',
        end: 'bottom 25%',
        onEnter: () => setActiveIndex(index),
        onEnterBack: () => setActiveIndex(index),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="requisitos"
      className="w-full py-24 bg-[#c81919] text-white relative overflow-hidden"
    >
      {/* Background Subtle Wave Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Top Split Headline */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] uppercase">
              Condiciones de Pago
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-red-100 text-sm sm:text-base leading-relaxed font-normal">
              Directrices fundamentales y mecanismos de validación aplicados al proceso de regularización de pasivos laborales.
            </p>
          </div>
        </div>

        {/* Scroll-Driven Folding Drawers Stack with Increased Spacing */}
        <div className="grid grid-cols-1 gap-8">
          {operationalCards.map((item, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={index}
                className={`scroll-drawer-item group relative rounded-3xl overflow-hidden bg-slate-100 shadow-2xl border border-slate-300 transition-all duration-500 my-4 ${isOpen ? 'ring-4 ring-white bg-white scale-[1.01]' : 'opacity-90 hover:opacity-100'
                  }`}
              >
                {/* Red Structural Grid Background Pattern */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-15 group-hover:opacity-25 transition-opacity">
                  <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`red-grid-pattern-${index}`} width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c81919" strokeWidth="1.2" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#red-grid-pattern-${index})`} />
                  </svg>
                </div>

                {/* Accent Line along top edge when open */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-[#c81919] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

                {/* Drawer Header (Dark Text) */}
                <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className={`w-12 h-12 rounded-full bg-slate-200/80 flex items-center justify-center border border-slate-300 transition-transform duration-500 ${isOpen ? 'rotate-180 bg-[#c81919] text-white border-transparent' : 'text-slate-900'}`}>
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Expandable Drawer Content Panel */}
                <div
                  className={`relative z-10 transition-all duration-500 ease-in-out overflow-hidden px-6 sm:px-10 ${isOpen ? 'max-h-[400px] pb-10 opacity-100 border-t border-slate-200 pt-6' : 'max-h-0 pb-0 opacity-0'
                    }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};