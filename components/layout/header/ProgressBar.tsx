'use client';

import React, { useState, useEffect } from 'react';

export const ProgressBar = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            if (height > 0) {
                const scrolledPercent = (winScroll / height) * 100;
                setScrollProgress(scrolledPercent);
            } else {
                setScrollProgress(0);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Calculate immediately on layout mount
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-transparent pointer-events-none overflow-hidden">
            <div
                className="h-full bg-neon transition-all duration-150 ease-out shadow-[0_0_12px_var(--neon-glow)]"
                style={{ width: `${scrollProgress}%` }}
            />
        </div>
    );
};