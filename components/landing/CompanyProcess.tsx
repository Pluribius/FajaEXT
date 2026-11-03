'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, ShieldCheck, History, Award, Users } from 'lucide-react';
import { useApp } from '@/components/auth/AppContext';

export const CompanyGlimpse = () => {
  const { openAuthModal, currentUser, setActiveView } = useApp();

  const historyCards = [
    {
      title: 'Registro de Datos',
      location: 'Primer Paso',
      desc: 'Registre sus datos en nuestra pagina, verifique sus datos de contactos y reciba ayuda sobre el proceso de registro.',
      image: '/images/IDVE.jpg',
    },
    {
      title: 'Validación de Documentos',
      location: 'Segundo Paso',
      desc: 'Cada expediente es analizado y el Historial Laboral es verificado.',
      image: '/images/BANAVIH.jpg',
    },
    {
      title: 'Notificación de Pago',
      location: 'Tercer Paso',
      desc: 'Personal verificado es notificado sobre sus detalles de pago, fecha y  ubicacion, los soportes de pago necesarios son archivados.',
      image: '/images/ATM.jpg',
    },
  ];

  return (
    <section id="proceso" className="w-full py-20 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Split Header: Bold Headline on Left, Context & Blue Pill Button on Right (Matching Reference Photo) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-14">
          <div className="max-w-xl">

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0e1b29] tracking-tight leading-[1.15]">
              Proceso de Registro en la lista de Pago
            </h2>
          </div>

          <div className="max-w-md space-y-4">
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Trabajamos de forma voluntaria para consolidar cada expediente individual, verificar la documentación física y construir una base de datos transparente que respalde la entrega oficial ante PDVSA.
            </p>
          </div>
        </div>

        {/* 3-Column Image Cards (Exact match to the 3 vertical cards in reference image) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {historyCards.map((card, idx) => (
            <div
              key={idx}
              className="group relative rounded-1xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-xl border border-slate-200 flex flex-col justify-end p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Background Image */}
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-85"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* Content */}
              <div className="relative z-10 text-white space-y-2">

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

