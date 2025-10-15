import { ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar from './DashboardSidebar';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { supabase } from '@/integrations/supabase/client';
import NotificationSystem from '@/components/NotificationSystem';
import { useTranslation } from 'react-i18next';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState('');
  const [firstName, setFirstName] = useState('');

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

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleLockedFeatureClick = (feature: string) => {
    setLockedFeature(feature);
    setShowUpgradeModal(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar onLockedFeatureClick={handleLockedFeatureClick} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-base md:text-lg font-semibold truncate">
                {t('welcomeBack')}{firstName && `, ${firstName}`}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationSystem />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/settings')}
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

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('upgradeRequired')}</DialogTitle>
            <DialogDescription>
              {t('upgradeDescription', { feature: lockedFeature })}
            </DialogDescription>
          </DialogHeader>
          <SubscriptionManagement />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DashboardLayout;
