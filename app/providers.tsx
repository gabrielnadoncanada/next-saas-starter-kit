'use client';

import { ReactNode, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { Themer } from '@boxyhq/react-ui/shared';
import colors from 'tailwindcss/colors';
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
      <Themer
        overrideTheme={{
          '--primary-color': colors.blue['500'],
          '--primary-hover': colors.blue['600'],
          '--primary-color-50': colors.blue['50'],
          '--primary-color-100': colors.blue['100'],
          '--primary-color-200': colors.blue['200'],
          '--primary-color-300': colors.blue['300'],
          '--primary-color-500': colors.blue['500'],
          '--primary-color-600': colors.blue['600'],
          '--primary-color-700': colors.blue['700'],
          '--primary-color-800': colors.blue['800'],
          '--primary-color-900': colors.blue['900'],
          '--primary-color-950': colors.blue['950'],
        }}
      >
        {children}
      </Themer>
    </SessionProvider>
  );
}
