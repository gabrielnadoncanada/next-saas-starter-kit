'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from 'models/team';

export async function deleteWebhookAction(teamSlug: string, webhookId: string) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/teams/${teamSlug}/webhooks?webhookId=${webhookId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete webhook');
    }

    revalidatePath(`/teams/${teamSlug}/webhooks`);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to delete webhook',
    };
  }
}
