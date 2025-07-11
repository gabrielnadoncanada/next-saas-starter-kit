import { useState, useEffect } from 'react';

interface UseLastOwnerStatusProps {
  teams: Array<{ id: string; slug: string }>;
}

export function useLastOwnerStatus({ teams }: UseLastOwnerStatusProps) {
  const [lastOwnerTeams, setLastOwnerTeams] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teams.length) {
      setIsLoading(false);
      return;
    }

    const checkLastOwnerStatus = async () => {
      setIsLoading(true);
      const lastOwnerTeamIds = new Set<string>();

      try {
        // Check each team in parallel
        const promises = teams.map(async (team) => {
          try {
            const response = await fetch(`/api/teams/${team.slug}/last-owner`);
            if (response.ok) {
              const data = await response.json();
              if (data.isLastOwner) {
                lastOwnerTeamIds.add(team.id);
              }
            }
          } catch (error) {
            console.warn(
              `Error checking ownership for team ${team.slug}:`,
              error
            );
          }
        });

        await Promise.all(promises);
        setLastOwnerTeams(lastOwnerTeamIds);
      } catch (error) {
        console.error('Error checking last owner status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLastOwnerStatus();
  }, [teams]);

  return { lastOwnerTeams, isLoading };
}
