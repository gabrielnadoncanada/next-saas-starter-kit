'use client';

import { useUpdateNameForm } from './hooks/useUpdateNameForm';
import { UpdateNameFormView } from './ui/UpdateNameFormView';
import { User } from '@prisma/client';

interface UpdateNameProps {
  user: User;
}

export function UpdateName({ user }: UpdateNameProps) {
  const { form, handleSubmit, isPending } = useUpdateNameForm({
    user,
  });

  return (
    <UpdateNameFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}
