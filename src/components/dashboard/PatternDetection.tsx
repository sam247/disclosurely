import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertCircle, TrendingUp, Calendar, Target, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PatternAnalysis {
  common_themes: Array<{
    theme: string;
    frequency: number;
    description: string;
    examples: string[];
  }>;
  category_patterns: Array<{
    category: string;
    count: number;
    percentage: number;
    trend: string;
  }>;
  temporal_insights: {
    peak_periods: string[];
    trend: string;
    seasonal_patterns: string[];
  };
  risk_insights: {
    high_risk_categories: string[];
    risk_trends: string;
  };
  recommendations: string[];
  summary: string;
}

const PatternDetection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true); // Collapsible state

  // Load persisted analysis and collapsible state on component mount
  useEffect(() => {
    const savedAnalysis = localStorage.getItem('ai-analysis');
    const savedTimestamp = localStorage.getItem('ai-analysis-timestamp');
    const savedCollapsedState = localStorage.getItem('ai-analysis-collapsed');
    
    if (savedAnalysis && savedTimestamp) {
      try {
        setPatternAnalysis(JSON.parse(savedAnalysis));
        setLastAnalyzed(savedTimestamp);
      } catch (error) {
        console.error('Failed to load saved analysis:', error);
        localStorage.removeItem('ai-analysis');
        localStorage.removeItem('ai-analysis-timestamp');
      }
    }
    
    // Load collapsed state, default to expanded (false)
    if (savedCollapsedState !== null) {
      setIsOpen(!JSON.parse(savedCollapsedState));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('ai-analysis-collapsed', JSON.stringify(!isOpen));
  }, [isOpen]);

  const analyzePatterns = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    try {
      // Get user's organization ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('User organization not found');

      // Fetch all reports for pattern analysis
      const { data: reports, error } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, priority, tags')
        .eq('organization_id', profile.organization_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!reports || reports.length === 0) {
        toast({
          title: "No Data",
          description: "No reports available for pattern analysis.",
          variant: "destructive",
        });
        return;
      }

      // Call the AI pattern analysis function
      const { data, error: analysisError } = await supabase.functions.invoke('analyze-patterns-with-ai', {
        body: { reports }
      });

      if (analysisError) throw analysisError;

      setPatternAnalysis(data.patternAnalysis);
      setLastAnalyzed(new Date().toISOString());

      // Persist analysis to localStorage
      localStorage.setItem('ai-analysis', JSON.stringify(data.patternAnalysis));
      localStorage.setItem('ai-analysis-timestamp', new Date().toISOString());

      toast({
        title: "Pattern Analysis Complete",
        description: `Analyzed ${reports.length} reports for patterns and insights.`,
      });

    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: "Error",
        description: "Failed to analyze patterns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Don't auto-analyze on component mount - only on manual refresh
    // This prevents AI credits from being used up on every login
  }, [user]);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzePatterns}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          {lastAnalyzed && (
            <p className="text-sm text-muted-foreground">
              Last analyzed: {new Date(lastAnalyzed).toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
        {isAnalyzing ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Analyzing compliance patterns across all cases...</p>
          </div>
        ) : patternAnalysis ? (
          <div className="space-y-6">
            {/* Key Insights - Enhanced for compliance intelligence */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-900">
                <AlertCircle className="h-5 w-5" />
                Compliance Intelligence Summary
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{patternAnalysis.summary}</p>
              </div>
              
              {/* Recommendations Dropdown */}
              {patternAnalysis.recommendations.length > 0 && (
                <details className="mt-6">
                  <summary className="cursor-pointer font-semibold text-sm text-blue-800 hover:text-blue-900 hover:underline flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    View Strategic Recommendations ({patternAnalysis.recommendations.length})
                  </summary>
                  <div className="mt-4 space-y-3 pl-6">
                    {patternAnalysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-800 leading-relaxed">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Compliance Analysis Available</h3>
            <p className="mb-4">Click "Refresh" to analyze patterns across all your whistleblowing cases.</p>
            <p className="text-sm">This will provide strategic insights for senior compliance and HR review.</p>
          </div>
        )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default PatternDetection;
