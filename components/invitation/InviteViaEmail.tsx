import { InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteViaEmailSchema } from '@/lib/zod';
import { Role } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { z } from 'zod';

interface InviteViaEmailProps {
  teamSlug: string;
  onSuccess: () => void;
}

const emailInviteSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
  role: z.nativeEnum(Role),
});

type EmailInviteFormData = z.infer<typeof emailInviteSchema>;

const InviteViaEmail = ({ teamSlug, onSuccess }: InviteViaEmailProps) => {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<EmailInviteFormData>({
    resolver: zodResolver(emailInviteSchema),
    defaultValues: {
      email: '',
      role: Role.MEMBER,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: EmailInviteFormData) => {
    const response = await fetch(`/api/teams/${teamSlug}/invitations`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...values,
        sentViaEmail: true,
      }),
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('invitation-sent'));
    reset();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="POST" className="pb-6">
      <div className="flex flex-col space-y-3">
        <InputWithLabel
          {...register('email')}
          type="email"
          label={t('email')}
          placeholder="jackson@boxyhq.com"
          error={errors.email?.message}
        />
        <div className="form-control">
          <label className="label">
            <span className="label-text">{t('role')}</span>
          </label>
          <select {...register('role')} className="select select-bordered">
            <option value={Role.MEMBER}>{t('member')}</option>
            <option value={Role.ADMIN}>{t('admin')}</option>
            <option value={Role.OWNER}>{t('owner')}</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <Button
          type="submit"
          color="primary"
          loading={isSubmitting}
          disabled={!isValid || !isDirty}
          size="md"
        >
          {t('send-invite')}
        </Button>
      </div>
    </form>
  );
};

export default InviteViaEmail;
