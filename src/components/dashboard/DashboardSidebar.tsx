import { Home, Bot, Users, Palette, Lock, BarChart3, ScrollText, Link as LinkIcon, MessageSquare, Info, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import disclosurelyFullLogo from '@/assets/logos/disclosurely-full-logo.png';
import LanguageSelector from '@/components/LanguageSelector';

interface DashboardSidebarProps {
  onLockedFeatureClick: (feature: string) => void;
}

const DashboardSidebar = ({
  onLockedFeatureClick
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { limits } = useSubscriptionLimits();

  const menuItems = [{
    title: t('dashboard'),
    icon: Home,
    path: '/dashboard',
    locked: false
  }, {
    title: t('aiCaseHelper'),
    icon: Bot,
    path: '/dashboard/ai-helper',
    locked: !limits.hasAIHelper
  }, {
    title: t('analytics'),
    icon: BarChart3,
    path: '/dashboard/analytics',
    locked: false
  }, {
    title: t('audit'),
    icon: ScrollText,
    path: '/dashboard/audit',
    locked: false
  }, {
    title: 'Secure Link',
    icon: LinkIcon,
    path: '/dashboard/secure-link',
    locked: false
  }, {
    title: t('team'),
    icon: Users,
    path: '/dashboard/team',
    locked: false
  }, {
    title: t('branding'),
    icon: Palette,
    path: '/dashboard/branding',
    locked: !limits.hasCustomBranding
  }];

  const handleNavigation = (item: typeof menuItems[0]) => {
    if (item.locked) {
      onLockedFeatureClick(item.title);
    } else {
      navigate(item.path);
    }
  };

  return (
    <Sidebar className="border-r border-b-0">
      <SidebarHeader className="p-4 border-b">
        <button onClick={() => navigate('/dashboard')} className="flex items-center w-full hover:opacity-80 transition-opacity gap-3">
          <img src={disclosurelyFullLogo} alt="Disclosurely" className="h-7 w-auto" />
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => {
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

      <SidebarFooter className="p-2 border-t space-y-2">
        {/* Footer links above the line */}
        <div className="space-y-1">
          <a 
            href="https://disclosurely.featurebase.app" 
            target="_blank" 
            rel="noopener noreferrer"
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
          
          <LanguageSelector collapsed={false} />
        </div>
        
        {/* Separator line */}
        <Separator />
        
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