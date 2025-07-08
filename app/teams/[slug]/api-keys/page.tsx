'use client';

import APIKeysContainer from '@/components/apiKey/APIKeysContainer';
import { redirect } from 'next/navigation';
import env from '@/lib/env';
import type { TeamFeature } from 'types';

export default function APIKeys() {
  const teamFeatures: TeamFeature = env.teamFeatures;

  // Redirect if API key feature is not enabled
  if (!env.teamFeatures.apiKey) {
    redirect('/404');
  }

  return <APIKeysContainer teamFeatures={teamFeatures} />;
}
