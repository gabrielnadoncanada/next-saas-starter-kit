import useSWR from 'swr';
import type { TeamInvitation } from '@/features/invitation/shared/model/invitation';
import { getInvitationsAction } from '../actions/getInvitations.action';

interface UseInvitationsProps {
  slug: string;
  sentViaEmail?: boolean;
}

const useInvitations = ({ slug, sentViaEmail = true }: UseInvitationsProps) => {
  const { data, error, isLoading, mutate } = useSWR(
    `invitations-${slug}-${sentViaEmail}`,
    async () => {
      const result = await getInvitationsAction(slug, sentViaEmail);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    }
  );

  return {
    isLoading,
    isError: error,
    invitations: data || [],
    mutateInvitation: mutate,
  };
};

export default useInvitations;
