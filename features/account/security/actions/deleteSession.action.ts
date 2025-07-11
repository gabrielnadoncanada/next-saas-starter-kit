'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import {
  deleteSession,
  findFirstSessionOrThrown,
} from '@/shared/model/session';

export async function deleteSessionAction(sessionId: string) {
  try {
    const user = await getCurrentUser();

    // Verify the session belongs to the current user
    await findFirstSessionOrThrown({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    // Delete the session
    await deleteSession({
      where: {
        id: sessionId,
      },
    });

    revalidatePath('/settings/account');

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to delete session',
    };
  }
}
