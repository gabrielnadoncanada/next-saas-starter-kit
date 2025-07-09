'use client';

import { useTransition, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  updateNameSchema,
  type UpdateNameFormData,
} from '@/features/account/shared/schema/account.schema';
import { updateNameAction } from '../actions/updateName.action';

interface UseUpdateNameFormProps {
  initialName: string;
}

export function useUpdateNameForm({ initialName }: UseUpdateNameFormProps) {
  const [isPending, startTransition] = useTransition();
  const [currentName, setCurrentName] = useState(initialName);
  const { update } = useSession();
  const router = useRouter();

  const form = useForm<UpdateNameFormData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: currentName,
    },
    mode: 'onChange',
  });

  // Update local state when prop changes
  useEffect(() => {
    setCurrentName(initialName);
    form.reset({ name: initialName });
  }, [initialName, form]);

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);

      const result = await updateNameAction(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Update the session with the new name
      await update({ name: values.name });

      // Update local state immediately to reflect the change in UI
      setCurrentName(values.name);

      // Reset the form to mark it as not dirty since we've successfully updated
      form.reset({ name: values.name });

      toast.success('Name updated successfully');

      // Refresh the page to update all components with the new session data
      router.refresh();
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
    currentName,
  };
}
