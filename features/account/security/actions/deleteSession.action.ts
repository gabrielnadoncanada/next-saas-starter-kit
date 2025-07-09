'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';

export async function deleteSessionAction(sessionId: string) {
  try {
    const user = await getCurrentUser();

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/sessions/${sessionId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete session');
    }

    revalidatePath('/settings/security');

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to delete session',
    };
  }
}
