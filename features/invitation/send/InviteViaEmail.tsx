'use client';

import { useInviteViaEmailForm } from './hooks/useInviteViaEmailForm';
import { InviteViaEmailFormView } from './ui/InviteViaEmailFormView';

interface InviteViaEmailProps {
  teamSlug: string;
  onSuccess?: () => void;
}

export function InviteViaEmail({ teamSlug, onSuccess }: InviteViaEmailProps) {
  const { form, handleSubmit, isPending } = useInviteViaEmailForm({
    teamSlug,
    onSuccess,
  });

  return (
    <InviteViaEmailFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}
