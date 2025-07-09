'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { ApiResponse } from 'types';
import { Card, InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import type { User } from '@prisma/client';

interface UpdateEmailProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

const emailSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
});

type UpdateEmailFormData = z.infer<typeof emailSchema>;

const UpdateEmail = ({ user, allowEmailChange }: UpdateEmailProps) => {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<UpdateEmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user.email || '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: UpdateEmailFormData) => {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const json = (await response.json()) as ApiResponse;
      toast.error(json.error.message);
      return;
    }

    toast.success(t('successfully-updated'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('email-address')}</Card.Title>
            <Card.Description>
              {t('email-address-description')}
            </Card.Description>
          </Card.Header>
          <InputWithLabel
            {...register('email')}
            type="email"
            label={t('email-address')}
            placeholder={t('your-email')}
            error={errors.email?.message}
            disabled={!allowEmailChange}
            required
          />
        </Card.Body>
        <Card.Footer>
          <Button
            type="submit"
            color="primary"
            loading={isSubmitting}
            disabled={!isDirty || !isValid}
            size="md"
          >
            {t('save-changes')}
          </Button>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UpdateEmail;
