"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CurtainRevealProps {
  children: React.ReactNode;
  color?: string;
  className?: string; // 👈 Add className support for parent structural propagation
}

export const CurtainReveal = ({
  children,
  color = "var(--neon)",
  className = "",
}: CurtainRevealProps) => {
  const containerRef = useRef(null);
  const curtainRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        curtainRef.current,
        { scaleY: 0, transformOrigin: "bottom" },
        { scaleY: 1, duration: 0.6, ease: "power4.inOut" },
      )
        .set(contentRef.current, { opacity: 1 })
        .to(curtainRef.current, {
          scaleY: 0,
          transformOrigin: "top",
          duration: 0.8,
          ease: "power4.inOut",
        });
    },
    { scope: containerRef },
  );

  return (
    // 🎯 Added h-full to the outer tracking boundary and the content frame wrapper
    <div ref={containerRef} className="relative overflow-hidden w-full h-full">
      <div
        ref={curtainRef}
        className="absolute inset-0 z-50 pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <div ref={contentRef} className="w-full h-full" style={{ opacity: 0 }}>
        {children}
      </div>
    </div>
  );
};
