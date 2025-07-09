import { z } from 'zod';

export const removeMemberSchema = z.object({
  teamSlug: z.string().min(1, 'Team slug is required'),
  userId: z.string().min(1, 'User ID is required'),
});

export type RemoveMemberFormData = z.infer<typeof removeMemberSchema>;
