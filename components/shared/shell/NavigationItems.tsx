import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/lib/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/lib/components/ui/sidebar';

export interface MenuItem {
  name: string;
  href: string;
  icon?: any;
  active?: boolean;
  items?: Omit<MenuItem, 'icon' | 'items'>[];
  className?: string;
}

export interface NavigationProps {
  activePathname: string | null;
}

interface NavigationItemsProps {
  menus: MenuItem[];
  title?: string;
}

const NavigationItems = ({ menus, title }: NavigationItemsProps) => {
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {menus.map((menu) => (
          <Collapsible
            key={menu.name}
            asChild
            defaultOpen={menu.active}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {menu.items && menu.items.length > 0 ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={menu.name}>
                      {menu.icon && <menu.icon />}
                      <span>{menu.name}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {menu.items.map((subitem) => (
                        <SidebarMenuSubItem key={subitem.name}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subitem.active}
                          >
                            <Link href={subitem.href}>
                              <span>{subitem.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={menu.active}
                  tooltip={menu.name}
                >
                  <Link href={menu.href}>
                    {menu.icon && <menu.icon />}
                    <span>{menu.name}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default NavigationItems;
