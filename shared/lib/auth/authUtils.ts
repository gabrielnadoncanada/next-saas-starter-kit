import env from '@/lib/env';

export interface AuthProviders {
  github: boolean;
  google: boolean;
  credentials: boolean;
  email: boolean;
}

export function authProviderEnabled(): AuthProviders {
  const providers = env.authProviders.split(',');

  return {
    github: providers.includes('github'),
    google: providers.includes('google'),
    credentials: providers.includes('credentials'),
    email: providers.includes('email'),
  };
}
