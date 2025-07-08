'use client';

import fetcher from '@/lib/fetcher';
import type { Permission } from '@/lib/permissions';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import type { ApiResponse } from 'types';

const usePermissions = () => {
  const params = useParams();
  const teamSlug = params?.slug as string;

  const { data, error, isLoading } = useSWR<ApiResponse<Permission[]>>(
    teamSlug ? `/api/teams/${teamSlug}/permissions` : null,
    fetcher
  );

  return {
    isLoading,
    isError: error,
    permissions: data?.data,
  };
};

export default usePermissions;
