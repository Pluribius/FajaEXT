'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface BlogCardProps {
  title: string;
  description: string;
  index: number;
  imageUrl?: string;
  category?: string;
  date?: string;
}

export const BlogCard = ({ title, description, index, imageUrl, category, date }: BlogCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left / rect.width - 0.5);
    y.set(e.clientY - rect.top / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full h-full flex flex-col justify-between p-5 md:p-6 lg:p-8 rounded-3xl overflow-hidden border border-white/10 group cursor-pointer bg-zinc-900/40 backdrop-blur-sm shadow-xl"
    >
      {/* Background Image Element Block */}
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 group-hover:opacity-30 transition-all duration-700 ease-out z-0"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* Decorative Outer Neon Edge Glow Matrix */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

      {/* Top Meta Details Row */}
      <div className="relative z-10 flex justify-between items-center w-full mb-4" style={{ transform: "translateZ(20px)" }}>
        <div>
          {date && (
            <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">{date}</span>
          )}
        </div>
        {category && (
          <span className="text-[9px] uppercase tracking-widest font-black text-neon px-2.5 py-1 bg-neon/10 rounded-full border border-neon/20">
            {category}
          </span>
        )}
      </div>

      {/* Primary Context Section Area */}
      <div className="relative z-10 mt-auto flex flex-col justify-end w-full" style={{ transform: "translateZ(40px)" }}>
        <h3 className="text-base md:text-lg lg:text-xl font-black text-white leading-tight tracking-tighter mb-2 line-clamp-2 group-hover:text-neon transition-colors duration-300">
          {title}
        </h3>

        <p className="text-white/50 text-xs font-light leading-relaxed mb-4 line-clamp-2 lg:line-clamp-3 max-w-[95%] group-hover:text-white/80 transition-colors duration-500">
          {description}
        </p>

        {/* Bottom Interactive Read-More Link */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-neon transition-all">
          <span>Leer más</span>
          <div className="w-6 h-[1px] bg-white/20 group-hover:w-10 group-hover:bg-neon transition-all"></div>
        </div>
      </div>
    </motion.div>
  );
};