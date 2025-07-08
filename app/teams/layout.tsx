import React from 'react';
import AppShell from '@/components/shared/shell/AppShell';
import { SWRConfig } from 'swr';

interface TeamsLayoutProps {
  children: React.ReactNode;
}

export default function TeamsLayout({ children }: TeamsLayoutProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <AppShell>{children}</AppShell>
    </SWRConfig>
  );
}
