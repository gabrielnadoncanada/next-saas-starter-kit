'use client';

import { Card, InputWithLabel } from '@/components/shared';
import { Button } from 'react-daisyui';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { UpdateNameFormData } from '@/features/account/shared/schema/account.schema';

interface UpdateNameFormViewProps {
  form: UseFormReturn<UpdateNameFormData>;
  onSubmit: () => void;
  isPending: boolean;
  currentName: string;
}

export function UpdateNameFormView({
  form,
  onSubmit,
  isPending,
  currentName,
}: UpdateNameFormViewProps) {
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
            <Card.Title>{t('name')}</Card.Title>
            <Card.Description>{t('update-your-name')}</Card.Description>
            {currentName && (
              <div className="text-sm text-gray-600 mt-1">
                Current name: {currentName}
              </div>
            )}
          </Card.Header>
          <div className="flex flex-col space-y-3">
            <InputWithLabel
              {...register('name')}
              label={t('name')}
              placeholder={t('your-name')}
              error={errors.name?.message}
            />
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              loading={isPending}
              disabled={!isDirty || !isValid}
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
