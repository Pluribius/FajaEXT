'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export const VideoModal = () => {
  const { isVideoModalOpen, closeVideoModal } = useApp();

  if (!isVideoModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
        >
          <div className="p-4 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#d9251d] rounded-full inline-block" />
              <h3 className="font-bold text-sm tracking-wide">
                PetroLink Corp. | Recorrido Operacional Faja del Orinoco
              </h3>
            </div>
            <button
              onClick={closeVideoModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="aspect-video w-full bg-black">
            <video
              controls
              autoPlay
              className="w-full h-full object-cover"
              src="/video/heroban.mp4"
            >
              Tu navegador no soporta reproducción de video HTML5.
            </video>
          </div>

          <div className="p-4 bg-slate-900 text-slate-300 text-xs flex items-center justify-between">
            <span>Infraestructura de mejoramiento y destilación en tiempo real</span>
            <span className="font-mono text-slate-400">HD 1080p • 60 FPS</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
