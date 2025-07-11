'use client';

import { LetterAvatar } from '@/components/shared';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/lib/components/ui/button';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { CreateTeam } from '@/features/team';
import { Table } from '@/components/shared/table/Table';
import { leaveTeamAction } from '@/features/member';
import { useLastOwnerStatus } from '@/hooks/useLastOwnerStatus';

interface TeamsClientProps {
  teams: any[];
}

const TeamsClient = ({ teams: initialTeams }: TeamsClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [team, setTeam] = useState<any | null>(null);
  const [teams, setTeams] = useState(initialTeams);
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { lastOwnerTeams, isLoading: isCheckingOwnership } = useLastOwnerStatus(
    { teams }
  );

  const newTeam = searchParams.get('newTeam');

  useEffect(() => {
    if (newTeam) {
      setCreateTeamVisible(true);
    }
  }, [newTeam]);

  const leaveTeam = async (team: any) => {
    startTransition(async () => {
      const result = await leaveTeamAction(team.slug);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(t('leave-team-success'));

      // Remove the team from local state
      setTeams(teams.filter((t) => t.id !== team.id));
      setAskConfirmation(false);
    });
  };

  // Refresh teams when modal closes (team creation handled by CreateTeam component)
  const handleCreateTeamClose = () => {
    setCreateTeamVisible(false);
    // In a real implementation, we might want to refetch teams here
    // For now, the CreateTeam component handles navigation
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('all-teams')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('team-listed')}
          </p>
        </div>
        <Button onClick={() => setCreateTeamVisible(!createTeamVisible)}>
          {t('create-team')}
        </Button>
      </div>

      <Table
        cols={[t('name'), t('members'), t('created-at'), t('actions')]}
        body={
          teams
            ? teams.map((team) => {
                return {
                  id: team.id,
                  cells: [
                    {
                      wrap: true,
                      element: (
                        <Link href={`/teams/${team.slug}/members`}>
                          <div className="flex items-center justify-start space-x-2">
                            <LetterAvatar name={team.name} />
                            <span className="underline">{team.name}</span>
                          </div>
                        </Link>
                      ),
                    },
                    { wrap: true, text: '' + team._count.members },
                    {
                      wrap: true,
                      text: new Date(team.createdAt).toDateString(),
                    },
                    {
                      buttons: lastOwnerTeams.has(team.id)
                        ? [
                            {
                              color: 'error',
                              text: t('transfer-ownership'),
                              disabled: isPending || isCheckingOwnership,
                              tooltip: t('last-owner-cannot-leave'),
                              onClick: () => {
                                // Navigate to members page to transfer ownership
                                router.push(`/teams/${team.slug}/members`);
                              },
                            },
                          ]
                        : [
                            {
                              color: 'error',
                              text: t('leave-team'),
                              disabled: isPending || isCheckingOwnership,
                              onClick: () => {
                                setTeam(team);
                                setAskConfirmation(true);
                              },
                            },
                          ],
                    },
                  ],
                };
              })
            : []
        }
      ></Table>

      <ConfirmationDialog
        visible={askConfirmation}
        title={`${t('leave-team')} ${team?.name}`}
        onCancel={() => setAskConfirmation(false)}
        onConfirm={() => {
          if (team) {
            leaveTeam(team);
          }
        }}
        confirmText={t('leave-team')}
      >
        {t('leave-team-confirmation')}
      </ConfirmationDialog>
      <CreateTeam
        visible={createTeamVisible}
        setVisible={setCreateTeamVisible}
      />
    </div>
  );
};

export default TeamsClient;
