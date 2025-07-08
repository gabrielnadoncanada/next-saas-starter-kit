'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Card, InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { updateAccountSchema } from '@/lib/zod';

interface UpdateNameProps {
  name: string;
}

const nameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name should have at most 50 characters'),
});

type UpdateNameFormData = z.infer<typeof nameSchema>;

const UpdateName = ({ name }: UpdateNameProps) => {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<UpdateNameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: UpdateNameFormData) => {
    const response = await fetch('/api/users', {
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
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <Card.Body>
            <Card.Header>
              <Card.Title>{t('name')}</Card.Title>
              <Card.Description>{t('update-your-name')}</Card.Description>
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
                loading={isSubmitting}
                disabled={!isDirty || !isValid}
                size="md"
              >
                {t('save-changes')}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </>
  );
};

export default UpdateName;
