import { ReactNode, useState, useEffect, useRef } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar from './DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import ProfileSettings from './ProfileSettings';
import { supabase } from '@/integrations/supabase/client';
import NotificationSystem from '@/components/NotificationSystem';
import { useTranslation } from 'react-i18next';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { OnboardingTour } from './OnboardingTour';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut, user, subscriptionData } = useAuth();
  const { isOrgAdmin } = useUserRoles();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState('');
  const [firstName, setFirstName] = useState('');
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [runTour, setRunTour] = useState(false);

  // Check if user has completed organization onboarding
  useEffect(() => {
    const checkOrganization = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking organization:', error);
          setHasOrganization(false);
        } else {
          const hasOrg = !!data?.organization_id;
          setHasOrganization(hasOrg);

          // Redirect to onboarding if no organization
          if (!hasOrg) {
            
            navigate('/onboarding');
          }
        }
      } catch (error) {
        console.error('Error checking organization:', error);
        setHasOrganization(false);
      }
    };

    checkOrganization();
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setFirstName(data.first_name || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Ensure header is visible when scrolling to top
  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (!mainContent) return;

    const handleScroll = () => {
      // When scrolled to top, ensure header is visible
      if (mainContent.scrollTop === 0 && headerRef.current) {
        headerRef.current.style.visibility = 'visible';
        headerRef.current.style.opacity = '1';
      }
    };

    mainContent.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      mainContent.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleLockedFeatureClick = (feature: string) => {
    setLockedFeature(feature);
    setShowUpgradeModal(true);
  };

  const handleStartTour = () => {
    setRunTour(true);
  };

  const handleFinishTour = () => {
    setRunTour(false);
    // Save tour completion to localStorage
    if (user) {
      const checklistState = localStorage.getItem(`onboarding_checklist_${user.id}`);
      const state = checklistState ? JSON.parse(checklistState) : {};
      state.takeTour = true;
      localStorage.setItem(`onboarding_checklist_${user.id}`, JSON.stringify(state));
    }
  };

  const handleSkipTour = () => {
    setRunTour(false);
  };

  // Show loading while checking organization
  if (hasOrganization === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no organization, show nothing (will redirect to onboarding)
  if (hasOrganization === false) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar
          onLockedFeatureClick={handleLockedFeatureClick}
          subscriptionData={subscriptionData}
          onStartTour={handleStartTour}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header ref={headerRef} className="h-16 border-b border-l-0 bg-background flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 backdrop-blur-sm bg-background/95 transition-opacity">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-base md:text-lg font-semibold truncate">
                {t('welcomeBack')}{firstName && `, ${firstName}`}
              </h1>
              {subscriptionData.subscribed && (
                <Badge 
                  variant={isOrgAdmin && subscriptionData.subscription_tier === 'pro' ? 'default' : 'secondary'}
                  className="text-xs font-medium"
                >
                  {isOrgAdmin 
                    ? (subscriptionData.subscription_tier === 'pro' ? 'PRO' : 'STARTER')
                    : 'TEAM MEMBER'
                  }
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <NotificationSystem />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile')}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            </div>
          </header>

          {/* Announcement Bar */}
          <AnnouncementBar showOnDashboard={true} />

          {/* Main Content */}
          <main ref={mainContentRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {children}
          </main>
        </div>
      </div>


      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] sm:max-w-lg md:!max-w-[800px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Manage your personal information and account settings
            </DialogDescription>
          </DialogHeader>
          <ProfileSettings />
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] max-w-md overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {isOrgAdmin ? t('upgradeRequired') : 'Feature Restricted'}
            </DialogTitle>
            <DialogDescription>
              {isOrgAdmin 
                ? t('upgradeDescription', { feature: lockedFeature })
                : 'This feature is managed by your administrator'
              }
            </DialogDescription>
          </DialogHeader>
          {isOrgAdmin ? (
            <SubscriptionManagement />
          ) : (
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeModal(false)}
              >
                Go Back
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Onboarding Tour */}
      <OnboardingTour
        run={runTour}
        onFinish={handleFinishTour}
        onSkip={handleSkipTour}
      />
    </SidebarProvider>
  );
};

export default DashboardLayout;
