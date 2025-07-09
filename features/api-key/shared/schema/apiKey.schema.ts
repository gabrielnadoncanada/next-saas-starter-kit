import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less'),
});

export const deleteApiKeySchema = z.object({
  apiKeyId: z.string().min(1, 'API Key ID is required'),
});

export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;
export type DeleteApiKeyFormData = z.infer<typeof deleteApiKeySchema>;
