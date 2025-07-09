import { redirect } from 'next/navigation';
import { getUserTeams } from '@/lib/data-fetchers';

export default async function Organizations() {
  const teams = await getUserTeams();

  if (!teams || teams.length === 0) {
    redirect('/teams?newTeam=true');
  }

  redirect('/dashboard');
}
