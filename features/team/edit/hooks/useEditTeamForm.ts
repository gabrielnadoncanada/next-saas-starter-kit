'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { updateTeamSchema } from '@/lib/zod';
import { updateTeamAction } from '../actions/updateTeam.action';
import { z } from 'zod';

type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;

interface UseEditTeamFormProps {
  team: any;
  onSuccess?: () => void;
}

export function useEditTeamForm({ team, onSuccess }: UseEditTeamFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateTeamFormData>({
    resolver: zodResolver(updateTeamSchema) as any,
    defaultValues: {
      name: team?.name || '',
      slug: team?.slug || '',
      domain: team?.domain || '',
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('slug', values.slug);
      formData.append('domain', values.domain || '');

      const result = await updateTeamAction(team.slug, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Team updated successfully');
      onSuccess?.();

      // Redirect if slug changed
      if (values.slug !== team.slug) {
        router.push(`/teams/${values.slug}/settings`);
      }
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
  };
}
