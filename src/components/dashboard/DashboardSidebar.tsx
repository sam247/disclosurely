import { Home, Bot, Settings, Users, Palette, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  onLockedFeatureClick: (feature: string) => void;
}

const DashboardSidebar = ({ onLockedFeatureClick }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { limits } = useSubscriptionLimits();
  const collapsed = state === 'collapsed';

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      locked: false,
    },
    {
      title: 'AI Case Helper',
      icon: Bot,
      path: '/dashboard/ai-helper',
      locked: !limits.hasAIHelper,
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      locked: false,
    },
    {
      title: 'Team',
      icon: Users,
      path: '/dashboard/team',
      locked: false,
    },
    {
      title: 'Branding',
      icon: Palette,
      path: '/dashboard/branding',
      locked: !limits.hasCustomBranding,
    },
  ];

  const handleNavigation = (item: typeof menuItems[0]) => {
    if (item.locked) {
      onLockedFeatureClick(item.title);
    } else {
      navigate(item.path);
    }
  };

  return (
    <Sidebar className={cn("border-r", collapsed ? "w-14" : "w-60")}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item)}
                      className={cn(
                        "w-full justify-start transition-colors",
                        isActive && "bg-accent text-accent-foreground font-medium",
                        item.locked && "opacity-60 hover:opacity-80"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="flex-1">{item.title}</span>
                        )}
                        {item.locked && !collapsed && (
                          <Lock className="h-3 w-3 opacity-60" />
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
