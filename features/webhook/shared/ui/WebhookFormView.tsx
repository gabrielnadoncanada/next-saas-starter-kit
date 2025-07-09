'use client';

import { InputWithLabel } from '@/components/shared';
import Modal from '@/components/shared/Modal';
import { Button } from 'react-daisyui';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { WebhookFormData } from '@/features/webhook/shared/schema/webhook.schema';
import { EventTypesView } from './EventTypesView';

interface WebhookFormViewProps {
  visible: boolean;
  onClose: () => void;
  form: UseFormReturn<WebhookFormData>;
  onSubmit: () => void;
  title: string;
  isPending: boolean;
  editMode?: boolean;
}

export function WebhookFormView({
  visible,
  onClose,
  form,
  onSubmit,
  title,
  isPending,
  editMode = false,
}: WebhookFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = form;

  const watchedValues = watch();

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentValues = watchedValues.eventTypes || [];
    if (e.target.checked) {
      setValue('eventTypes', [...currentValues, value]);
    } else {
      setValue(
        'eventTypes',
        currentValues.filter((v) => v !== value)
      );
    }
  };

  return (
    <Modal open={visible} close={onClose}>
      <form onSubmit={onSubmit} method="POST">
        <Modal.Header>{title}</Modal.Header>
        <Modal.Description>{t('webhook-create-desc')}</Modal.Description>
        <Modal.Body>
          <div className="flex flex-col space-y-3">
            <InputWithLabel
              {...register('name')}
              label="Description"
              placeholder="Description of what this endpoint is used for."
              error={errors.name?.message as string}
            />
            <InputWithLabel
              {...register('url')}
              label="Endpoint"
              placeholder="https://api.example.com/svix-webhooks"
              error={errors.url?.message as string}
              descriptionText="The endpoint URL must be HTTPS"
            />
            <div className="divider"></div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">{t('events-to-send')}</span>
              </label>
              <p className="ml-1 mb-3 text-sm font-normal text-gray-500">
                {t('events-description')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <EventTypesView
                  onChange={handleEventTypeChange}
                  values={watchedValues.eventTypes || []}
                  error={errors.eventTypes?.message as string}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline" onClick={onClose} size="md">
            {t('close')}
          </Button>
          <Button
            type="submit"
            color="primary"
            loading={isPending}
            active={isDirty}
            size="md"
          >
            {editMode ? t('update-webhook') : t('create-webhook')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
