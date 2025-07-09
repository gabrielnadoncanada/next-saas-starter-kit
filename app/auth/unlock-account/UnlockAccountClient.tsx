'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Button } from '@/lib/components/ui/button';
import { InputWithLabel } from '@/components/shared';
import type { ComponentStatus } from '@/shared/types/common';
import { defaultHeaders } from '@/lib/common';

interface UnlockAccountClientProps {
  email: string | null;
  error: string;
  expiredToken: string | null;
  enableRequestNewToken: boolean;
}

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

export default function UnlockAccountClient({
  email,
  error,
  expiredToken,
  enableRequestNewToken,
}: UnlockAccountClientProps) {
  const [loading, setLoading] = useState(false);
  const [displayResendLink, setDisplayResendLink] = useState(false);
  const [message, setMessage] = useState<Message>({ text: null, status: null });

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }
  }, [error]);

  useEffect(() => {
    if (enableRequestNewToken) {
      setDisplayResendLink(true);
    }
  }, [enableRequestNewToken]);

  const requestNewLink = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/auth/unlock-account`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ email, expiredToken }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error.message);
      }

      setMessage({
        text: 'A new unlock link has been sent to your email.',
        status: 'success',
      });
    } catch (error: any) {
      setMessage({ text: error.message, status: 'error' });
    } finally {
      setLoading(false);
      setDisplayResendLink(false);
    }
  };

  return (
    <div className="rounded p-6 border">
      {message?.text && (
        <Alert variant={message.status === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {displayResendLink && (
        <Button
          className="mt-4 w-full"
          onClick={requestNewLink}
          disabled={loading}
        >
          Request new link
        </Button>
      )}
    </div>
  );
}
