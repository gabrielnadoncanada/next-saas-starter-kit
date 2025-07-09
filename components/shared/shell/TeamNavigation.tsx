import { Cog6ToothIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';

interface TeamNavigationProps extends NavigationProps {
  slug: string;
  title?: string;
}

const TeamNavigation = ({
  slug,
  activePathname,
  title,
}: TeamNavigationProps) => {
  const t = useTranslations();

  const menus: MenuItem[] = [
    {
      name: t('all-products'),
      href: `/teams/${slug}/products`,
      icon: CodeBracketIcon,
      active: activePathname === `/teams/${slug}/products`,
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        !activePathname.includes('products'),
    },
  ];

  return <NavigationItems menus={menus} title={title} />;
};

export default TeamNavigation;
