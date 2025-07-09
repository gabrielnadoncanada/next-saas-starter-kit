import React from 'react';
import { useSession } from 'next-auth/react';
import { SidebarTrigger } from '@/lib/components/ui/sidebar';
import HeaderTeamDropdown from './HeaderTeamDropdown';

const Header = () => {
  const { status } = useSession();

  if (status === 'loading') {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b px-4 sm:gap-x-6 sm:px-6 lg:px-8 bg-white dark:bg-black dark:text-white">
      <SidebarTrigger />
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <HeaderTeamDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;
