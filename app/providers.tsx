'use client';

import { ReactNode, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/auth/SessionProvider';

import mixpanel from 'mixpanel-browser';
import env from '@/lib/env';
import { Theme, applyTheme } from '@/lib/theme';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize Mixpanel
    if (env.mixpanel.token) {
      mixpanel.init(env.mixpanel.token, {
        debug: true,
        ignore_dnt: true,
        track_pageview: true,
      });
    }

    // Apply theme
    if (env.darkModeEnabled) {
      applyTheme(localStorage.getItem('theme') as Theme);
    }
  }, []);

  return (
    <SessionProvider>
      <Toaster toastOptions={{ duration: 4000 }} />
      {children}
    </SessionProvider>
  );
}
