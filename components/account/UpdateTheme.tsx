import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/lib/components/ui/dropdown-menu';
import useTheme from 'hooks/useTheme';
import { useTranslations } from 'next-intl';

const UpdateTheme = () => {
  const { setTheme, themes, selectedTheme, applyTheme } = useTheme();
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('theme')}</CardTitle>
        <CardDescription>{t('change-theme')}</CardDescription>
      </CardHeader>
      <CardContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold w-60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <div className="flex items-center gap-2">
                <selectedTheme.icon className="w-5 h-5" /> {selectedTheme.name}
              </div>
              <ChevronUpDownIcon className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60">
            {themes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  applyTheme(theme.id);
                  setTheme(theme.id);
                }}
              >
                <theme.icon className="w-4 h-4" />
                {theme.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
};

export default UpdateTheme;
