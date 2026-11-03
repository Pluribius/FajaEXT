'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/auth/AppContext';
import { HeaderLogo } from './HeaderLogo';
import { HeaderNav } from './HeaderNav';
import { HeaderActions } from './HeaderActions';

export const IndustrialHeader = () => {
  const {
    currentUser,
    logout,
    openAuthModal,
    activeView,
    setActiveView,
  } = useApp();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLanding = activeView === 'landing';
  const positionClass = isLanding ? 'fixed top-0 inset-x-0' : 'relative';

  return (
    <header
      className={`${positionClass} w-full z-[100] transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm py-3.5 border-b border-slate-200 text-slate-900'
        : 'bg-transparent py-5 border-b border-transparent text-white'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between min-h-[44px]">
        <HeaderLogo scrolled={scrolled} setActiveView={setActiveView} />

        <HeaderNav
          scrolled={scrolled}
          currentUser={currentUser}
          activeView={activeView}
        />

        <HeaderActions
          currentUser={currentUser}
          activeView={activeView}
          setActiveView={setActiveView}
          logout={logout}
          openAuthModal={openAuthModal}
          scrolled={scrolled}
        />
      </div>
    </header>
  );
};