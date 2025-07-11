'use server';

import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/auth-utils';
import { slugify } from '@/lib/server-common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { isEmailAllowed } from '@/lib/email/utils';
import env from '@/lib/env';
import { createTeam, isTeamExists } from '@/features/team/shared/model/team';
import { createUser, getUser } from '@/shared/model/user';
import { validateRecaptcha } from '@/lib/recaptcha';
import { createVerificationToken } from '@/features/auth/shared/model/verificationToken';
import { userJoinSchema } from '@/lib/zod';

interface JoinActionData {
  name: string;
  email: string;
  password: string;
  team: string;
  recaptchaToken: string;
}

export async function joinAction(formData: FormData) {
  try {
    const data: JoinActionData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      team: formData.get('team') as string,
      recaptchaToken: formData.get('recaptchaToken') as string,
    };

    // Validate recaptcha
    await validateRecaptcha(data.recaptchaToken);

    // Validate input data
    userJoinSchema.parse({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    // Check if email is allowed
    if (!isEmailAllowed(data.email)) {
      throw new Error(
        'We currently only accept work email addresses for sign-up. Please use your work email to create an account.'
      );
    }

    // Check if user already exists
    const existingUser = await getUser({ email: data.email });
    if (existingUser) {
      throw new Error('An user with this email already exists.');
    }

    // Validate team name and slug
    if (!data.team) {
      throw new Error('A team name is required.');
    }

    const slug = slugify(data.team);
    const slugCollisions = await isTeamExists(slug);

    if (slugCollisions > 0) {
      throw new Error('A team with this slug already exists.');
    }

    // Create user
    const user = await createUser({
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
      emailVerified: env.confirmEmail ? null : new Date(),
    });

    // Create team with user as owner
    await createTeam({
      userId: user.id,
      name: data.team,
      slug,
    });

    // Send verification email if needed
    if (env.confirmEmail && !user.emailVerified) {
      const verificationToken = await createVerificationToken({
        identifier: data.email,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await sendVerificationEmail({ user, verificationToken });
    }

    // Redirect based on email confirmation requirement
    if (env.confirmEmail && !user.emailVerified) {
      redirect('/auth/verify-email');
    } else {
      redirect('/auth/login');
    }
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create account',
    };
  }
}
