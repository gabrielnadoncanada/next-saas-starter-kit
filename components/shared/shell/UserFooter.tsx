import React from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCustomSignOut } from 'hooks/useCustomSignout';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';
import {
  ArrowRightOnRectangleIcon,
  SunIcon,
  UserCircleIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/components/ui/avatar';
import Link from 'next/link';

const UserFooter = () => {
  const { data } = useSession();
  const t = useTranslations();
  const signOut = useCustomSignOut();
  const { toggleTheme } = useTheme();
  const { isMobile } = useSidebar();

  if (!data?.user) {
    return null;
  }

  const { user } = data;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image || ''} alt={user.name || ''} />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/account" className="gap-2">
                <UserCircleIcon className="size-4" />
                {t('account')}
              </Link>
            </DropdownMenuItem>
            {env.darkModeEnabled && (
              <DropdownMenuItem onClick={toggleTheme} className="gap-2">
                <SunIcon className="size-4" />
                {t('switch-theme')}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="gap-2">
              <ArrowRightOnRectangleIcon className="size-4" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default UserFooter;
