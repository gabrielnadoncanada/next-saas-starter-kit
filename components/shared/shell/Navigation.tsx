import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import TeamNavigation from './TeamNavigation';
import UserNavigation from './UserNavigation';

const Navigation = () => {
  const pathname = usePathname();
  const params = useParams();
  const [activePathname, setActivePathname] = useState<null | string>(null);

  const slug = params?.slug as string;

  useEffect(() => {
    if (pathname) {
      setActivePathname(pathname);
    }
  }, [pathname]);

  const NavigationComponent = () => {
    if (slug) {
      return <TeamNavigation activePathname={activePathname} slug={slug} />;
    } else {
      return <UserNavigation activePathname={activePathname} />;
    }
  };

  return (
    <nav className="flex flex-1 flex-col">
      <NavigationComponent />
    </nav>
  );
};

export default Navigation;
