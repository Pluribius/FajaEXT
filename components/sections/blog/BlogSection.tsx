'use client';

import React from 'react';
import { BlogCard } from './BlogCard';

export const BlogSection = () => {
  const posts = [
    {
      title: '¿SMS vs. Email? Por qué los mensajes de texto están ganando la batalla',
      description: '¿Ventas bajas o cobranzas lentas? El envío masivo de SMS es la solución. Aprende cómo esta herramienta impulsa a emprendedores...',
      category: 'Mensajería',
      date: '10 Feb 2026',
      // Simplified: Just use grid span classes directly
      className: 'md:col-span-8 md:row-span-2',
      image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: '¿Inversión o gasto?',
      description: 'El verdadero valor de la consultoría y asesoría técnica para tu empresa.',
      category: 'Consultoría',
      date: '28 Ene 2026',
      className: 'md:col-span-4 md:row-span-1',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Seguridad en la Nube Geoespacial',
      description: 'Cómo protegemos la integridad de los datos cartográficos críticos frente a accesos vulnerables.',
      category: 'Seguridad',
      date: '15 Ene 2026',
      className: 'md:col-span-4 md:row-span-1',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop'
    }
  ];

  return (
    <section
      id="blog"
      className="w-full h-screen min-h-screen bg-transparent text-white flex flex-col justify-between p-6 md:p-16 overflow-hidden select-none"
    >
      <div className="container mx-auto h-full flex flex-col justify-between gap-6">

        {/* Top Header */}
        <div className="flex justify-between items-end border-b border-white/10 pb-4 flex-shrink-0">
          <div className="max-w-2xl space-y-1">
            <span className="text-neon font-mono text-[10px] md:text-xs tracking-widest uppercase">
              Sección 03 // Blog
            </span>
            <h2 className="text-xl md:text-4xl font-black tracking-tighter uppercase leading-none">
              Nuestras <span className="text-neon drop-shadow-[0_0_15px_var(--neon-glow)]">Publicaciones</span>
            </h2>
            <p className="text-white/60 text-xs md:text-sm font-medium hidden sm:block">
              Compartimos nuestra visión sobre la intersección entre la tecnología geoespacial y la seguridad inteligente.
            </p>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-white/30 font-mono text-[9px] tracking-[0.3em] uppercase hidden md:inline">
              Artículos Recientes
            </span>
            <div className="w-16 md:w-32 h-[1px] bg-neon/30 mt-1"></div>
          </div>
        </div>

        {/* Simplified Main Content Area */}
        <div className="flex-1 min-h-0 w-full flex items-center">
          <div className="w-full h-full flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-4 md:grid md:grid-cols-12 md:grid-rows-2 md:gap-6">
            {posts.map((post, index) => (
              <div
                key={index}
                className={`w-[85vw] sm:w-[60vw] h-full flex-shrink-0 snap-center md:w-auto md:flex-shrink-1 md:snap-align-none ${post.className}`}
              >
                <BlogCard
                  index={index}
                  title={post.title}
                  description={post.description}
                  category={post.category}
                  date={post.date}
                  imageUrl={post.image}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-center flex-shrink-0">
          <button className="px-6 py-2.5 md:px-8 md:py-4 bg-white/[0.03] backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full hover:bg-neon hover:text-white hover:border-neon transition-all duration-300 shadow-xl">
            Ver todos los artículos
          </button>
        </div>

      </div>
    </section>
  );
};