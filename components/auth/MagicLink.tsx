import { InputWithLabel, Loading } from '@/components/shared';
import env from '@/lib/env';
import { zodResolver } from '@hookform/resolvers/zod';
import useInvitation from 'hooks/useInvitation';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/lib/components/ui/button';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useEffect } from 'react';

interface MagicLinkProps {
  csrfToken: string | undefined;
}

const magicLinkSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

const MagicLink = ({ csrfToken }: MagicLinkProps) => {
  const router = useRouter();
  const { status } = useSession();
  const t = useTranslations();
  const { invitation } = useInvitation();

  const params = invitation ? `?token=${invitation.token}` : '';

  const callbackUrl = invitation
    ? `/invitations/${invitation.token}`
    : env.redirectIfAuthenticated;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, touchedFields },
    reset,
  } = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: MagicLinkFormData) => {
    const response = await signIn('email', {
      email: values.email,
      csrfToken,
      redirect: false,
      callbackUrl,
    });

    reset();

    if (response?.error) {
      toast.error(t('email-login-error'));
      return;
    }

    if (response?.status === 200 && response?.ok) {
      toast.success(t('email-login-success'));
      return;
    }
  };

  // Handle redirect when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(env.redirectIfAuthenticated);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{t('magic-link-title')}</title>
      </Head>
      <div className="rounded p-6 border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <InputWithLabel
              {...register('email')}
              type="email"
              label="Email"
              placeholder="jackson@boxyhq.com"
              descriptionText="We'll email you a magic link for a password-free sign in."
              error={touchedFields.email ? errors.email?.message : undefined}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {t('send-magic-link')}
            </Button>
          </div>
        </form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link
            href={`/auth/login/${params}`}
            className="btn btn-outline w-full"
          >
            &nbsp;{t('sign-in-with-password')}
          </Link>
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 mt-3">
        {t('dont-have-an-account')}
        <Link
          href={`/auth/join${params}`}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          &nbsp;{t('create-a-free-account')}
        </Link>
      </p>
    </>
  );
};

export default MagicLink;
