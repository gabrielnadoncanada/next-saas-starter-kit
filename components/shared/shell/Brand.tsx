import app from '@/lib/app';
import Image from 'next/image';
import useTheme from 'hooks/useTheme';
import { useSidebar } from '@/lib/components/ui/sidebar';

const Brand = () => {
  const { theme } = useTheme();
  const { state } = useSidebar();

  return (
    <div
      className={`flex items-center gap-2 ${state === 'expanded' ? 'px-2' : ''} py-1`}
    >
      <Image
        src={theme !== 'dark' ? app.logoUrl : '/logowhite.png'}
        alt={app.name}
        width={32}
        height={27}
        className="flex-shrink-0"
      />
      {state === 'expanded' && (
        <span className="text-lg font-bold text-sidebar-foreground truncate">
          {app.name}
        </span>
      )}
    </div>
  );
};

export default Brand;
