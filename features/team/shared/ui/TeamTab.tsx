'use client';

import {
  Cog6ToothIcon,
  KeyIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  UserPlusIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import type { Team } from '@prisma/client';
import useCanAccess from 'hooks/useCanAccess';
import { useRouter } from 'next/navigation';
import { TeamFeature } from 'types';
import { Tabs, TabsList, TabsTrigger } from '@/lib/components/ui/tabs';

interface TeamTabProps {
  activeTab: string;
  team: Team;
  heading?: string;
  teamFeatures: TeamFeature;
}

export function TeamTab({
  activeTab,
  team,
  heading,
  teamFeatures,
}: TeamTabProps) {
  const { canAccess } = useCanAccess();
  const router = useRouter();

  const navigations = [
    {
      name: 'Settings',
      value: 'settings',
      href: `/teams/${team.slug}/settings`,
      icon: Cog6ToothIcon,
    },
  ];

  if (canAccess('team_member', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'Members',
      value: 'members',
      href: `/teams/${team.slug}/members`,
      icon: UserPlusIcon,
    });
  }

  if (
    teamFeatures.sso &&
    canAccess('team_sso', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Single Sign-On',
      value: 'sso',
      href: `/teams/${team.slug}/sso`,
      icon: ShieldExclamationIcon,
    });
  }

  if (
    teamFeatures.dsync &&
    canAccess('team_dsync', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Directory Sync',
      value: 'directory-sync',
      href: `/teams/${team.slug}/directory-sync`,
      icon: UserPlusIcon,
    });
  }

  if (
    teamFeatures.payments &&
    canAccess('team_billing', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Billing',
      value: 'payments',
      href: `/teams/${team.slug}/billing`,
      icon: BanknotesIcon,
    });
  }

  if (
    teamFeatures.webhook &&
    canAccess('team_webhook', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Webhooks',
      value: 'webhooks',
      href: `/teams/${team.slug}/webhooks`,
      icon: PaperAirplaneIcon,
    });
  }

  if (
    teamFeatures.apiKey &&
    canAccess('team_api_key', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'API Keys',
      value: 'api-keys',
      href: `/teams/${team.slug}/api-keys`,
      icon: KeyIcon,
    });
  }

  const handleTabChange = (value: string) => {
    const navigation = navigations.find((nav) => nav.value === value);
    if (navigation) {
      router.push(navigation.href);
    }
  };

  return (
    <div className="flex flex-col pb-6">
      <h2 className="text-xl font-semibold mb-4">
        {heading ? heading : team.name}
      </h2>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-auto w-full justify-start">
          {navigations.map((menu) => (
            <TabsTrigger
              key={menu.value}
              value={menu.value}
              className="flex items-center gap-2"
            >
              <menu.icon className="h-4 w-4" />
              {menu.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
