'use client';

import { defaultHeaders } from '@/lib/common';
import type { Team } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTeamSchema } from '@/lib/zod';
import useTeams from 'hooks/useTeams';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { z } from 'zod';
import Modal from '../shared/Modal';
import { InputWithLabel } from '../shared';

interface CreateTeamProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

const CreateTeam = ({ visible, setVisible }: CreateTeamProps) => {
  const t = useTranslations();
  const { mutateTeams } = useTeams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: CreateTeamFormData) => {
    const response = await fetch('/api/teams/', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    const json = (await response.json()) as ApiResponse<Team>;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    reset();
    mutateTeams();
    setVisible(false);
    toast.success(t('team-created'));
    router.push(`/teams/${json.data.slug}/settings`);
  };

  const onClose = () => {
    setVisible(false);
    router.push(`/teams`);
  };

  return (
    <Modal open={visible} close={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <Modal.Header>{t('create-team')}</Modal.Header>
        <Modal.Description>{t('members-of-a-team')}</Modal.Description>
        <Modal.Body>
          <InputWithLabel
            {...register('name')}
            label={t('name')}
            placeholder={t('team-name')}
            error={errors.name?.message}
            required
          />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline" onClick={onClose} size="md">
            {t('close')}
          </Button>
          <Button
            type="submit"
            color="primary"
            loading={isSubmitting}
            size="md"
            disabled={!isDirty || !isValid}
          >
            {t('create-team')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateTeam;
