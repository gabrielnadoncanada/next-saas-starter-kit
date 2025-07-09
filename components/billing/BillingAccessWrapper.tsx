'use client';

import useCanAccess from 'hooks/useCanAccess';

interface BillingAccessWrapperProps {
  children: React.ReactNode;
}

export const BillingAccessWrapper = ({
  children,
}: BillingAccessWrapperProps) => {
  const { canAccess } = useCanAccess();

  if (!canAccess('team_billing', ['read'])) {
    return null;
  }

  return <>{children}</>;
};
