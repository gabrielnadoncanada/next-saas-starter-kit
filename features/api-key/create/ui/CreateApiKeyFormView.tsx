'use client';

import { InputWithLabel } from '@/components/shared';
import { Button } from 'react-daisyui';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { CreateApiKeyFormData } from '@/features/api-key/shared/schema/apiKey.schema';

interface CreateApiKeyFormViewProps {
  form: UseFormReturn<CreateApiKeyFormData>;
  onSubmit: () => void;
  onClose: () => void;
  isPending: boolean;
}

export function CreateApiKeyFormView({
  form,
  onSubmit,
  onClose,
  isPending,
}: CreateApiKeyFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty, isValid },
  } = form;

  return (
    <form onSubmit={onSubmit} method="POST">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('new-api-key')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('api-key-description')}
          </p>
        </div>

        <InputWithLabel
          {...register('name')}
          label={t('name')}
          placeholder="My API Key"
          className="text-sm"
          error={errors.name?.message}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} size="md">
            {t('close')}
          </Button>
          <Button
            color="primary"
            type="submit"
            loading={isPending}
            disabled={!isDirty || !isValid}
            size="md"
          >
            {t('create-api-key')}
          </Button>
        </div>
      </div>
    </form>
  );
}
