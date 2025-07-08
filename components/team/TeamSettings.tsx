'use client';

import { Card, Error, InputWithLabel, Loading } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { zodResolver } from '@hookform/resolvers/zod';
import useTeam from 'hooks/useTeam';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { z } from 'zod';
import { updateTeamSchema } from '@/lib/zod';

interface TeamSettingsProps {
  teamSlug: string;
}

type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;

const TeamSettings = ({ teamSlug }: TeamSettingsProps) => {
  const router = useRouter();
  const { isLoading, isError, team } = useTeam(teamSlug);
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<UpdateTeamFormData>({
    resolver: zodResolver(updateTeamSchema) as any,
    defaultValues: {
      name: team?.name || '',
      slug: team?.slug || '',
      domain: team?.domain || '',
    },
    mode: 'onChange',
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  const onSubmit = async (values: UpdateTeamFormData) => {
    const response = await fetch(`/api/teams/${team.slug}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('successfully-updated'));

    if (values.slug !== team.slug) {
      router.push(`/teams/${values.slug}/settings`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('team-settings')}</Card.Title>
            <Card.Description>
              {t('team-settings-description')}
            </Card.Description>
          </Card.Header>
          <div className="flex flex-col space-y-4">
            <InputWithLabel
              {...register('name')}
              label={t('name')}
              error={errors.name?.message}
            />
            <InputWithLabel
              {...register('slug')}
              label={t('slug')}
              error={errors.slug?.message}
            />
            <InputWithLabel
              {...register('domain')}
              label={t('domain')}
              error={errors.domain?.message}
            />
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              loading={isSubmitting}
              disabled={!isValid || !isDirty}
              size="md"
            >
              {t('save-changes')}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default TeamSettings;
