'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useTeams from 'hooks/useTeams';
import { Loading } from '@/components/shared';

export default function Organizations() {
  const router = useRouter();
  const { status } = useSession();
  const { teams, isLoading } = useTeams();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (!isLoading) {
      if (!teams || teams.length === 0) {
        toast.error('No active team found');
        router.push('/teams?newTeam=true');
        return;
      }

      router.push('/dashboard');
    }
  }, [status, teams, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="mb-6 flex w-1/2 flex-col items-center gap-4 p-3">
      <h3>Choose Team</h3>
      <div className="w-3/5 rounded bg-white dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0"></div>
    </div>
  );
}
