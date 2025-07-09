import {
  RectangleStackIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import NavigationItems from './NavigationItems';
import { MenuItem, NavigationProps } from './NavigationItems';

interface UserNavigationProps extends NavigationProps {
  title?: string;
}

const UserNavigation = ({ activePathname, title }: UserNavigationProps) => {
  const t = useTranslations();

  const menus: MenuItem[] = [
    {
      name: t('all-teams'),
      href: '/teams',
      icon: RectangleStackIcon,
      active: activePathname === '/teams',
    },
    {
      name: t('account'),
      href: '/settings/account',
      icon: UserCircleIcon,
      active: activePathname === '/settings/account',
    },
    {
      name: t('security'),
      href: '/settings/security',
      icon: ShieldCheckIcon,
      active: activePathname === '/settings/security',
    },
  ];

  return <NavigationItems menus={menus} title={title} />;
};

export default UserNavigation;
