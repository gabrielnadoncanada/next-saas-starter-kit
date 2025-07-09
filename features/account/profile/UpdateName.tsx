'use client';

import { useUpdateNameForm } from './hooks/useUpdateNameForm';
import { UpdateNameFormView } from './ui/UpdateNameFormView';

interface UpdateNameProps {
  name: string;
}

export function UpdateName({ name }: UpdateNameProps) {
  const { form, handleSubmit, isPending, currentName } = useUpdateNameForm({
    initialName: name,
  });

  return (
    <UpdateNameFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
      currentName={currentName}
    />
  );
}
