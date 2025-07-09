import { getUserTeams } from '@/lib/data-fetchers';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const teams = await getUserTeams();

  if (teams.length > 0) {
    redirect(`/teams/${teams[0].slug}/settings`);
  } else {
    redirect('teams?newTeam=true');
  }
}
