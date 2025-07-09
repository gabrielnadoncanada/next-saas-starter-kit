import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import TeamNavigation from './TeamNavigation';
import UserNavigation from './UserNavigation';
import { useTranslations } from 'next-intl';

const Navigation = () => {
  const pathname = usePathname();
  const params = useParams();
  const [activePathname, setActivePathname] = useState<null | string>(null);
  const t = useTranslations();

  const slug = params?.slug as string;

  useEffect(() => {
    if (pathname) {
      setActivePathname(pathname);
    }
  }, [pathname]);

  if (slug) {
    return (
      <TeamNavigation
        activePathname={activePathname}
        slug={slug}
        title={t('team-navigation')}
      />
    );
  } else {
    return (
      <UserNavigation
        activePathname={activePathname}
        title={t('main-navigation')}
      />
    );
  }
};

export default Navigation;
