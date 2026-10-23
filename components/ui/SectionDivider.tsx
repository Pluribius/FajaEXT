'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/all';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const SectionDivider = () => {
    const containerRef = useRef(null);
    const lineRef = useRef(null);

    useGSAP(() => {
        gsap.fromTo(lineRef.current, 
            { scaleX: 0, opacity: 0 },
            { 
                scaleX: 1, 
                opacity: 1, 
                duration: 1.5, 
                ease: "power4.inOut",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 90%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse",
                }
            }
        );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="w-full flex justify-center items-center py-4 overflow-hidden pointer-events-none background-c">
            <div className="container mx-auto px-6 relative flex justify-center items-center">
                {/* Main Line */}
                <div 
                    ref={lineRef}
                    className="w-full h-[1px] bg-gradient-to-r from-transparent via-neon/50 to-transparent relative"
                >
                    {/* Glowing Center Dot */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-neon rounded-full shadow-[0_0_20px_var(--neon),0_0_10px_#fff]" />
                </div>
                
                {/* Decorative Label */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-background transition-colors duration-300">
                    <span className="text-[8px] font-black uppercase tracking-[1em] text-neon/60">SIGIS</span>
                </div>
            </div>
        </div>
    );
};
