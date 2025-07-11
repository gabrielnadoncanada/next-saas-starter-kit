import { UpdateAccount } from '@/features/account';
import { getCurrentUserWithData } from '@/lib/data-fetchers';
import { notFound } from 'next/navigation';
import env from '@/lib/env';

export default async function Account() {
  const user = await getCurrentUserWithData();

  if (!user) {
    notFound();
  }

  return (
    <UpdateAccount user={user} allowEmailChange={env.confirmEmail === false} />
  );
}
