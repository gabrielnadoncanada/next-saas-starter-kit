import { getUserTeams } from '@/lib/data-fetchers';
import TeamsClient from '@/components/team/TeamsClient';

export default async function AllTeams() {
  const teams = await getUserTeams();

  return <TeamsClient teams={teams} />;
}
