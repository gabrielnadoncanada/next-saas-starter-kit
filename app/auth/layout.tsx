import React from 'react';
import { AuthLayout } from '@/components/layouts';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthPageLayout({ children }: AuthLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}
