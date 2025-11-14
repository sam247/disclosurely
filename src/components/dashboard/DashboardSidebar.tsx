import React, { useState, useEffect } from 'react';
import { Home, Bot, Users, Palette, Lock, BarChart3, ScrollText, Link as LinkIcon, MessageSquare, Info, FileText, Zap, Settings, Shield, Workflow, Flag, Activity, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import disclosurelyFullLogo from '@/assets/logos/disclosurely-full-logo.png';
import LanguageSelector from '@/components/LanguageSelector';

interface DashboardSidebarProps {
  onLockedFeatureClick: (feature: string) => void;
  subscriptionData?: {
    subscribed: boolean;
    subscription_tier?: 'basic' | 'pro';
  };
}

const DashboardSidebar = ({
  onLockedFeatureClick,
  subscriptionData
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { limits } = useSubscriptionLimits();
  const { isOrgAdmin, isCaseHandler } = useUserRoles();
  const { user } = useAuth();
  
  // STRICT OWNER CHECK - Only sampettiford@googlemail.com
  // This check is done here AND in the component itself for absolute security
  const isOwner = user?.email === 'sampettiford@googlemail.com';

  const menuItems = [{
    title: t('dashboard'),
    icon: Home,
    path: '/dashboard',
    locked: false,
    ownerOnly: false
  }, {
    title: t('aiCaseHelper'),
    icon: Bot,
    path: '/dashboard/ai-helper',
    locked: !limits.hasAIHelper || !isOrgAdmin,
    ownerOnly: false
  }, {
    title: t('analytics'),
    icon: BarChart3,
    path: '/dashboard/analytics',
    locked: !isOrgAdmin,
    ownerOnly: false
  }, {
    title: 'Workflows',
    icon: Workflow,
    path: '/dashboard/workflows',
    locked: !isOrgAdmin,
    badge: 'NEW',
    ownerOnly: false
  }, {
    title: t('audit'),
    icon: ScrollText,
    path: '/dashboard/audit',
    locked: !isOrgAdmin,
    ownerOnly: false
  }, {
    title: 'Secure Link',
    icon: LinkIcon,
    path: '/dashboard/secure-link',
    locked: false,
    ownerOnly: false
  }, {
    title: t('team'),
    icon: Users,
    path: '/dashboard/team',
    locked: !isOrgAdmin,
    ownerOnly: false
  }, {
    title: 'Integrations',
    icon: Zap,
    path: '/dashboard/integrations',
    locked: !isOrgAdmin,
    ownerOnly: false
  }, {
    title: 'Settings',
    icon: Settings,
    path: '/dashboard/settings',
    locked: !isOrgAdmin,
    ownerOnly: false
  }, {
    title: 'Admin',
    icon: Shield,
    path: '/dashboard/admin',
    locked: false,
    ownerOnly: true, // STRICT: Only visible to owner
    hasSubMenu: true
  }];

  const adminSubMenuItems = [
    {
      title: 'Feature Flags',
      icon: Flag,
      path: '/dashboard/admin/features'
    },
    {
      title: 'Chat Support',
      icon: MessageSquare,
      path: '/dashboard/admin/chat'
    },
    {
      title: 'System Health',
      icon: Activity,
      path: '/dashboard/admin/health'
    }
  ];

  const handleNavigation = (item: typeof menuItems[0]) => {
    if (item.locked) {
      onLockedFeatureClick(item.title);
    } else {
      navigate(item.path);
    }
  };

  // Track admin menu open state
  const isAdminOpen = location.pathname.startsWith('/dashboard/admin');
  const [adminMenuOpen, setAdminMenuOpen] = useState(isAdminOpen);
  
  // Sync admin menu state with route
  useEffect(() => {
    setAdminMenuOpen(location.pathname.startsWith('/dashboard/admin'));
  }, [location.pathname]);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center w-full hover:opacity-80 transition-opacity gap-3">
          <img src={disclosurelyFullLogo} alt="Disclosurely" className="h-7 w-auto" />
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => {
                // STRICT OWNER CHECK: Hide owner-only items from non-owners
                if (item.ownerOnly && !isOwner) {
                  return null;
                }
                
                const isActive = location.pathname === item.path || (item.hasSubMenu && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                const isAdminItem = item.path === '/dashboard/admin';
                
                // Handle Admin with sub-menu
                if (isAdminItem && item.hasSubMenu) {
                  return (
                    <Collapsible key={item.path} open={adminMenuOpen} onOpenChange={setAdminMenuOpen}>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          onClick={() => {
                            // Navigate to first admin sub-item (features) if not already on admin page
                            if (!location.pathname.startsWith('/dashboard/admin')) {
                              navigate('/dashboard/admin/features');
                            } else {
                              // Toggle menu if already on admin page
                              setAdminMenuOpen(!adminMenuOpen);
                            }
                          }}
                          className={cn(
                            "w-full justify-start transition-colors px-4 cursor-pointer", 
                            isActive && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Icon className="flex-shrink-0 text-primary h-5 w-5" />
                            <span className="flex-1">{item.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdminMenuOpen(!adminMenuOpen);
                              }}
                              className="p-0.5 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
                              aria-label="Toggle admin menu"
                            >
                              <ChevronRight className={cn(
                                "h-4 w-4 transition-transform",
                                adminMenuOpen && "rotate-90"
                              )} />
                            </button>
                          </div>
                        </SidebarMenuButton>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {adminSubMenuItems.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = location.pathname === subItem.path;
                              return (
                                <SidebarMenuSubItem key={subItem.path}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                  >
                                    <a
                                      href={subItem.path}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        navigate(subItem.path);
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <SubIcon className="h-4 w-4" />
                                      <span>{subItem.title}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                
                // Regular menu items
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      onClick={() => handleNavigation(item)} 
                      className={cn(
                        "w-full justify-start transition-colors px-4", 
                        isActive && "bg-primary/10 text-primary font-medium", 
                        item.locked && "opacity-60 hover:opacity-80"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="flex-shrink-0 text-primary h-5 w-5" />
                        <span className="flex-1">{item.title}</span>
                        {'badge' in item && item.badge && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-blue-600 text-white">
                            {item.badge}
                          </Badge>
                        )}
                        {item.locked && <Lock className="h-3 w-3 opacity-40" />}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 space-y-2">
        {/* Language Selector above the separator line */}
        <LanguageSelector collapsed={false} />
        
        {/* Separator line */}
        <Separator />
        
        {/* Footer links below the line */}
        <div className="space-y-1">
          <a 
            href="mailto:support@disclosurely.com?subject=Feedback" 
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </a>
          
          <button 
            onClick={() => navigate('/about')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md w-full text-left"
          >
            <Info className="h-4 w-4" />
            About Disclosurely
          </button>
        </div>
        
        {/* Privacy and Terms below the separator */}
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/privacy')}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <span>•</span>
            <button 
              onClick={() => navigate('/terms')}
              className="hover:text-foreground transition-colors"
            >
              Terms
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;