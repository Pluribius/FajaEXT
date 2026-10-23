'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HiMenuAlt4, HiX } from 'react-icons/hi';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavLinks } from './NavLinks';
import { AuthButton } from './AuthButton';
import MobileMenu from './MobileMenu';
import { ProgressBar } from './ProgressBar';
import { AuthModal } from '../../AuthModal';
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false); // Modal Toggle State
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    const navLinks = [
        { name: 'Inicio', path: '#hero' },
        { name: 'Unete', path: '#catalogue' },
        { name: 'Quienes Somos?', path: '#features' },
        { name: 'Boletín', path: '#contact' },
    ];

    const isTransparent = !scrolled && !isMenuOpen;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const checkStickyStatus = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', checkStickyStatus, { passive: true });
        checkStickyStatus();
        return () => window.removeEventListener('scroll', checkStickyStatus);
    }, []);

    const headerBgClass = isTransparent
        ? 'bg-transparent border-transparent'
        : 'bg-background/70 backdrop-blur-md border-foreground/10 shadow-lg';

    return (
        <>
            <header className={`fixed top-0 left-0 w-full z-[100] border-b transition-all duration-500 ease-in-out ${headerBgClass}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between relative">

                    <Link href="#hero" className="relative w-28 h-8 md:w-36 md:h-10 hover:scale-95 transition-transform z-[150]">
                        <Image
                            src={mounted && theme === 'dark' ? '/LogoWhite.png' : '/logoBlueBig.png'}
                            alt="SIGIS Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>

                    <nav className="hidden md:flex items-center gap-10">
                        <NavLinks links={navLinks} pathname={pathname} isTransparent={isTransparent} />
                    </nav>

                    {/* DESKTOP CONTROLS */}
                    <div className="hidden md:flex items-center gap-6">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={`p-2.5 rounded-full border transition-all hover:scale-105 active:scale-95 cursor-pointer ${isTransparent
                                ? 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                                : 'bg-foreground/5 text-foreground border-foreground/10 hover:bg-foreground/10'
                                }`}
                            aria-label="Cambiar Tema"
                        >
                            {mounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
                        </button>

                        {/* Handing state setter downstream to handle user clicks */}
                        <AuthButton isTransparent={isTransparent} onClick={() => setIsAuthOpen(true)} />
                    </div>

                    {/* MOBILE TRIGGER BAR */}
                    <div className="flex items-center gap-3 md:hidden z-[150]">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={`p-3 rounded-2xl border backdrop-blur-md transition-all ${isTransparent
                                ? 'bg-white/10 text-white border-white/10'
                                : 'bg-foreground/5 text-foreground border-foreground/5'
                                }`}
                            aria-label="Cambiar Tema"
                        >
                            {mounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
                        </button>

                        <button
                            className={`p-3 rounded-2xl transition-all duration-300 ${isMenuOpen
                                ? 'bg-neon text-white shadow-[0_0_20px_rgba(0,180,216,0.5)]'
                                : isTransparent
                                    ? 'bg-white/10 text-white'
                                    : 'bg-foreground/5 text-foreground'
                                }`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? <HiX size={24} /> : <HiMenuAlt4 size={24} />}
                        </button>
                    </div>

                    {isMenuOpen && (
                        <MobileMenu
                            isOpen={isMenuOpen}
                            links={navLinks}
                            pathname={pathname}
                            onClose={() => setIsMenuOpen(false)}
                            onAuthClick={() => {
                                setIsMenuOpen(false);
                                setIsAuthOpen(true);
                            }}
                        />
                    )}
                </div>

                <ProgressBar />
            </header>

            {/* MOUNT POPUP ACCESSIBLE GLOBALLY ON THIS SCOPE */}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
};

export default Header;