import {
  ChevronUpDownIcon,
  FolderIcon,
  FolderPlusIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import useTeams from 'hooks/useTeams';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { maxLengthPolicies } from '@/lib/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/lib/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/lib/components/ui/sidebar';

const TeamDropdown = () => {
  const params = useParams();
  const { teams } = useTeams();
  const { data } = useSession();
  const t = useTranslations();
  const { isMobile } = useSidebar();

  const currentTeam = (teams || []).find((team) => team.slug === params?.slug);

  const menus = [
    {
      id: 2,
      name: t('teams'),
      items: (teams || []).map((team) => ({
        id: team.id,
        name: team.name,
        href: `/teams/${team.slug}/settings`,
        icon: FolderIcon,
      })),
    },
    {
      id: 1,
      name: t('profile'),
      items: [
        {
          id: data?.user.id,
          name: data?.user?.name,
          href: '/settings/account',
          icon: UserCircleIcon,
        },
      ],
    },
    {
      id: 3,
      name: '',
      items: [
        {
          id: 'all-teams',
          name: t('all-teams'),
          href: '/teams',
          icon: RectangleStackIcon,
        },
        {
          id: 'new-team',
          name: t('new-team'),
          href: '/teams?newTeam=true',
          icon: FolderPlusIcon,
        },
      ],
    },
  ];

  const displayName =
    currentTeam?.name ||
    data?.user?.name?.substring(0, maxLengthPolicies.nameShortDisplay);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {currentTeam ? (
                  <FolderIcon className="size-4" />
                ) : (
                  <UserCircleIcon className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">
                  {currentTeam ? t('team') : t('personal')}
                </span>
              </div>
              <ChevronUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            {menus.map(({ id, name, items }) => {
              return (
                <React.Fragment key={id}>
                  {name && (
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {name}
                    </DropdownMenuLabel>
                  )}
                  {items.map((item) => (
                    <DropdownMenuItem key={`${id}-${item.id}`} asChild>
                      <Link href={item.href} className="gap-2 p-2">
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <item.icon className="size-4 shrink-0" />
                        </div>
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {name && <DropdownMenuSeparator key={`${id}-divider`} />}
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default TeamDropdown;
