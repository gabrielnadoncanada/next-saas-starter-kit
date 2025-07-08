'use client';

import { AuthLayout } from '@/components/layouts';
import { InputWithLabel, Loading } from '@/components/shared';
import env from '@/lib/env';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

const ssoSchema = z
  .object({
    slug: z
      .string()
      .max(100, 'Team slug should have at most 100 characters')
      .optional(),
    email: z
      .string()
      .email('Enter a valid email address')
      .max(100, 'Email should have at most 100 characters')
      .optional(),
  })
  .refine(
    (data) => {
      return data.email || data.slug;
    },
    {
      message: 'Either email or team slug is required',
      path: ['email'],
    }
  );

type SSOFormData = z.infer<typeof ssoSchema>;

export default function SSO() {
  const { status } = useSession();
  const router = useRouter();
  const [useEmail, setUseEmail] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, touchedFields },
    reset,
  } = useForm<SSOFormData>({
    resolver: zodResolver(ssoSchema),
    defaultValues: {
      slug: '',
      email: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: SSOFormData) => {
    const response = await fetch('/api/auth/sso/verify', {
      method: 'POST',
      body: JSON.stringify(values),
    });

    const { data, error } = await response.json();

    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.useSlug) {
      reset();
      setUseEmail(false);
      toast.error('Multiple SSO teams found. Please use team slug.');
      return;
    }
    await signIn('boxyhq-saml', undefined, {
      tenant: data.teamId,
      product: env.jackson.productId,
    });
  };

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(env.redirectIfAuthenticated);
  }

  return (
    <AuthLayout
      heading="Sign in with SAML SSO"
      description="Enter your email or team slug to continue with SAML SSO"
    >
      <div className="rounded p-6 border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            {useEmail ? (
              <InputWithLabel
                {...register('email')}
                type="email"
                label="Email"
                placeholder="user@boxyhq.com"
                error={touchedFields.email ? errors.email?.message : undefined}
              />
            ) : (
              <InputWithLabel
                {...register('slug')}
                type="text"
                label="Team slug"
                placeholder="boxyhq"
                descriptionText="Contact your administrator to get your team slug"
                error={touchedFields.slug ? errors.slug?.message : undefined}
              />
            )}
            <Button
              type="submit"
              color="primary"
              loading={isSubmitting}
              active={isDirty}
              fullWidth
              size="md"
            >
              Continue with SAML SSO
            </Button>
          </div>
        </form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link href="/auth/login" className="btn btn-outline w-full">
            Sign in with password
          </Link>
          <Link href="/auth/magic-link" className="btn btn-outline w-full">
            Sign in with email
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
