'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam, updateTeam } from 'models/team';
import { updateTeamSchema } from '@/lib/zod';

export async function updateTeamAction(teamSlug: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    const rawData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      domain: formData.get('domain') as string,
    };

    const validatedData = updateTeamSchema.parse(rawData);

    await updateTeam(team.id, validatedData);

    revalidatePath(`/teams/${validatedData.slug}/settings`);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to update team',
    };
  }
}
