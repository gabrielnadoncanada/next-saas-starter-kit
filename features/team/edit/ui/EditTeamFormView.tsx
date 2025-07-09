'use client';

import { Card, InputWithLabel } from '@/components/shared';
import { Button } from 'react-daisyui';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';

interface EditTeamFormViewProps {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  isPending: boolean;
}

export function EditTeamFormView({
  form,
  onSubmit,
  isPending,
}: EditTeamFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty, isValid },
  } = form;

  return (
    <form onSubmit={onSubmit}>
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
              error={errors.name?.message as string}
            />
            <InputWithLabel
              {...register('slug')}
              label={t('slug')}
              error={errors.slug?.message as string}
            />
            <InputWithLabel
              {...register('domain')}
              label={t('domain')}
              error={errors.domain?.message as string}
            />
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              loading={isPending}
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
}
