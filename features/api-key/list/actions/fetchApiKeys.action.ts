'use server';

import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from 'models/team';
import { fetchApiKeys } from 'models/apiKey';

export async function fetchApiKeysAction(teamSlug: string) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    const apiKeys = await fetchApiKeys(team.id);

    return {
      success: true,
      data: apiKeys,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to fetch API keys',
    };
  }
}
