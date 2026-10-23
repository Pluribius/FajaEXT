'use client';

import React from 'react';
import Link from 'next/link';
import { AuthButton } from './AuthButton';

interface NavLink {
    name: string;
    path: string;
}

interface MobileMenuProps {
    isOpen: boolean;
    links: NavLink[];
    pathname: string;
    onClose: () => void;
    onAuthClick?: () => void; // Intercept trigger prop
}



const MobileMenu = ({ isOpen, links, pathname, onClose }: MobileMenuProps) => {
    return (
        <div
            className={`fixed inset-0 z-[140] md:hidden transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
                }`}
        >
            {/* Glassmorphic Backdrop */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" />

            {/* Animated Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] bg-neon/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />

            <div className="relative h-full flex flex-col pt-32 pb-12 px-8 overflow-hidden">
                {/* Section Label */}
                <div className="mb-12">
                    <span className="text-neon text-[10px] uppercase tracking-[0.5em] font-black">
                        Navegación
                    </span>
                </div>

                {/* Primary Navigation Links */}
                <nav className="flex flex-col space-y-4">
                    {links.map((link, index) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            onClick={onClose}
                            className={`group flex items-end space-x-4 text-left transition-all duration-500 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
                                }`}
                            style={{ transitionDelay: `${200 + index * 100}ms` }}
                        >
                            <span className={`text-xl font-mono leading-none mb-1 transition-colors duration-500 ${pathname === link.path ? 'text-neon' : 'text-neon/30'
                                }`}>
                                0{index + 1}
                            </span>
                            <span className={`text-5xl font-black tracking-tighter transition-colors duration-200 ${pathname === link.path ? 'text-neon' : 'text-foreground group-active:text-neon'
                                }`}>
                                {link.name}
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* Authentication Section (New) */}
                <div
                    className={`mt-10 pt-10 border-t border-foreground/5 transition-all duration-700 delay-600 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                >
                    <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-6 font-bold">
                        Tu Cuenta
                    </p>
                    <AuthButton isMobile />
                </div>


            </div>
        </div>
    );
};

export default MobileMenu;