'use server';

import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/auth-utils';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { isEmailAllowed } from '@/lib/email/utils';
import env from '@/lib/env';
import { createUser, getUser } from '@/shared/model/user';
import { addTeamMember } from '@/features/team/shared/model/team';
import {
  getInvitation,
  isInvitationExpired,
  deleteInvitation,
} from '@/features/invitation/shared/model/invitation';
import { validateRecaptcha } from '@/lib/recaptcha';
import { createVerificationToken } from '@/features/auth/shared/model/verificationToken';
import { userJoinSchema } from '@/lib/zod';

interface JoinWithInvitationData {
  name: string;
  email?: string;
  password: string;
  sentViaEmail: boolean;
  recaptchaToken: string;
  inviteToken: string;
}

export async function joinWithInvitationAction(
  inviteToken: string,
  formData: FormData
) {
  try {
    const data: JoinWithInvitationData = {
      name: formData.get('name') as string,
      email: (formData.get('email') as string) || undefined,
      password: formData.get('password') as string,
      sentViaEmail: formData.get('sentViaEmail') === 'true',
      recaptchaToken: formData.get('recaptchaToken') as string,
      inviteToken,
    };

    // Validate recaptcha
    await validateRecaptcha(data.recaptchaToken);

    // Get and validate invitation
    const invitation = await getInvitation({ token: inviteToken });

    if (await isInvitationExpired(invitation.expires)) {
      throw new Error('Invitation expired. Please request a new one.');
    }

    // Determine email to use
    let email: string;
    if (invitation.sentViaEmail) {
      email = invitation.email!;
    } else {
      if (!data.email) {
        throw new Error('Email is required.');
      }
      email = data.email;
    }

    // Validate input data
    userJoinSchema.parse({
      name: data.name,
      email,
      password: data.password,
    });

    // Check if email is allowed
    if (!isEmailAllowed(email)) {
      throw new Error(
        'We currently only accept work email addresses for sign-up. Please use your work email to create an account.'
      );
    }

    // Check if user already exists
    const existingUser = await getUser({ email });
    if (existingUser) {
      throw new Error('An user with this email already exists.');
    }

    // Create user
    const user = await createUser({
      name: data.name,
      email,
      password: await hashPassword(data.password),
      emailVerified: new Date(), // Auto-verify for invited users
    });

    // Add user to team
    await addTeamMember(invitation.teamId, user.id, invitation.role);

    // Send verification email if needed
    if (env.confirmEmail && !user.emailVerified) {
      const verificationToken = await createVerificationToken({
        identifier: email,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await sendVerificationEmail({ user, verificationToken });
    }

    // Delete the invitation as it's been used
    await deleteInvitation({ token: inviteToken });

    redirect(`/auth/login?token=${inviteToken}`);
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create account',
    };
  }
}
