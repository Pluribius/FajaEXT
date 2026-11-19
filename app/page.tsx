'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/auth/AppContext';
import LandingPage from './landing/page';

export default function RootPage() {
  const { currentUser, isSupabaseLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseLoading) {
      if (currentUser) {
        router.replace('/dashboard');
      } else {
        router.replace('/landing');
      }
    }
  }, [currentUser, isSupabaseLoading, router]);

  return <LandingPage />;
}
