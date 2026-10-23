'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaLinkedinIn, FaInstagram, FaFacebookF, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export const Footer = () => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering theme-dependent content until mounted
    const isLight = mounted && resolvedTheme === 'light';
    const logoSrc = isLight ? "/logoBlueBig.png" : "/logoRetina.png";

    return (
        <footer className="bg-background text-foreground pt-12 pb-40 md:pb-16 border-t border-foreground/5 relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-12 lg:gap-24 mb-24">
                    
                    {/* Column 1: Brand & Intro */}
                    <div className="space-y-8">
                        <div className="relative w-[180px] md:w-[220px]">
                            <Image
                                src={logoSrc}
                                alt="SIGIS Logo"
                                width={220}
                                height={80}
                                className="object-contain w-auto h-auto"
                                priority
                            />
                        </div>
                        <p className="text-foreground/60 text-lg font-light leading-relaxed max-w-sm">
                            ¡Muchas gracias por visitarnos! Nos encanta que estés aquí. Únete a nuestra comunidad en redes sociales para estar al día de todas nuestras novedades.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: <FaXTwitter />, link: 'https://x.com/sigisca' },
                                { icon: <FaLinkedinIn />, link: 'https://www.linkedin.com/company/sigisca/' },
                                { icon: <FaInstagram />, link: 'https://www.instagram.com/sigisca/' },
                                { icon: <FaFacebookF />, link: 'https://www.facebook.com/sigisca' },
                                { icon: <FaYoutube />, link: 'https://www.youtube.com/c/SIGISCA' }
                            ].map((social, i) => (
                                <a 
                                    key={i}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center text-foreground/40 hover:text-neon hover:border-neon transition-all duration-300 shadow-[0_0_0px_var(--neon)] hover:shadow-[0_0_15px_var(--neon-glow)]"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Localización */}
                    <div className="space-y-8">
                        <div id="contact">
                            <h4 className="text-neon text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-neon"></span> Oficina Caracas
                            </h4>
                            <div className="flex items-start gap-4 mb-8">
                                <div className="mt-1.5 p-2 bg-foreground/5 rounded-lg text-neon shadow-[0_0_10px_rgba(0,180,216,0.2)]">
                                    <FaMapMarkerAlt size={16} />
                                </div>
                                <p className="text-foreground/60 leading-relaxed font-light">
                                    Calle Los Laboratorios, Edificio Torre Beta, Piso 1, Oficinas 106-107-109 y 111. Urbanización Los Ruices. Código Postal 1071. <br/>
                                    <strong>Caracas Miranda - Venezuela.</strong>
                                </p>
                            </div>

                            {/* Google Maps Integration */}
                            <div className="w-full h-48 rounded-2xl overflow-hidden border border-foreground/10 group/map relative bg-foreground/5">
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3434.3312!2d-66.8283386!3d10.4895505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a59acd0ec9fd1%3A0xe5a3f2963f46f48a!2sTorre%20Beta!5e0!3m2!1ses-419!2sve!4v1710320875412!5m2!1ses-419!2sve" 
                                    width="100%" 
                                    height="100%" 
                                    style={{ 
                                        border: 0,
                                        filter: (mounted && resolvedTheme === 'dark') ? 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%) grayscale(1)' : 'grayscale(1)',
                                    }} 
                                    className="transition-all duration-700 lg:group-hover/map:filter-none lg:group-hover/map:grayscale-0 !opacity-40 lg:group-hover/map:!opacity-100"
                                    allowFullScreen
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                                <div className="absolute inset-0 pointer-events-none border-2 border-neon/0 lg:group-hover/map:border-neon/20 transition-all duration-700 rounded-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Contacto Directo */}
                    <div className="space-y-8">
                        <h4 className="text-neon text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-neon"></span> Contacto Directo
                        </h4>
                        
                        <div className="space-y-6">
                            <a href="tel:+5804122894521" className="flex items-center gap-4 group cursor-pointer decoration-none">
                                <div className="p-3 bg-foreground/5 rounded-xl text-foreground/40 lg:group-hover:text-neon lg:group-hover:bg-neon/10 transition-all">
                                    <FaPhoneAlt size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-foreground/30 uppercase tracking-widest font-black">Llamadas</p>
                                    <p className="text-lg text-foreground/70 font-medium">+58 (0412) 289.45.21</p>
                                </div>
                            </a>

                            <a href="https://wa.me/584123358806" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer decoration-none">
                                <div className="p-3 bg-foreground/5 rounded-xl text-foreground/40 lg:group-hover:text-green-500 lg:group-hover:bg-green-500/10 transition-all">
                                    <FaWhatsapp size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-foreground/30 uppercase tracking-widest font-black">WhatsApp</p>
                                    <p className="text-lg text-foreground/70 font-medium">+58 (0412) 335.88.06</p>
                                </div>
                            </a>

                            <a href="mailto:buzon@sigis.com.ve" className="flex items-center gap-4 group cursor-pointer decoration-none">
                                <div className="p-3 bg-foreground/5 rounded-xl text-foreground/40 lg:group-hover:text-neon lg:group-hover:bg-neon/10 transition-all">
                                    <FaEnvelope size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-foreground/30 uppercase tracking-widest font-black">Email</p>
                                    <p className="text-lg text-foreground/70 font-medium hover:text-neon transition-all duration-300 decoration-neon/20 underline-offset-4 underline">
                                        buzon@sigis.com.ve
                                    </p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs text-foreground/30 tracking-widest uppercase">
                        Copyright © 2026 <span className="text-foreground/50 font-black">SIGIS, C.A.</span>  |  J-30040854-0
                    </p>
                    
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/30 hover:text-neon transition-colors">
                            Privacidad
                        </Link>
                        <Link href="/terms" className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/30 hover:text-neon transition-colors">
                            Términos
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};