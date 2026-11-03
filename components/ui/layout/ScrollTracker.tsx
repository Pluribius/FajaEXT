'use client';

import React, { useEffect, useState } from 'react';

const sections = [
    { id: 'hero', label: 'Inicio' },
    { id: 'catalogue', label: 'Catálogo' },
    { id: 'blog', label: 'Blog' },
    { id: 'social-updates', label: 'Social' },
    { id: 'contact', label: 'Contáctanos' },
];

export const ScrollTracker = () => {
    const [activeSection, setActiveSection] = useState('hero');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [hidden, setHidden] = useState(false);

    // Hide when a popup is open
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setHidden(document.body.classList.contains('popup-open'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // 1. Progress calculation
        const handleScroll = () => {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setScrollProgress(scrolled);
        };

        // 2. Active section tracking
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0,
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const scrollToNextSection = () => {
        const currentIndex = sections.findIndex(s => s.id === activeSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        const nextSectionId = sections[nextIndex].id;
        const element = document.getElementById(nextSectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const currentLabel = sections.find(s => s.id === activeSection)?.label || 'Menu';

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center gap-4 transition-all duration-500 hover:scale-110 group animate-scroll-hint ${hidden ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}`}>
            {/* Label Box (Now a Button) */}
            <button
                onClick={scrollToNextSection}
                className="px-6 py-2 bg-[#050505]/95 backdrop-blur-xl border border-white/5 text-white text-sm font-bold tracking-widest uppercase rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 transform group-hover:-translate-y-2 cursor-pointer active:scale-95 ring-1 ring-white/10 hover:ring-accent/50"
            >
                <span className="text-accent mr-2 animate-pulse">//</span>
                {currentLabel}
            </button>

            {/* Progress Bar Container */}
            <div className="relative w-72 h-1.5 bg-black/60 rounded-full overflow-hidden shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)] backdrop-blur-md border border-white/5">
                {/* Progress Fill */}
                <div
                    className="absolute top-0 left-0 h-full bg-accent transition-all duration-300 ease-out shadow-[0_0_20px_rgba(222,49,99,0.8)]"
                    style={{ width: `${scrollProgress}%` }}
                />

                {/* Section Markers */}
                <div className="absolute inset-0 flex justify-between px-2 items-center">
                    {sections.map((s, i) => (
                        <div
                            key={s.id}
                            className={`w-2 h-2 rounded-full transition-all duration-500 border-2 ${activeSection === s.id
                                ? 'bg-accent border-accent scale-150 shadow-[0_0_10px_rgba(222,49,99,0.6)]'
                                : 'bg-black/80 border-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
