'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { updateAccountSchema } from '@/lib/zod';

interface UpdateNameProps {
  name: string;
}

const nameSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name should have at most 50 characters'),
});

type UpdateNameFormData = z.infer<typeof nameSchema>;

const UpdateName = ({ name }: UpdateNameProps) => {
  const t = useTranslations();
  const { update } = useSession();
  const router = useRouter();

  // Use local state to track the current name
  const [currentName, setCurrentName] = useState(name);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<UpdateNameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: currentName,
    },
    mode: 'onChange',
  });

  // Update local state when prop changes
  useEffect(() => {
    setCurrentName(name);
  }, [name]);

  const onSubmit = async (values: UpdateNameFormData) => {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const json = await response.json();
      toast.error(json.error.message);
      return;
    }

    // Update the session with the new name
    await update({ name: values.name });

    // Update local state immediately to reflect the change in UI
    setCurrentName(values.name);

    // Reset the form to mark it as not dirty since we've successfully updated
    reset({ name: values.name });

    toast.success(t('successfully-updated'));

    // Refresh the page to update all components with the new session data
    router.refresh();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
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
