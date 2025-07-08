'use client';

import MagicLink from '@/components/auth/MagicLink';
import { getCsrfToken } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function MagicLinkPage() {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Get CSRF token
    getCsrfToken().then((token) => {
      if (token) setCsrfToken(token);
    });
  }, []);

  return <MagicLink csrfToken={csrfToken} />;
}
