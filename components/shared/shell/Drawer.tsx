import React from 'react';
import Brand from './Brand';
import Navigation from './Navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from '@/lib/components/ui/sidebar';

const Drawer = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-14 border-sidebar-border">
        <Brand />
      </SidebarHeader>
      <SidebarContent>
        <Navigation />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};

export default Drawer;
