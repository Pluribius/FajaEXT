'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/all';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface RevealProps {
    children: React.ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
    width?: "fit-content" | "100%";
}

export const Reveal = ({ 
    children, 
    direction = 'up', 
    delay = 0, 
    duration = 1.2,
    width = "100%" 
}: RevealProps) => {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);

    useGSAP(() => {
        const offset = 100;
        const xValues = { left: -offset, right: offset, up: 0, down: 0 };
        const yValues = { left: 0, right: 0, up: offset, down: -offset };

        gsap.fromTo(
            contentRef.current,
            {
                opacity: 0,
                x: xValues[direction],
                y: yValues[direction],
                scale: 0.95,
            },
            {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: duration,
                delay: delay,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            }
        );
    }, { scope: sectionRef });

    return (
        <div 
            ref={sectionRef} 
            style={{ width, position: 'relative', overflow: 'visible' }}
        >
            <div ref={contentRef}>
                {children}
            </div>
        </div>
    );
};
