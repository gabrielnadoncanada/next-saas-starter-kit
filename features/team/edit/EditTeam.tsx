'use client';

import { Error } from '@/components/shared';
import { useEditTeamForm } from './hooks/useEditTeamForm';
import { EditTeamFormView } from './ui/EditTeamFormView';
import type { Team } from '@prisma/client';

interface EditTeamProps {
  team: Team;
  onSuccess?: () => void;
}

export function EditTeam({ team, onSuccess }: EditTeamProps) {
  const { form, handleSubmit, isPending } = useEditTeamForm({
    team,
    onSuccess,
  });

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
