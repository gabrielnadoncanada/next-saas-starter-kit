'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createTeamSchema,
  type CreateTeamFormData,
} from '../schema/createTeam.schema';
import { createTeam } from '../../../../models/team';
import { getCurrentUser } from '../../../../lib/data-fetchers';

export async function createTeamAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;

    // Validate input
    const validatedFields = createTeamSchema.safeParse({ name });

    if (!validatedFields.success) {
      return {
        error: 'Invalid form data',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name: teamName } = validatedFields.data;

    // Generate slug from name
    const slug = teamName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create the team
    const team = await createTeam({
      userId: user.id,
      name: teamName,
      slug,
    });

    // Revalidate related paths
    revalidatePath('/teams');
    revalidatePath('/dashboard');

    // Redirect to the new team
    redirect(`/teams/${team.slug}`);
  } catch (error) {
    console.error('Create team error:', error);
    return {
      error: 'Failed to create team. Please try again.',
    };
  }
}
