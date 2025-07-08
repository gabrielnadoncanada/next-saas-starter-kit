import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { useParams } from 'next/navigation';
import type { ApiResponse } from 'types';
import { Invitation, Team } from '@prisma/client';

type Response = ApiResponse<Invitation & { team: Team }>;

const useInvitation = (token?: string) => {
  const params = useParams();

  const { data, error, isLoading } = useSWR<Response>(() => {
    const inviteToken = token || (params?.token as string);
    return inviteToken ? `/api/invitations/${inviteToken}` : null;
  }, fetcher);

  return {
    isLoading,
    error,
    invitation: data?.data,
  };
};

export default useInvitation;
