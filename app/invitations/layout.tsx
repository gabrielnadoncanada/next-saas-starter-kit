import React from 'react';
import { AuthLayout } from '@/components/layouts';

interface InvitationLayoutProps {
  children: React.ReactNode;
}

export default function InvitationLayout({ children }: InvitationLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}
