import { InputWithLabel } from '@/components/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { webhookEndpointSchema } from '@/lib/zod';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import type { WebhookFormSchema } from 'types';
import { z } from 'zod';
import Modal from '../shared/Modal';
import { EventTypes } from '@/components/webhook';

interface FormProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialValues: WebhookFormSchema;
  onSubmit: (
    values: WebhookFormSchema,
    helpers: { resetForm: () => void }
  ) => void | Promise<void>;
  title: string;
  editMode?: boolean;
}

const Form = ({
  visible,
  setVisible,
  initialValues,
  onSubmit,
  title,
  editMode = false,
}: FormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<WebhookFormSchema>({
    resolver: zodResolver(webhookEndpointSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const t = useTranslations();

  const toggleVisible = () => {
    setVisible(!visible);
    reset();
  };

  const handleFormSubmit = async (values: WebhookFormSchema) => {
    await onSubmit(values, { resetForm: () => reset() });
  };

  // Watch values for controlled components
  const watchedValues = watch();

  return (
    <Modal open={visible} close={toggleVisible}>
      <form onSubmit={handleSubmit(handleFormSubmit)} method="POST">
        <Modal.Header>{title}</Modal.Header>
        <Modal.Description>{t('webhook-create-desc')}</Modal.Description>
        <Modal.Body>
          <div className="flex flex-col space-y-3">
            <InputWithLabel
              {...register('name')}
              label="Description"
              placeholder="Description of what this endpoint is used for."
              error={errors.name?.message}
            />
            <InputWithLabel
              {...register('url')}
              label="Endpoint"
              placeholder="https://api.example.com/svix-webhooks"
              error={errors.url?.message}
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
                <EventTypes
                  onChange={(e) => {
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
                  }}
                  values={watchedValues.eventTypes || []}
                  error={errors.eventTypes?.message}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
            size="md"
          >
            {t('close')}
          </Button>
          <Button
            type="submit"
            color="primary"
            loading={isSubmitting}
            active={isDirty}
            size="md"
          >
            {editMode ? t('update-webhook') : t('create-webhook')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default Form;
