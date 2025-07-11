// API Key feature has been removed
import { ApiError } from '../errors';

// This function is disabled because API key feature has been removed
/*
export const throwIfNoAccessToApiKey = async (
  apiKeyId: string,
  teamId: string
) => {
  const apiKey = await getApiKeyById(apiKeyId);

  if (!apiKey) {
    throw new ApiError(404, 'API key not found');
  }

  if (teamId !== apiKey.teamId) {
    throw new ApiError(
      403,
      'You do not have permission to delete this API key'
    );
  }
};
*/
