import { Home, Bot, Users, Palette, Lock, BarChart3, ScrollText } from 'lucide-react';
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { cn } from '@/lib/utils';
import disclosurelyFullLogo from '@/assets/logos/disclosurely-full-logo.png';
import disclosurelyIcon from '@/assets/logos/disclosurely-icon-square.png';

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
      title: 'Analytics',
      icon: BarChart3,
      path: '/dashboard/analytics',
      locked: false,
    },
    {
      title: 'Audit',
      icon: ScrollText,
      path: '/dashboard/audit',
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
    <Sidebar 
      className="border-r"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b">
        <button 
          onClick={() => navigate('/dashboard')}
          className={cn(
            "flex items-center w-full hover:opacity-80 transition-opacity",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          {!collapsed ? (
            <img 
              src={disclosurelyFullLogo} 
              alt="Disclosurely" 
              className="h-6 w-auto"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center py-2">
              <img 
                src={disclosurelyIcon} 
                alt="Disclosurely" 
                className="h-10 w-10 object-contain"
              />
            </div>
          )}
        </button>
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
        <SidebarTrigger className={cn("w-full", !collapsed && "justify-start")} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
