'use client';
import React from 'react';

interface SectionBannerProps {
  sectionNumber: string;         
  sectionName: string;           
  titleNormal: string;           
  titleHighlight: string;        
  description: string;           
  responsiveLeftMargin?: string; 
  extraContent?: React.ReactNode; 
}

export const SectionBanner: React.FC<SectionBannerProps> = ({
  sectionNumber,
  sectionName,
  titleNormal,
  titleHighlight,
  description,
  responsiveLeftMargin = "mx-6 md:mx-12 lg:mx-20", 
  extraContent
}) => {
  // Calculamos la cantidad aproximada de caracteres para ajustar el multiplicador elástico
  const totalChars = titleNormal.length + titleHighlight.length + 1;
  const fontFluidScale = Math.min(5.5, Math.max(1.0, 45 / totalChars));

  return (
    <div className={`z-20 shrink-0 ${responsiveLeftMargin}`}>
      {/* 🔲 Contenedor Principal: Se redujo el padding vertical (py-4) para ajustar los bordes al texto */}
      <div className="w-full bg-background dark:bg-black backdrop-blur-md border border-foreground/5 px-6 md:px-8 py-4 rounded-2xl shadow-xl flex flex-col gap-2 @container">
        
        {/* === SECCIÓN ROSA component name/number === */}
        <div className="w-full text-left font-mono text-[10px] md:text-xs font-bold tracking-widest text-neon uppercase">
          <span>Sección {sectionNumber} // {sectionName}</span>
        </div>

        {/* Rejilla 50/50 Estricta */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* === SECCIÓN VERDE Title === */}
          {/* Usamos cqw (Container Query Width) combinada con una variable dinámica inline 
              para garantizar que el texto se estire exactamente hasta cubrir la mitad del banner */}
          <div className="text-left w-full block overflow-visible">
            <h2 
              style={{ fontSize: `${fontFluidScale}cqw` }}
              className="font-black tracking-tighter uppercase leading-[0.8] text-foreground whitespace-nowrap w-full block"
            >
              {titleNormal} <span className="text-neon drop-shadow-[0_0_15px_var(--neon-glow)]">{titleHighlight}</span>
            </h2>
          </div>

          {/* === SECCIÓN MORADA Description === */}
          <div className="text-left md:text-left h-full flex flex-col justify-center">
            <p className="text-xs md:text-sm lg:text-base font-medium leading-relaxed text-foreground/75 max-w-xl">
              {description}
            </p>
          </div>

        </div>

        {/* === SECCIÓN AZUL Subtext === */}
        {extraContent && (
          // Removido el padding excesivo superior (pt-1 en lugar de pt-3) para eliminar el aire vertical
          <div className="w-full pt-2 mt-1 border-t border-foreground/5 flex justify-center">
            <div className="w-max mx-auto h-auto flex items-center">
              {extraContent}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};