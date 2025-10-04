import { Home, Bot, Users, Palette, Lock, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
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
    <Sidebar className={cn("border-r", collapsed ? "w-16" : "w-60")}>
      <SidebarHeader className="p-4 border-b">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          {!collapsed ? (
            <>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                D
              </div>
              <span className="font-semibold text-lg">Disclosurely</span>
            </>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              D
            </div>
          )}
        </div>
      </SidebarHeader>

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
                        isActive && "bg-primary/10 text-primary font-medium",
                        item.locked && "opacity-60 hover:opacity-80",
                        !collapsed && "px-4"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className={cn(
                          "flex-shrink-0 text-primary",
                          collapsed ? "h-5 w-5" : "h-5 w-5"
                        )} />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.locked && (
                              <Lock className="h-3 w-3 opacity-40" />
                            )}
                          </>
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

      <SidebarFooter className="p-2 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate('/dashboard/settings')}
              className={cn(
                "w-full justify-start transition-colors",
                location.pathname === '/dashboard/settings' && "bg-primary/10 text-primary font-medium",
                !collapsed && "px-4"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <User className={cn(
                  "flex-shrink-0 text-primary",
                  collapsed ? "h-5 w-5" : "h-5 w-5"
                )} />
                {!collapsed && <span className="flex-1">Profile</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
