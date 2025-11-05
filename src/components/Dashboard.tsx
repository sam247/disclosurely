import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { LogOut, ExternalLink, FileText, Eye, Archive, Trash2, Settings, RotateCcw, MoreVertical, Bot, Search, User, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReportMessaging from '@/components/ReportMessaging';
import ReportContentDisplay from '@/components/ReportContentDisplay';
import ReportAttachments from '@/components/ReportAttachments';
import OrganizationSettings from '@/components/OrganizationSettings';
import SettingsPanel from '@/components/SettingsPanel';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AICaseHelper from '@/components/AICaseHelper';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import SubscriptionPromptModal from '@/components/SubscriptionPromptModal';
import TrialPromptModal from '@/components/TrialPromptModal';
import type { Report as DatabaseReport } from '@/types/database';
import { auditLogger } from '@/utils/auditLogger';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: 'new' | 'in_review' | 'reviewing' | 'investigating' | 'resolved' | 'closed' | 'live' | 'archived' | 'deleted';
  created_at: string;
  encrypted_content: string;
  encryption_key_hash: string;
  priority: number;
  report_type: string;
  tags?: string[];
  first_read_at?: string;
  closed_at?: string;
  archived_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  organizations?: {
    name: string;
  };
  submitted_by_email?: string;
}

interface SubmissionLink {
  id: string;
  name: string;
  link_token: string;
  usage_count: number;
}

interface DomainVerification {
  id: string;
  domain_name: string;
  is_active: boolean;
  is_primary: boolean;
  status: string;
}

