import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(50, 'Team name must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9\s-_]+$/,
      'Team name can only contain letters, numbers, spaces, hyphens, and underscores'
    ),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;
