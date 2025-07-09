'use client';

import { useUpdatePasswordForm } from './hooks/useUpdatePasswordForm';
import { UpdatePasswordFormView } from './ui/UpdatePasswordFormView';

export function UpdatePassword() {
  const { form, handleSubmit, isPending } = useUpdatePasswordForm();

  return (
    <UpdatePasswordFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}
