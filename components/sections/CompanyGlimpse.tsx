'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, ShieldCheck, History, Award, Users } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const CompanyGlimpse = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();

  const historyCards = [
    {
      title: 'Proyecto Hamaca (1990 - 2007)',
      location: 'Faja Petrolífera del Orinoco',
      desc: 'Desarrollo de infraestructura de crudo extrapesado liderado por consorcios internacionales (ConocoPhillips, Chevron, Texaco) con miles de técnicos venezolanos.',
      image: '/images/faja-orinoco.jpg',
      badge: 'Etapa Operativa Histórica',
    },
    {
      title: 'Transición y Nacionalización',
      location: 'Convenios de Asociación y Empresas Mixtas',
      desc: 'Tras los decretos de nacionalización y la salida de varias multinacionales, quedaron compromisos pendientes de pasivos laborales y beneficios contractuales no finiquitados.',
      image: '/images/refinery-workers.jpg',
      badge: 'Quiebre de Relaciones',
    },
    {
      title: 'Reapertura y Liquidación',
      location: 'Mecanismo Conjunto PDVSA - Multinacionales',
      desc: 'Con los nuevos acuerdos energéticos, se activan los canales diplomáticos y jurídicos para el pago de la deuda legítima a favor de los ex-trabajadores calificados.',
      image: '/images/oil-industry.jpg',
      badge: 'Fase de Regularización',
    },
  ];

  return (
    <section id="proceso" className="w-full py-20 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Split Header: Bold Headline on Left, Context & Blue Pill Button on Right (Matching Reference Photo) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-14">
          <div className="max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#d9251d] mb-2 block">
              Recuperación de Pasivos Laborales
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0e1b29] tracking-tight leading-[1.15]">
              Compilación y Justicia Laboral en la Faja
            </h2>
          </div>

          <div className="max-w-md space-y-4">
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Trabajamos de forma voluntaria para consolidar cada expediente individual, verificar la documentación física y construir una base de datos transparente que respalde la entrega oficial ante PDVSA.
            </p>
            <button
              onClick={() => {
                if (currentUser) {
                  setActiveView('portal');
                } else {
                  openAuthModal('register');
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0060af] hover:bg-[#004e8f] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Ver Requisitos de Inscripción</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3-Column Image Cards (Exact match to the 3 vertical cards in reference image) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {historyCards.map((card, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-xl border border-slate-200 flex flex-col justify-end p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Background Image */}
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-85"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* Content */}
              <div className="relative z-10 text-white space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white">
                  {card.badge}
                </span>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {card.title}
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                  {card.desc}
                </p>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-red-400 group-hover:text-red-300">
                  <span>{card.location}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

