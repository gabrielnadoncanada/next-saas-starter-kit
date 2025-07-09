import { notFound, redirect } from 'next/navigation';
import { TeamTab } from '@/features/team/shared/ui/TeamTab';
import { WebhooksList } from '@/features/webhook';
import { getTeamBySlug } from '@/lib/data-fetchers';
import env from '@/lib/env';
import type { TeamFeature } from 'types';

interface Props {
  params: {
    slug: string;
  };
}

export default async function WebhookList({ params }: Props) {
  // Redirect if webhook feature is not enabled
  if (!env.teamFeatures.webhook) {
    redirect('/404');
  }

  const team = await getTeamBySlug(params.slug);

  if (!team) {
    notFound();
  }

  const teamFeatures: TeamFeature = env.teamFeatures;

  return (
    <>
      <TeamTab activeTab="webhooks" team={team} teamFeatures={teamFeatures} />
      <WebhooksList teamSlug={team.slug} />
    </>
  );
}
