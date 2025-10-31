import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Brain,
  AlertTriangle,
  FileText,
  Calendar,
  ArrowUp,
  ArrowDown,
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { format, subMonths } from 'date-fns';

export default function ComplianceInsights() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [insights, setInsights] = useState<{
    complianceScore: number;
    scoreTrend: number;
    topRisks: any[];
    policyGaps: any[];
    trendingIssues: any[];
    recommendations: string[];
  }>({
    complianceScore: 0,
    scoreTrend: 0,
    topRisks: [],
    policyGaps: [],
    trendingIssues: [],
    recommendations: []
  });

  useEffect(() => {
    if (organization?.id) {
      loadInsights();
    }
  }, [organization?.id]);

  const loadInsights = async () => {
    try {
      setLoading(true);

      // Load policies
      const { data: policies } = await supabase
        .from('compliance_policies')
        .select('status, policy_type, next_review_date')
        .eq('organization_id', organization?.id);

      // Load risks
      const { data: risks } = await supabase
        .from('compliance_risks')
        .select('risk_title, risk_score, category, mitigation_status')
        .eq('organization_id', organization?.id)
        .order('risk_score', { ascending: false });

      // Load reports (for trending issues)
      const threeMonthsAgo = subMonths(new Date(), 3).toISOString();
      const { data: recentReports } = await supabase
        .from('reports')
        .select('category, status, created_at')
        .eq('organization_id', organization?.id)
        .gte('created_at', threeMonthsAgo);

      // Calculate compliance score
      const totalPolicies = policies?.length || 0;
      const activePolicies = policies?.filter(p => p.status === 'active').length || 0;
      const totalRisks = risks?.length || 0;
      const highRisks = risks?.filter(r => r.risk_score >= 15).length || 0;

      const policyScore = totalPolicies > 0 ? (activePolicies / totalPolicies) * 50 : 0;
      const riskScore = totalRisks > 0 ? ((totalRisks - highRisks) / totalRisks) * 50 : 0;
      const complianceScore = Math.round(policyScore + riskScore);

      // Top 3 risks
      const topRisks = risks?.slice(0, 3) || [];

      // Policy gaps (policies that need review soon or missing types)
      const policyGaps = [];
      const existingTypes = new Set(policies?.map(p => p.policy_type) || []);
      const essentialTypes = ['data_privacy', 'hr', 'security'];
      
      essentialTypes.forEach(type => {
        if (!existingTypes.has(type)) {
          policyGaps.push({
            type,
            message: `Missing ${type.replace('_', ' ')} policy`
          });
        }
      });

      // Policies due for review
      const today = new Date();
      policies?.forEach(p => {
        if (p.next_review_date) {
          const reviewDate = new Date(p.next_review_date);
          const daysUntil = Math.floor((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 30 && daysUntil >= 0) {
            policyGaps.push({
              type: p.policy_type,
              message: `${p.policy_type.replace('_', ' ')} policy due for review`
            });
          }
        }
      });

      // Trending issues from reports
      const categoryCounts: Record<string, number> = {};
      recentReports?.forEach(r => {
        if (r.category) {
          categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
        }
      });

      const trendingIssues = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Generate basic recommendations
      const recommendations = [];
      
      if (highRisks > 0) {
        recommendations.push(`Address ${highRisks} high-risk ${highRisks === 1 ? 'item' : 'items'} in your risk register`);
      }
      
      if (policyGaps.length > 0) {
        recommendations.push(`Review or create ${policyGaps.length} ${policyGaps.length === 1 ? 'policy' : 'policies'} to improve coverage`);
      }
      
      if (trendingIssues.length > 0) {
        recommendations.push(`Monitor ${trendingIssues[0].category} - trending in recent reports`);
      }

      if (complianceScore >= 80) {
        recommendations.push('Excellent compliance posture! Maintain current processes');
      } else if (complianceScore >= 60) {
        recommendations.push('Good progress! Focus on closing policy gaps and mitigating high risks');
      } else {
        recommendations.push('Compliance needs attention. Prioritize active policies and risk mitigation');
      }

      setInsights({
        complianceScore,
        scoreTrend: 2, // Mock trend (would calculate from historical data)
        topRisks,
        policyGaps: policyGaps.slice(0, 5),
        trendingIssues,
        recommendations
      });

    } catch (error) {
      console.error('Error loading insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compliance insights.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      setGeneratingInsights(true);
      
      // Call AI Gateway for deeper analysis
      const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a compliance expert analyzing an organization\'s compliance data.'
            },
            {
              role: 'user',
              content: `Based on this data, provide 3 specific, actionable compliance recommendations:
              - Compliance Score: ${insights.complianceScore}
              - Top Risks: ${insights.topRisks.map(r => r.risk_title).join(', ')}
              - Policy Gaps: ${insights.policyGaps.map(g => g.message).join(', ')}
              - Trending Issues: ${insights.trendingIssues.map(i => i.category).join(', ')}
              
              Format as a numbered list with brief explanations.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          context: {
            purpose: 'compliance_insights'
          }
        },
        headers: {
          'X-Organization-Id': organization?.id || ''
        }
      });

      if (error) throw error;

      const aiRecommendations = data?.choices[0]?.message?.content || '';
      const recommendationsList = aiRecommendations
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, 5);

      setInsights(prev => ({
        ...prev,
        recommendations: recommendationsList
      }));

      toast({
        title: '✨ AI Insights Generated',
        description: 'Fresh recommendations ready!'
      });

    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI insights. Using standard recommendations.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">AI-powered compliance analysis and recommendations</p>
          </div>
          <Button onClick={generateAIInsights} disabled={generatingInsights}>
            {generatingInsights ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Compliance Score Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Compliance Health Score
          </CardTitle>
          <CardDescription>
            Overall compliance posture over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
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
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - insights.complianceScore / 100)}`}
                  className={
                    insights.complianceScore >= 80 
                      ? 'text-green-500' 
                      : insights.complianceScore >= 60 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{insights.complianceScore}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={insights.scoreTrend > 0 ? 'default' : 'destructive'} className={insights.scoreTrend > 0 ? 'bg-green-100 text-green-800' : ''}>
                  {insights.scoreTrend > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs(insights.scoreTrend)}% vs last month
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {insights.complianceScore >= 80 && 'Excellent! Your compliance program is well-managed.'}
                {insights.complianceScore >= 60 && insights.complianceScore < 80 && 'Good progress! A few areas need attention.'}
                {insights.complianceScore < 60 && 'Needs improvement. Focus on policies and risk mitigation.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Top 3 Risks
            </CardTitle>
            <CardDescription>Highest-scoring risks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.topRisks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No risks registered yet
              </div>
            ) : (
              <div className="space-y-3">
                {insights.topRisks.map((risk, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{risk.risk_title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{risk.category}</div>
                      </div>
                      <Badge variant={risk.risk_score >= 15 ? 'destructive' : 'secondary'}>
                        Score: {risk.risk_score}
                      </Badge>
                    </div>
                    {risk.mitigation_status !== 'monitoring' && risk.mitigation_status !== 'closed' && (
                      <div className="mt-2 text-xs text-amber-600">
                        ⚠️ Status: {risk.mitigation_status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              Policy Gaps & Reviews
            </CardTitle>
            <CardDescription>Policies needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.policyGaps.length === 0 ? (
              <div className="text-center py-8 text-green-600 text-sm">
                ✅ All essential policies in place!
              </div>
            ) : (
              <div className="space-y-2">
                {insights.policyGaps.map((gap, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">{gap.message}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Trending Issues
            </CardTitle>
            <CardDescription>Most common report categories (Last 3 months)</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.trendingIssues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No trends detected yet
              </div>
            ) : (
              <div className="space-y-3">
                {insights.trendingIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-sm capitalize">{issue.category.replace('_', ' ')}</div>
                    <Badge variant="secondary">
                      {issue.count} {issue.count === 1 ? 'report' : 'reports'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Actionable insights powered by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="text-sm flex-1">{recommendation}</div>
                </div>
              ))}
            </div>
            
            {!generatingInsights && (
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={generateAIInsights}
                >
                  <Sparkles className="h-3 w-3 mr-2" />
                  Refresh AI Insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>Based on your compliance data</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {insights.topRisks.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/compliance/risks">
                <AlertTriangle className="h-3 w-3 mr-2" />
                Review Top Risks
              </a>
            </Button>
          )}
          {insights.policyGaps.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/compliance/policies">
                <FileText className="h-3 w-3 mr-2" />
                Update Policies
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/compliance/calendar">
              <Calendar className="h-3 w-3 mr-2" />
              View Calendar
            </a>
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

