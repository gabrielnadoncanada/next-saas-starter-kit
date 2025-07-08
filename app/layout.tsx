import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import app from '@/lib/app';
import Providers from './providers';
import { getLocale } from 'next-intl/server';

import '@boxyhq/react-ui/dist/react-ui.css';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: app.name,
  description: 'Enterprise SaaS Starter Kit',
  icons: {
    icon: 'https://boxyhq.com/img/favicon.ico',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="h-full" data-theme="boxyhq">
      <body className={`${inter.className} h-full`}>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
