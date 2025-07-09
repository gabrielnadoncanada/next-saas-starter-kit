'use client';

import { Button } from '@/lib/components/ui/button';
import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
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
    <Dialog open={visible} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <form onSubmit={onSubmit} method="POST">
          <DialogHeader>
            <DialogTitle>{t('create-team')}</DialogTitle>
            <DialogDescription>{t('members-of-a-team')}</DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <InputWithLabel
              {...register('name')}
              label={t('name')}
              placeholder={t('team-name')}
              error={errors.name?.message}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('close')}
            </Button>
            <Button type="submit" disabled={isPending || !isDirty || !isValid}>
              {t('create-team')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
