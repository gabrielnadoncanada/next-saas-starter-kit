'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from 'models/team';
import { deleteApiKey } from 'models/apiKey';

export async function deleteApiKeyAction(teamSlug: string, apiKeyId: string) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    await deleteApiKey(apiKeyId);

    revalidatePath(`/teams/${teamSlug}/api-keys`);

    return { success: true };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to delete API key',
    };
  }
}
