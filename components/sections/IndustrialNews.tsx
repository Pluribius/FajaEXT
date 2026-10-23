'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, User, ArrowRight, Bell, Tag } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const IndustrialNews = () => {
  const { news } = useApp();

  return (
    <section id="noticias" className="w-full py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#d9251d] mb-2">
              <Bell className="w-4 h-4" />
              Actualidad Operativa
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0e1b29]">
              Noticias y Comunicados Oficiales
            </h3>
          </div>
          <p className="text-slate-500 text-sm max-w-md mt-2 md:mt-0">
            Boletines emitidos directamente por la dirección administrativa y comités de operaciones de PetroLink.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.slice(0, 3).map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                <Image
                  src={item.imageUrl || '/images/campo-petrolero-1068x712.jpg'}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0e1b29] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow">
                  {item.category}
                </div>
                {item.important && (
                  <div className="absolute top-3 right-3 bg-[#d9251d] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                    Importante
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {item.author}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-[#0e1b29] group-hover:text-[#d9251d] transition-colors leading-snug mb-3">
                    {item.title}
                  </h4>

                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#d9251d]">
                  <span>Leer comunicado completo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
