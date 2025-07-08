import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Card, InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { updatePasswordSchema } from '@/lib/zod';

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

const UpdatePassword = () => {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid, touchedFields },
    reset,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: UpdatePasswordFormData) => {
    const response = await fetch('/api/password', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    const json = await response.json();

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('successfully-updated'));
    reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <Card.Body>
            <Card.Header>
              <Card.Title>{t('password')}</Card.Title>
              <Card.Description>{t('change-password-text')}</Card.Description>
            </Card.Header>
            <div className="flex flex-col space-y-3">
              <InputWithLabel
                {...register('currentPassword')}
                type="password"
                label={t('current-password')}
                placeholder={t('current-password')}
                error={
                  touchedFields.currentPassword
                    ? errors.currentPassword?.message
                    : undefined
                }
                className="text-sm"
              />
              <InputWithLabel
                {...register('newPassword')}
                type="password"
                label={t('new-password')}
                placeholder={t('new-password')}
                error={
                  touchedFields.newPassword
                    ? errors.newPassword?.message
                    : undefined
                }
                className="text-sm"
              />
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                loading={isSubmitting}
                disabled={!isDirty || !isValid}
                size="md"
              >
                {t('change-password')}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </>
  );
};

export default UpdatePassword;
