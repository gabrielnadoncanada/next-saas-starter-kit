'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from 'models/team';
import { webhookEndpointSchema } from '@/features/webhook/shared/schema/webhook.schema';

export async function createWebhookAction(
  teamSlug: string,
  formData: FormData
) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    const rawData = {
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      eventTypes: JSON.parse((formData.get('eventTypes') as string) || '[]'),
    };

    const validatedData = webhookEndpointSchema.parse(rawData);

    // Here you would typically call a webhook service or API
    // For now, I'll assume there's a webhook model/service to create the webhook
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/teams/${teamSlug}/webhooks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create webhook');
    }

    revalidatePath(`/teams/${teamSlug}/webhooks`);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create webhook',
    };
  }
}
