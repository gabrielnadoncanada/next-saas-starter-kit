'use client';

import { Loading, Error } from '@/components/shared';
import { useEditTeamForm } from './hooks/useEditTeamForm';
import { EditTeamFormView } from './ui/EditTeamFormView';
import useTeam from 'hooks/useTeam';

interface EditTeamProps {
  teamSlug: string;
  onSuccess?: () => void;
}

export function EditTeam({ teamSlug, onSuccess }: EditTeamProps) {
  const { isLoading, isError, team } = useTeam(teamSlug);

  const { form, handleSubmit, isPending } = useEditTeamForm({
    team,
    onSuccess,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message="Team not found" />;
  }

  return (
    <EditTeamFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}
