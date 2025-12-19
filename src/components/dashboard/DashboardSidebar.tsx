import React from 'react';
import { Home, Bot, Users, Palette, Lock, BarChart3, ScrollText, Link as LinkIcon, MessageSquare, Info, FileText, Zap, Settings, Workflow, Search, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
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
  const { isOrgAdmin, isCaseHandler, roles, isAdmin } = useUserRoles();
  const { user } = useAuth();
  
  // Admin/owner visibility now allows system admins or org admins
  // This check is mirrored in route guards and the admin panel itself
  const isOwner = isAdmin || isOrgAdmin;
  
  // Check if user is a case handler (has case_handler role)
  // System admins bypass case handler restrictions
  const hasCaseHandlerRole = roles.includes('case_handler');
  const shouldRestrictCaseHandler = hasCaseHandlerRole && !isAdmin;

  const menuItems = [{
    title: t('dashboard'),
    icon: Home,
    path: '/dashboard',
    locked: false,
    ownerOnly: false,
    caseHandlerVisible: true // Case handlers can see dashboard
  }, {
    title: 'AI Assistant',
    icon: Sparkles,
    path: '/dashboard/ai-assistant',
    locked: !limits.hasAIHelper, // Allow case handlers to access AI Assistant
    ownerOnly: false,
    caseHandlerVisible: true // Case handlers can see AI Assistant
  }, {
    title: t('analytics'),
    icon: BarChart3,
    path: '/dashboard/analytics',
    locked: !isOrgAdmin,
    ownerOnly: false,
    caseHandlerVisible: false // Case handlers cannot see analytics
  }, {
    title: t('sidebar.workflows'),
    icon: Workflow,
    path: '/dashboard/workflows',
    locked: !isOrgAdmin,
    badge: 'NEW',
    ownerOnly: false,
    caseHandlerVisible: false // Case handlers cannot see workflows
  }, {
    title: t('audit'),
    icon: ScrollText,
    path: '/dashboard/audit',
    locked: !isOrgAdmin,
    ownerOnly: false,
    caseHandlerVisible: false // Case handlers cannot see audit
  }, {
    title: t('sidebar.secureLink'),
    icon: LinkIcon,
    path: '/dashboard/secure-link',
    locked: false,
    ownerOnly: false,
    caseHandlerVisible: false // Case handlers cannot see secure links
  }, {
    title: t('team'),
    icon: Users,
    path: '/dashboard/team',
    locked: !isOrgAdmin,
    ownerOnly: false,
    caseHandlerVisible: false // Case handlers cannot see team
  }, {
    title: t('sidebar.integrations'),
    icon: Zap,
    path: '/dashboard/integrations',
    locked: !isOrgAdmin,
    ownerOnly: false,
    caseHandlerVisible: false // Case handlers cannot see integrations
  }, {
    title: t('sidebar.settings'),
    icon: Settings,
    path: '/dashboard/settings',
    locked: !isOrgAdmin,
    ownerOnly: false,
    caseHandlerVisible: false // Case handlers cannot see settings
  }];

  const handleNavigation = (item: typeof menuItems[0]) => {
    if (item.locked) {
      onLockedFeatureClick(item.title);
    } else {
      navigate(item.path);
    }
  };


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
                
                // Hide restricted items from case handlers (only show Dashboard and AI Assistant)
                // Apply restrictions if user has case_handler role (unless they're a system admin)
                if (shouldRestrictCaseHandler && !item.caseHandlerVisible) {
                  return null;
                }
                
                // AI Assistant combines both RAG search and deep-dive analysis
                // Don't hide it even if locked - let the click handler show upgrade modal
                
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
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
            <span>�</span>
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