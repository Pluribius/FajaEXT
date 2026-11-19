'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/auth/AppContext';
import HomePage from './home/page';

export default function RootPage() {
  const { currentUser, isSupabaseLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseLoading) {
      if (!currentUser) {
        router.replace('/home');
      } else if (currentUser.role === 'admin') {
        router.replace('/dashboard');
      } else if (currentUser.role === 'viewer') {
        router.replace('/export');
      } else {
        router.replace('/user');
      }
    }
  }, [currentUser, isSupabaseLoading, router]);

  return <HomePage />;
}
