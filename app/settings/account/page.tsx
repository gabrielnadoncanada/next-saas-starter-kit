'use client';

import { UpdateAccount } from '@/components/account';
import { Loading, Error } from '@/components/shared';
import { useSession } from 'next-auth/react';
import env from '@/lib/env';

export default function Account() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return <Error message="Not authenticated" />;
  }

  const user = {
    id: session.user.id,
    email: session.user.email ?? undefined,
    name: session.user.name ?? undefined,
    image: session.user.image ?? undefined,
  };

  return (
    <UpdateAccount user={user} allowEmailChange={env.confirmEmail === false} />
  );
}
