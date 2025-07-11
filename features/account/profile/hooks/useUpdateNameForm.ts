'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  updateNameSchema,
  type UpdateNameFormData,
} from '@/features/account/shared/schema/account.schema';
import { updateNameAction } from '../actions/updateName.action';
import { User } from '@prisma/client';

interface UseUpdateNameFormProps {
  user: User;
}

export function useUpdateNameForm({ user }: UseUpdateNameFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<UpdateNameFormData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: user.name,
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);

      const result = await updateNameAction(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Name updated successfully');

      // Refresh the page to show updated data
      router.refresh();
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
  };
}
