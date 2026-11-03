'use client';

import React from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';

interface HeaderLogoProps {
    scrolled: boolean;
    setActiveView: (view: 'landing' | 'portal') => void;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ scrolled, setActiveView }) => (
    <Link
        href="/"
        onClick={() => setActiveView('landing')}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 group cursor-pointer shadow-sm bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200"
    >
        <div className="w-6 h-6 rounded-full bg-[#d9251d] flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Flame className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="text-base sm:text-lg font-black tracking-tight text-[#0e1b29]">
            FAJA<span className="text-[#d9251d]">EXT</span>
        </div>
    </Link>
);