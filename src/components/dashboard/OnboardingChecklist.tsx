import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ChevronDown, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  path?: string;
  action?: () => void;
  adminOnly?: boolean;
}

interface OnboardingChecklistProps {
  onStartTour: () => void;
}

export const OnboardingChecklist = ({ onStartTour }: OnboardingChecklistProps) => {
  const { t } = useTranslation();
  const { isOrgAdmin } = useUserRoles();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load checklist completion state from localStorage
  const getChecklistState = () => {
    const saved = localStorage.getItem(`onboarding_checklist_${user?.id}`);
    return saved ? JSON.parse(saved) : {};
  };

  const saveChecklistState = (state: Record<string, boolean>) => {
    localStorage.setItem(`onboarding_checklist_${user?.id}`, JSON.stringify(state));
  };

  // Check various completion states
  useEffect(() => {
    const checkCompletionStates = async () => {
      if (!user) return;

      const savedState = getChecklistState();

      try {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', user.id)
          .single();

        const profileComplete = !!(profile?.first_name && profile?.last_name);

        // Check if team members exist (for admins)
        let teamMembersInvited = savedState.inviteTeam || false;
        if (isOrgAdmin) {
          const { data: orgData } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

          if (orgData?.organization_id) {
            const { count } = await supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .eq('organization_id', orgData.organization_id);

            teamMembersInvited = (count || 0) > 1;
          }
        }

        // Check if user has created a case
        const { data: cases } = await supabase
          .from('cases')
          .select('id')
          .limit(1);

        const caseCreated = (cases?.length || 0) > 0;

        // Check if branding is set up (for admins)
        let brandingComplete = savedState.setupBranding || false;
        if (isOrgAdmin) {
          const { data: orgData } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

          if (orgData?.organization_id) {
            const { data: org } = await supabase
              .from('organizations')
              .select('brand_color')
              .eq('id', orgData.organization_id)
              .single();

            brandingComplete = !!org?.brand_color;
          }
        }

        // Check if tour was completed
        const tourComplete = savedState.takeTour || false;

        // Build checklist items
        const checklistItems: ChecklistItem[] = [
          {
            id: 'completeProfile',
            title: t('checklist.completeProfile'),
            description: t('checklist.completeProfileDesc'),
            completed: profileComplete,
            path: undefined,
            action: () => {
              // Trigger profile modal - we'll need to add this
              document.querySelector<HTMLButtonElement>('[data-tour="profile-button"]')?.click();
            },
          },
          {
            id: 'createCase',
            title: t('checklist.createCase'),
            description: t('checklist.createCaseDesc'),
            completed: caseCreated,
            path: '/dashboard',
          },
          ...(isOrgAdmin ? [
            {
              id: 'inviteTeam',
              title: t('checklist.inviteTeam'),
              description: t('checklist.inviteTeamDesc'),
              completed: teamMembersInvited,
              path: '/dashboard/team',
              adminOnly: true,
            },
            {
              id: 'setupBranding',
              title: t('checklist.setupBranding'),
              description: t('checklist.setupBrandingDesc'),
              completed: brandingComplete,
              path: '/dashboard/settings',
              adminOnly: true,
            },
          ] : []),
          {
            id: 'takeTour',
            title: t('checklist.takeTour'),
            description: t('checklist.takeTourDesc'),
            completed: tourComplete,
            action: onStartTour,
          },
        ];

        setItems(checklistItems);
      } catch (error) {
        console.error('Error checking completion states:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCompletionStates();
  }, [user, isOrgAdmin, t, onStartTour]);

  const handleItemClick = (item: ChecklistItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
      setIsOpen(false);
    }
  };

  const handleToggleComplete = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setItems(newItems);

    // Save to localStorage
    const state = getChecklistState();
    state[itemId] = !items.find(i => i.id === itemId)?.completed;
    saveChecklistState(state);
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allComplete = completedCount === totalCount;

  // Auto-open on first visit if not all complete
  useEffect(() => {
    const hasSeenChecklist = localStorage.getItem(`onboarding_checklist_seen_${user?.id}`);
    if (!hasSeenChecklist && !loading && !allComplete) {
      setIsOpen(true);
      localStorage.setItem(`onboarding_checklist_seen_${user?.id}`, 'true');
    }
  }, [user, loading, allComplete]);

  if (loading) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} data-tour="checklist">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto hover:bg-accent/50"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span className="text-sm font-medium">
              {allComplete ? t('checklist.complete') : t('checklist.title')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-3">
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {allComplete
              ? t('checklist.allDone')
              : t('checklist.progress', { completed: completedCount, total: totalCount })
            }
          </p>
        </div>

        <div className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="w-full text-left p-2 rounded-md hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={(e) => handleToggleComplete(item.id, e)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    item.completed && "line-through text-muted-foreground"
                  )}>
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
