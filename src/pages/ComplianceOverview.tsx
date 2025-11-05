import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

export default function ComplianceOverview() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    policiesDueReview: 0,
    totalRisks: 0,
    highRisks: 0,
    upcomingEvents: 0,
    overdueEvents: 0,
    complianceScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization?.id) {
      loadStats();
    }
  }, [organization?.id]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Policies
      const { data: policies, error: policiesError } = await supabase
        .from('compliance_policies')
        .select('id, status, next_review_date')
        .eq('organization_id', organization?.id);

      if (policiesError) throw policiesError;

      const totalPolicies = policies?.length || 0;
      const activePolicies = policies?.filter(p => p.status === 'active').length || 0;
      const policiesDueReview = policies?.filter(p => {
        if (!p.next_review_date) return false;
        const reviewDate = new Date(p.next_review_date);
        const today = new Date();
        const daysUntilReview = Math.floor((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilReview <= 30 && daysUntilReview >= 0;
      }).length || 0;

      // Risks
      const { data: risks, error: risksError } = await supabase
        .from('compliance_risks')
        .select('id, risk_score, mitigation_status')
        .eq('organization_id', organization?.id);

      if (risksError) throw risksError;

      const totalRisks = risks?.length || 0;
      const highRisks = risks?.filter(r => r.risk_score >= 15).length || 0;

      // Calendar events
      const { data: events, error: eventsError } = await supabase
        .from('compliance_calendar')
        .select('id, status, due_date')
        .eq('organization_id', organization?.id);

      if (eventsError) throw eventsError;

      const today = new Date();
      const upcomingEvents = events?.filter(e => {
        const dueDate = new Date(e.due_date);
        const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 14 && daysUntilDue >= 0 && e.status !== 'completed';
      }).length || 0;

      const overdueEvents = events?.filter(e => e.status === 'overdue').length || 0;

      // Calculate compliance score (0-100)
      const policyScore = totalPolicies > 0 ? (activePolicies / totalPolicies) * 40 : 0;
      const riskScore = totalRisks > 0 ? ((totalRisks - highRisks) / totalRisks) * 40 : 0;
      const eventScore = events && events.length > 0 
        ? ((events.length - overdueEvents) / events.length) * 20 
        : 0;
      
      const complianceScore = Math.round(policyScore + riskScore + eventScore);

      setStats({
        totalPolicies,
        activePolicies,
        policiesDueReview,
        totalRisks,
        highRisks,
        upcomingEvents,
        overdueEvents,
        complianceScore
      });
    } catch (error) {
      console.error('Error loading compliance stats:', error);
      toast({
        title: "Error",
        description: "Failed to load compliance statistics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Compliance Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track policies, risks, and compliance activities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/dashboard/compliance/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/compliance/policies">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Link>
          </Button>
        </div>
      </div>

      {/* Compliance Score Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance Health Score
          </CardTitle>
          <CardDescription>
            Overall compliance posture based on policies, risks, and deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.complianceScore / 100)}`}
                  className={
                    stats.complianceScore >= 80 
                      ? 'text-green-500' 
                      : stats.complianceScore >= 60 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{stats.complianceScore}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Policies Up-to-Date</span>
                <span className="font-medium">{stats.activePolicies}/{stats.totalPolicies}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>High Risks Mitigated</span>
                <span className="font-medium">{stats.totalRisks - stats.highRisks}/{stats.totalRisks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>On-Time Completion</span>
                <span className="font-medium">{stats.overdueEvents === 0 ? 'All' : 'Some'} Events</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Policies */}
        <Link to="/dashboard/compliance/policies">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{stats.totalPolicies}</div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{stats.activePolicies} Active</span>
                </div>
                {stats.policiesDueReview > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span className="text-amber-600 font-medium">{stats.policiesDueReview} Due Review</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Risks */}
        <Link to="/dashboard/compliance/risks">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Risk Register
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{stats.totalRisks}</div>
                {stats.highRisks > 0 ? (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span className="text-red-600 font-medium">{stats.highRisks} High Risk</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">No High Risks</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Calendar */}
        <Link to="/dashboard/compliance/calendar">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600 font-medium">Next 14 Days</span>
                </div>
                {stats.overdueEvents > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span className="text-red-600 font-medium">{stats.overdueEvents} Overdue</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* AI Insights */}
        <Link to="/dashboard/compliance/insights">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Get AI-powered recommendations
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Insights
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common compliance tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link to="/dashboard/compliance/policies?action=new">
              <div className="flex items-start gap-3 w-full">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold">Create New Policy</div>
                  <div className="text-xs text-muted-foreground">Add a compliance policy</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link to="/dashboard/compliance/risks?action=new">
              <div className="flex items-start gap-3 w-full">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold">Register New Risk</div>
                  <div className="text-xs text-muted-foreground">Add to risk register</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link to="/dashboard/compliance/calendar?action=new">
              <div className="flex items-start gap-3 w-full">
                <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold">Schedule Event</div>
                  <div className="text-xs text-muted-foreground">Add calendar item</div>
                </div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

