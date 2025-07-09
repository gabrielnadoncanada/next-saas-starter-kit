'use client';

import { useCreateTeamForm } from './hooks/useCreateTeamForm';
import { CreateTeamFormView } from './ui/CreateTeamFormView';

interface CreateTeamProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export function CreateTeam({ visible, setVisible }: CreateTeamProps) {
  const formState = useCreateTeamForm({
    onSuccess: () => setVisible(false),
    onClose: () => setVisible(false),
  });

  return <CreateTeamFormView visible={visible} {...formState} />;
}
