import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import type { ApiResponse } from 'types';
import type { TeamInvitation } from 'models/invitation';

interface UseInvitationsProps {
  slug: string;
  sentViaEmail?: boolean;
}

type InvitationsResponse = ApiResponse<TeamInvitation[]>;

const useInvitations = ({ slug, sentViaEmail = true }: UseInvitationsProps) => {
  const params = new URLSearchParams();
  if (sentViaEmail) {
    params.append('sentViaEmail', 'true');
  }

  const { data, error, isLoading, mutate } = useSWR<InvitationsResponse>(
    `/api/teams/${slug}/invitations?${params.toString()}`,
    fetcher
  );

  return {
    isLoading,
    isError: error,
    invitations: data?.data || [],
    mutateInvitation: mutate,
  };
};

export default useInvitations;
