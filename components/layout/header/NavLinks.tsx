'use client';

import React from 'react';
import Link from 'next/link';

interface NavLinkItem {
    name: string;
    path: string;
}

interface NavLinksProps {
    links: NavLinkItem[];
    pathname: string;
    isTransparent?: boolean; // Accept the transparency state from Header
}

export const NavLinks = ({ links, pathname, isTransparent = false }: NavLinksProps) => {
    return (
        <>
            {links.map((link) => {
                const isActive = pathname === link.path;

                // Determine text coloring depending on active status and page scroll placement
                let textClass = '';
                if (isActive) {
                    textClass = 'text-neon';
                } else if (isTransparent) {
                    textClass = 'text-white/80 hover:text-white';
                } else {
                    textClass = 'text-foreground/80 hover:text-neon';
                }

                return (
                    <Link
                        key={link.path}
                        href={link.path}
                        className={`relative text-sm uppercase tracking-widest transition-all cursor-pointer font-bold hover:scale-95 active:scale-90 ${textClass}`}
                    >
                        {link.name}

                        {/* Animated Active Indicator (Neon Dot) */}
                        {isActive && (
                            <span
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neon rounded-full shadow-[0_0_10px_var(--neon-glow)] transition-all duration-300"
                                aria-hidden="true"
                            />
                        )}
                    </Link>
                );
            })}
        </>
    );
};