const Dashboard = () => {
  const { user, signOut, subscriptionData, subscriptionLoading, refreshSubscription } = useAuth();
  const { isOrgAdmin, loading: rolesLoading } = useUserRoles();
  const { customDomain, organizationId, isCustomDomain, refreshDomainInfo } = useCustomDomain();
  const { limits, hasAnySubscription, isAtCaseLimit } = useSubscriptionLimits();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [archivedReports, setArchivedReports] = useState<Report[]>([]);
  const [links, setLinks] = useState<SubmissionLink[]>([]);
  const [subdomains, setSubdomains] = useState<DomainVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [hasShownSubscriptionModal, setHasShownSubscriptionModal] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [selectedReportForAI, setSelectedReportForAI] = useState<Report | null>(null);
  const [firstName, setFirstName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [sortField, setSortField] = useState<'created_at' | 'title' | 'tracking_id'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [reportCategories, setReportCategories] = useState<Record<string, string>>({});

  // Secure category extraction with rate limiting
  const decryptReportCategory = async (report: Report): Promise<string> => {
    try {
      if (!user) return 'Unknown';
      
      // Get user's organization ID
      let orgId = organizationId;
      if (!orgId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        
        if (!profile?.organization_id) return 'Unknown';
        orgId = profile.organization_id;
      }
      
      // Import the secure category-only decryption utility
      const { decryptReportCategory } = await import('@/utils/encryption');
      
      // Extract only the category field
      const category = decryptReportCategory(report.encrypted_content, orgId);
      
      return category || 'General';
    } catch (error) {
      // Silent fallback - no logging for security
      return report.report_type?.charAt(0).toUpperCase() + report.report_type?.slice(1) || 'Unknown';
    }
  };

  // Rate-limited secure category decryption
  useEffect(() => {
    const decryptCategories = async () => {
      if (!reports.length || !user) return;
      
      const categories: Record<string, string> = {};
      const batchSize = 5; // Process in smaller batches for security
      
      // Process reports in rate-limited batches
      for (let i = 0; i < reports.length; i += batchSize) {
        const batch = reports.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (report) => {
          if (!reportCategories[report.id]) {
            categories[report.id] = await decryptReportCategory(report);
          }
        }));
        
        // Rate limiting: 100ms delay between batches
        if (i + batchSize < reports.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (Object.keys(categories).length > 0) {
        setReportCategories(prev => ({ ...prev, ...categories }));
        
        // Clear categories from memory after a delay for security
        setTimeout(() => {
          // This doesn't actually clear React state but signals cleanup intent
          console.debug('Category processing completed');
        }, 5000);
      }
    };

    // Delayed execution with timeout
    const timeoutId = setTimeout(decryptCategories, 1000);
    return () => clearTimeout(timeoutId);
  }, [reports, user]);

  // Fetch user's first name for welcome message
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

  // Refetch reports when user roles are loaded (for proper filtering)
  useEffect(() => {
    console.log('useEffect triggered - rolesLoading:', rolesLoading, 'isOrgAdmin:', isOrgAdmin, 'user:', !!user);
    if (!rolesLoading && user) {
      console.log('User roles loaded, refetching reports with isOrgAdmin:', isOrgAdmin);
      fetchData();
    }
  }, [rolesLoading, isOrgAdmin, user]);

  // Also decrypt categories for archived reports
  useEffect(() => {
    const decryptArchivedCategories = async () => {
      if (!archivedReports.length || !user) return;
      
      const categories: Record<string, string> = {};
      
      for (const report of archivedReports) {
        if (!reportCategories[report.id]) {
          categories[report.id] = await decryptReportCategory(report);
        }
      }
      
      if (Object.keys(categories).length > 0) {
        setReportCategories(prev => ({ ...prev, ...categories }));
      }
    };

    const timeoutId = setTimeout(() => {
      decryptArchivedCategories();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [archivedReports, user]);

  // Function to get category for display
  const getReportCategory = (report: Report): string => {
    const category = reportCategories[report.id];
    if (category) return category;
    
    // Show a more specific loading state or fallback
    if (reportCategories[report.id] === undefined && reports.length > 0) {
      // Quick fallback - try to parse from title for common keywords while decryption loads
      const title = report.title.toLowerCase();
      if (title.includes('corrupt')) return 'Corruption (pending verification)';
      if (title.includes('fraud')) return 'Fraud (pending verification)';
      if (title.includes('harassment')) return 'Harassment (pending verification)';
      if (title.includes('discrimination')) return 'Discrimination (pending verification)';
      if (title.includes('safety')) return 'Safety (pending verification)';
      
      return 'Loading...';
    }
    
    // Fallback to report type if available
    return report.report_type?.charAt(0).toUpperCase() + report.report_type?.slice(1) || 'Unknown';
  };

  console.log('Dashboard - Current subscription data:', subscriptionData);

  // Check for successful subscription return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      setIsCheckingSubscription(true);
      toast({
        title: "Welcome back!",
        description: "Checking your subscription status...",
      });
      
      // Remove the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      
      // Wait a moment for Stripe to process, then refresh multiple times if needed
      const checkSubscription = async (attempt = 1) => {
        try {
          await refreshSubscription();
          
          // Check if subscription is now active after 2 seconds
          setTimeout(() => {
            if (!subscriptionData.subscribed && attempt < 5) {
              console.log(`Subscription check attempt ${attempt + 1}`);
              checkSubscription(attempt + 1);
            } else {
              setIsCheckingSubscription(false);
              if (subscriptionData.subscribed) {
                toast({
                  title: "Subscription Active!",
                  description: "Your subscription has been successfully activated.",
                });
              } else {
                toast({
                  title: "Please wait",
                  description: "Your subscription is still being processed. Please refresh in a moment.",
                  variant: "default",
                });
              }
            }
          }, 2000);
        } catch (error) {
          console.error('Error checking subscription:', error);
          if (attempt < 5) {
            setTimeout(() => checkSubscription(attempt + 1), 3000);
          } else {
            setIsCheckingSubscription(false);
            toast({
              title: "Subscription Check",
              description: "Please refresh the page if your subscription status hasn't updated.",
              variant: "default",
            });
          }
        }
      };
      
      // Start checking after 2 seconds to allow Stripe processing time
      setTimeout(() => checkSubscription(), 2000);
    }
  }, [refreshSubscription, toast]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Show subscription modal for new unsubscribed users (but not if just returned from Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    
    console.log('Checking if should show subscription modal:', {
      user: !!user,
      loading,
      subscriptionLoading,
      hasShownSubscriptionModal,
      subscribed: subscriptionData.subscribed,
      subscriptionStatus,
      isCheckingSubscription
    });
    
    // Only check after both auth loading and subscription loading are complete
    if (user && !loading && !subscriptionLoading && !hasShownSubscriptionModal && !hasAnySubscription() && !subscriptionStatus && !isCheckingSubscription) {
      // Show trial modal after a short delay to allow dashboard to load
      const timer = setTimeout(() => {
        console.log('Showing trial modal for user without subscription');
        setShowTrialModal(true);
        setHasShownSubscriptionModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, subscriptionLoading, hasShownSubscriptionModal, subscriptionData.subscribed, isCheckingSubscription]);

  useEffect(() => {
    if (user && !loading) {
      fetchData();
    }
  }, [customDomain, isCustomDomain]);

  // Listen for domain updates
  useEffect(() => {
    const handleDomainUpdate = () => {
      if (refreshDomainInfo) {
        refreshDomainInfo();
      }
      fetchData();
    };

    window.addEventListener('domain-updated', handleDomainUpdate);
    return () => window.removeEventListener('domain-updated', handleDomainUpdate);
  }, [refreshDomainInfo]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Get user's profile and organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      // Fetch active reports - filter by assignment for team members
      let reportsQuery = supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, assigned_to')
        .eq('organization_id', profile.organization_id)
        .neq('status', 'closed')
        .order('created_at', { ascending: false })
        .limit(20);

      // If user is not org admin, only show reports assigned to them
      console.log('isOrgAdmin value:', isOrgAdmin, 'type:', typeof isOrgAdmin);
      console.log('rolesLoading:', rolesLoading);
      
      // Fallback: if roles are still loading or isOrgAdmin is undefined, assume team member
      const shouldFilter = !isOrgAdmin || rolesLoading || isOrgAdmin === undefined;
      
      if (shouldFilter) {
        console.log('Filtering reports for team member:', user.id);
        reportsQuery = reportsQuery.eq('assigned_to', user.id);
      } else {
        console.log('Showing all reports for org admin');
      }

      const { data: reportsData, error: reportsError } = await reportsQuery;

      console.log('Reports query executed, results:', reportsData?.length || 0);
      console.log('Query was filtered for team member:', shouldFilter);

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
      }

      // Fetch archived reports - filter by assignment for team members
      let archivedQuery = supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, assigned_to')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'closed')
        .order('created_at', { ascending: false })
        .limit(20);

      // If user is not org admin, only show reports assigned to them
      console.log('Archived reports - isOrgAdmin value:', isOrgAdmin, 'type:', typeof isOrgAdmin);
      
      // Fallback: if roles are still loading or isOrgAdmin is undefined, assume team member
      const shouldFilterArchived = !isOrgAdmin || rolesLoading || isOrgAdmin === undefined;
      
      if (shouldFilterArchived) {
        console.log('Filtering archived reports for team member:', user.id);
        archivedQuery = archivedQuery.eq('assigned_to', user.id);
      } else {
        console.log('Showing all archived reports for org admin');
      }

      const { data: archivedData, error: archivedError } = await archivedQuery;

      if (archivedError) {
        console.error('Error fetching archived reports:', archivedError);
      }

      // Fetch the single organization link (simplified to one link per org)
      const { data: linksData } = await supabase
        .from('organization_links')
        .select('id, name, link_token, usage_count')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .limit(1);

      // Fetch custom domains for this organization
      const { data: customDomainsData } = await supabase
        .from('custom_domains')
        .select('id, domain_name, is_active, is_primary, status')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .eq('status', 'active');

      // Fetch team members for assignment
      const { data: teamData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true);

      console.log('About to set reports:', reportsData?.length || 0, 'archived:', archivedData?.length || 0);
      setReports(reportsData || []);
      setArchivedReports(archivedData || []);
      setLinks(linksData || []);
      setSubdomains(customDomainsData || []);
      setTeamMembers(teamData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
  };

  const handleArchiveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report archived",
        description: "The report has been moved to archived status",
      });

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (error) {
      console.error('Error archiving report:', error);
      toast({
        title: "Error",
        description: "Failed to archive report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnarchiveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'new',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report unarchived",
        description: "The report has been moved back to active status",
      });

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      setArchivedReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (error) {
      console.error('Error unarchiving report:', error);
      toast({
        title: "Error",
        description: "Failed to unarchive report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase.functions.invoke('soft-delete-report', {
        body: { reportId },
      });

      if (error) throw error;

      toast({
        title: "Report deleted",
        description: "The report has been moved to deleted status",
      });

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      // Remove from current view
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      setArchivedReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (reportId: string) => {
    try {
      // Get report details for audit log
      const report = reports.find(r => r.id === reportId);
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'new',
          first_read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .eq('status', 'new');

      if (error) throw error;

      // Log the status change
      if (user && profile?.organization_id && report) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'mark_as_read',
          severity: 'low',
          actorType: 'user',
          actorId: user.id,
          actorEmail: user.email,
          organizationId: profile.organization_id,
          targetType: 'case',
          targetId: reportId,
          targetName: report.title,
          summary: `Case marked as read: ${report.title}`,
          beforeState: { status: 'new' },
          afterState: { status: 'new', first_read_at: new Date().toISOString() }
        });
      }

      toast({
        title: "Report marked as read",
        description: "The report status has been updated to new",
      });

      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error marking report as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark report as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseReport = async (reportId: string) => {
    try {
      // Get report details for audit log
      const report = reports.find(r => r.id === reportId) || archivedReports.find(r => r.id === reportId);
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log the status change
      if (user && profile?.organization_id && report) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'close',
          severity: 'medium',
          actorType: 'user',
          actorId: user.id,
          actorEmail: user.email,
          organizationId: profile.organization_id,
          targetType: 'case',
          targetId: reportId,
          targetName: report.title,
          summary: `Case closed: ${report.title}`,
          beforeState: { status: report.status },
          afterState: { status: 'closed' }
        });
      }

      toast({
        title: "Report closed",
        description: "The case has been closed successfully",
      });

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error closing report:', error);
      toast({
        title: "Error",
        description: "Failed to close report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReopenReport = async (reportId: string) => {
    try {
      // Get report details for audit log
      const report = reports.find(r => r.id === reportId) || archivedReports.find(r => r.id === reportId);
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'new',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log the status change
      if (user && profile?.organization_id && report) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'reopen',
          severity: 'medium',
          actorType: 'user',
          actorId: user.id,
          actorEmail: user.email,
          organizationId: profile.organization_id,
          targetType: 'case',
          targetId: reportId,
          targetName: report.title,
          summary: `Case reopened: ${report.title}`,
          beforeState: { status: report.status },
          afterState: { status: 'new' }
        });
      }

      toast({
        title: "Report reopened",
        description: "The case has been reopened successfully",
      });

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error reopening report:', error);
      toast({
        title: "Error",
        description: "Failed to reopen report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRestoreReport = async (reportId: string) => {
    try {
      // Get report details for audit log
      const report = reports.find(r => r.id === reportId) || archivedReports.find(r => r.id === reportId);
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'new',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log the status change
      if (user && profile?.organization_id && report) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'restore',
          severity: 'medium',
          actorType: 'user',
          actorId: user.id,
          actorEmail: user.email,
          organizationId: profile.organization_id,
          targetType: 'case',
          targetId: reportId,
          targetName: report.title,
          summary: `Case restored: ${report.title}`,
          beforeState: { status: report.status },
          afterState: { status: 'new' }
        });
      }

      toast({
        title: "Report restored",
        description: "The report has been restored successfully",
      });

      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error restoring report:', error);
      toast({
        title: "Error",
        description: "Failed to restore report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyLink = (token: string) => {
    // Always use secure.disclosurely.com for default (never app.disclosurely.com)
    const link = `https://secure.disclosurely.com/secure/tool/submit/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The submission link has been copied to your clipboard.",
    });
  };

  const copySubdomainLink = (domain: string) => {
    const link = `https://${domain}/secure/tool/submit`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Subdomain link copied!",
      description: "The branded submission link has been copied to your clipboard.",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Filter and sort reports
  const filteredReports = (reportsList: Report[]) => {
    let filtered = reportsList.filter(report => {
      const matchesSearch = searchTerm === '' || 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'tracking_id':
          aValue = a.tracking_id;
          bValue = b.tracking_id;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderReportsTable = (reportsList: Report[], isArchived = false) => {
    const filtered = filteredReports(reportsList);
    
    return (
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title or tracking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewing">In Review</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[14%]">
                  <button
                    onClick={() => handleSort('tracking_id')}
                    className="flex items-center hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Tracking ID
                    {sortField === 'tracking_id' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-[20%]">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Title
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-[11%] whitespace-nowrap">Status</TableHead>
                <TableHead className="w-[13%] whitespace-nowrap">Category</TableHead>
                <TableHead className="w-[12%] whitespace-nowrap">Assigned To</TableHead>
                <TableHead className="w-[12%]">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Submitted Date
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-[18%] text-center">Report Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {!isOrgAdmin ? (
                      <div className="space-y-2">
                        <div className="text-lg font-medium text-gray-700">Awaiting a Case</div>
                        <div className="text-sm text-gray-500">
                          When a case is assigned to you it will appear here
                        </div>
                      </div>
                    ) : (
                      `No ${isArchived ? 'archived ' : ''}reports found`
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports(reportsList).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-sm">{report.tracking_id}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <div>
                        <div className="font-medium">{report.title}</div>
                        {report.tags && report.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {report.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>
                        {formatStatus(report.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {getReportCategory(report)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400 text-sm">Unassigned</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReport(report)}
                          className="text-xs"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {report.status === 'closed' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReopenReport(report.id)}
                            className="text-xs"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reopen
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCloseReport(report.id)}
                            className="text-xs"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Close
                          </Button>
                        )}
                        {isArchived ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnarchiveReport(report.id)}
                            className="text-xs"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Unarchive
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleArchiveReport(report.id)}
                            className="text-xs"
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            Archive
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this case?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the case 
                                "{report.title}" and all associated messages and attachments.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteReport(report.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Case
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderReportsList = (reportsList: Report[], isArchived = false) => (
    reportsList.length === 0 ? (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No {isArchived ? 'archived ' : ''}reports found</p>
        <p className="text-sm text-gray-500">
          {isArchived ? 'Archived reports will appear here' : 'Reports will appear here once submitted through your link'}
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {reportsList.map((report) => (
          <div key={report.id} className="border rounded-lg hover:bg-gray-50 transition-colors">
            {/* Mobile Layout */}
            <div className="block md:hidden p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{report.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {report.tracking_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                  report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  report.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  report.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewReport(report)}
                  className="flex-1 min-w-0"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="px-2">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isArchived ? (
                      <DropdownMenuItem onClick={() => handleUnarchiveReport(report.id)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Unarchive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleArchiveReport(report.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the report 
                            and all associated messages.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteReport(report.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Report
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between p-4">
              <div className="flex-1">
                <h3 className="font-medium">{report.title}</h3>
                <p className="text-sm text-gray-600">
                  {report.tracking_id} • {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  report.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  report.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.status.replace('_', ' ')}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewReport(report)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {isArchived ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUnarchiveReport(report.id)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Unarchive
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleArchiveReport(report.id)}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the report 
                        and all associated messages.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteReport(report.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Report
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
               <img 
                 src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" 
                 alt="Disclosurely" 
                 className="h-6 sm:h-8 w-auto flex-shrink-0"
               />
              <div className="min-w-0 flex-1">
                <div className="hidden sm:flex sm:flex-row sm:items-center sm:gap-4">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Welcome back{firstName ? `, ${firstName}` : `, ${user?.email}`}
                  </p>
                  {subscriptionData.subscribed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {isOrgAdmin 
                        ? (subscriptionData.subscription_tier === 'basic' ? 'STARTER' : 'PRO')
                        : 'TEAM MEMBER'
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="sm:hidden">
                <Settings className="h-4 w-4" />
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="sm:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Tabs defaultValue="cases" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cases" className="text-xs sm:text-sm">Cases</TabsTrigger>
              <TabsTrigger value="ai-help" className="text-xs sm:text-sm flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI Case Helper
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Active Reports</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{reports.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <Archive className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 flex-shrink-0" />
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Archived Reports</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{archivedReports.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <ExternalLink className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Quick Report</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          {subdomains.length > 0 ? 'Branded' : (links.length > 0 ? 'Active' : 'None')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Status Alerts */}
              {isCheckingSubscription && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-3"></div>
                      <div>
                        <h3 className="font-medium text-green-800">
                          Verifying Subscription
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          Please wait while we confirm your subscription status...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!subscriptionData.subscribed && !isCheckingSubscription && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-orange-800">Subscription Required</h3>
                        <p className="text-sm text-orange-700">
                          A subscription is required to create submission links and manage reports.
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowTrialModal(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium self-start sm:self-auto"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Secure Report Link Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Secure Report Link</CardTitle>
                  <CardDescription>
                    Your organisation can use this link to disclose all matters to the registered email address on this account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subdomains.length > 0 ? (
                    subdomains.map((subdomain) => (
                      <div key={subdomain.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                           <div className="min-w-0 flex-1">
                             <h3 className="font-medium text-sm sm:text-base text-green-800">
                                {'Branded Submission Portal'}
                             </h3>
                             <p className="text-xs sm:text-sm text-green-600">
                               Used {links.length > 0 ? links[0].usage_count : 0} times
                               {subscriptionData.subscription_tier !== 'pro' && ' - Custom subdomain available for Pro users'}
                             </p>
                           </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <code className="text-xs bg-white px-2 py-1 rounded break-all border">
                              https://{subdomain.domain_name}/secure/tool/submit
                              {links.length > 0 && `/${links[0].link_token}`}
                            </code>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                const fullUrl = `https://${subdomain.domain_name}/secure/tool/submit${links.length > 0 ? `/${links[0].link_token}` : ''}`;
                                navigator.clipboard.writeText(fullUrl);
                                toast({
                                  title: "Branded link copied!",
                                  description: "The branded submission link has been copied to your clipboard.",
                                });
                              }} 
                              className="self-start sm:self-auto bg-green-600 hover:bg-green-700"
                            >
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : links.length > 0 ? (
                    links.map((link) => (
                      <div key={link.id} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                           <div className="min-w-0 flex-1">
                             <h3 className="font-medium text-sm sm:text-base">
                               {'Unbranded Submission Portal'}
                             </h3>
                             <p className="text-xs sm:text-sm text-gray-600">
                               Used {link.usage_count} times
                               {subscriptionData.subscription_tier !== 'pro' && ' - Custom subdomain available for Pro users'}
                             </p>
                           </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                              /secure/tool/submit/{link.link_token}
                            </code>
                            <Button size="sm" onClick={() => copyLink(link.link_token)} className="self-start sm:self-auto">
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No submission link available</p>
                      <p className="text-sm text-gray-500">Contact your administrator to set up a submission link</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Reports Management */}
              <Card>
                <CardHeader className="pb-4">
                  <div>
                     <CardTitle className="text-lg sm:text-xl">Reports Management</CardTitle>
                     <CardDescription>
                       Manage all report submissions (use status filter to view specific types)
                     </CardDescription>
                   </div>
                </CardHeader>
                 <CardContent>
                   {renderReportsTable([...reports, ...archivedReports], false)}
                 </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-help">
              {!selectedReportForAI ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Case Helper
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">PRO</span>
                    </CardTitle>
                    <CardDescription>
                      Select a case to get AI-powered analysis and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reports.length === 0 && archivedReports.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No cases available for analysis</p>
                        <p className="text-sm text-gray-500">Cases will appear here once submitted through your link</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-medium">Select a case to analyze:</h3>
                        <div className="space-y-2">
                          {[...reports, ...archivedReports].map((report) => (
                            <div
                              key={report.id}
                              className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => setSelectedReportForAI(report)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-sm">{report.title}</h4>
                                  <p className="text-xs text-gray-600">{report.tracking_id}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(report.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                  report.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                                  report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  report.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {report.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedReportForAI(null)}
                    className="mb-4"
                  >
                    ← Back to Case Selection
                  </Button>
                  <AICaseHelper 
                    reportId={selectedReportForAI.id}
                    reportContent={selectedReportForAI.encrypted_content}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Report Details Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Report Details: {selectedReport?.tracking_id}</DialogTitle>
            <DialogDescription>
              View submitted report information, attachments, and secure messages
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-x-hidden">
              <div className="space-y-6 min-w-0">
                <ReportContentDisplay
                  encryptedContent={selectedReport.encrypted_content}
                  title={selectedReport.title}
                  status={selectedReport.status}
                  trackingId={selectedReport.tracking_id}
                  reportType={selectedReport.report_type}
                  createdAt={selectedReport.created_at}
                  priority={selectedReport.priority}
                  submittedByEmail={selectedReport.submitted_by_email}
                  reportId={selectedReport.id}
                />
                <ReportAttachments reportId={selectedReport.id} />
              </div>
              {limits.hasMessaging && (
                <div className="min-w-0">
                  <ReportMessaging 
                    report={{
                      id: selectedReport.id,
                      title: selectedReport.title,
                      tracking_id: selectedReport.tracking_id,
                      status: selectedReport.status,
                      created_at: selectedReport.created_at,
                      report_type: selectedReport.report_type,
                      encrypted_content: selectedReport.encrypted_content,
                      organizations: selectedReport.organizations || { name: 'Organization' }
                    }}
                    onClose={() => setIsReportDialogOpen(false)}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <SubscriptionPromptModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      />
      
      <TrialPromptModal
        open={showTrialModal}
        onOpenChange={setShowTrialModal}
      />
    </div>
  );
};

export default Dashboard;
