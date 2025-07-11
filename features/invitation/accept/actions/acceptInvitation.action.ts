'use server';

import { redirect } from 'next/navigation';
import { acceptInvitationSchema } from '@/features/invitation/shared/schema/invitation.schema';
import {
  getInvitation,
  isInvitationExpired,
  deleteInvitation,
} from '@/features/invitation/shared/model/invitation';
import { createUser, getUser } from '@/shared/model/user';
import { addTeamMember } from '@/features/team/shared/model/team';
import { hashPassword } from '@/lib/auth-utils';
import { isEmailAllowed } from '@/lib/email/utils';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { createVerificationToken } from '@/features/auth/shared/model/verificationToken';
import env from '@/lib/env';

export async function acceptInvitationAction(
  token: string,
  formData: FormData
) {
  try {
    const rawData = {
      token,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
    };

    const validatedData = acceptInvitationSchema.parse(rawData);

    // Get and validate invitation
    const invitation = await getInvitation({ token });

    if (await isInvitationExpired(invitation.expires)) {
      throw new Error('Invitation expired. Please request a new one.');
    }

    const email = invitation.email!;

    // Validate email is allowed
    if (!isEmailAllowed(email)) {
      throw new Error('Please use your work email address.');
    }

    // Check if user already exists
    const existingUser = await getUser({ email });
    if (existingUser) {
      throw new Error('An user with this email already exists.');
    }

    // Create user account
    const user = await createUser({
      name: validatedData.name,
      email,
      password: await hashPassword(validatedData.password),
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
    await deleteInvitation({ token });

    // Redirect to the team
    redirect(`/teams/${invitation.team.slug}`);
  } catch (error: any) {
    return {
      error: error.message || 'Failed to accept invitation',
    };
  }
}
