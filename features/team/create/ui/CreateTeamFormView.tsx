'use client';

import { Button } from 'react-daisyui';
import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import Modal from '@/components/shared/Modal';
import { InputWithLabel } from '@/components/shared';
import type { CreateTeamFormData } from '../schema/createTeam.schema';

interface CreateTeamFormViewProps {
  // Modal state
  visible: boolean;

  // Form state
  form: UseFormReturn<CreateTeamFormData>;
  isPending: boolean;

  // Actions
  onSubmit: () => void;
  onClose: () => void;
}

export function CreateTeamFormView({
  visible,
  form,
  isPending,
  onSubmit,
  onClose,
}: CreateTeamFormViewProps) {
  const t = useTranslations();

  const {
    register,
    formState: { errors, isDirty, isValid },
  } = form;

  return (
    <Modal open={visible} close={onClose}>
      <form onSubmit={onSubmit} method="POST">
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
            loading={isPending}
            size="md"
            disabled={!isDirty || !isValid}
          >
            {t('create-team')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
