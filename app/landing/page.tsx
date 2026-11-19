'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from '../home/page';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return <HomePage />;
}
