'use client';

import { useUpdateEmailForm } from './hooks/useUpdateEmailForm';
import { UpdateEmailFormView } from './ui/UpdateEmailFormView';
import type { User } from '@prisma/client';

interface UpdateEmailProps {
  user: User;
  allowEmailChange: boolean;
}

export function UpdateEmail({ user, allowEmailChange }: UpdateEmailProps) {
  const { form, handleSubmit, isPending } = useUpdateEmailForm({
    initialEmail: user.email || '',
    allowEmailChange,
  });

  return (
    <UpdateEmailFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
      allowEmailChange={allowEmailChange}
    />
  );
}
