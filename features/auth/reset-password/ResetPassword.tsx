'use client';

import { useResetPasswordForm } from './hooks/useResetPasswordForm';
import { ResetPasswordFormView } from './ui/ResetPasswordFormView';

interface ResetPasswordProps {
  token: string;
}

export function ResetPassword({ token }: ResetPasswordProps) {
  const { form, handleSubmit, isPending } = useResetPasswordForm({ token });

  return (
    <ResetPasswordFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}
