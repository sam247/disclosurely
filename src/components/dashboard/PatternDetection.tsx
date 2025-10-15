import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Calendar, Target, RefreshCw } from 'lucide-react';
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
        .select('id, title, tracking_id, status, created_at, priority, tags, ai_risk_score, ai_risk_level')
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
    // Auto-analyze on component mount if we have data
    if (user) {
      analyzePatterns();
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pattern Detection
          </CardTitle>
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
      <CardContent>
        {isAnalyzing ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Analyzing patterns in your reports...</p>
          </div>
        ) : patternAnalysis ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Key Insights
              </h3>
              <p className="text-sm text-muted-foreground">{patternAnalysis.summary}</p>
            </div>

            {/* Common Themes */}
            {patternAnalysis.common_themes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Common Themes</h3>
                <div className="space-y-2">
                  {patternAnalysis.common_themes.slice(0, 3).map((theme, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{theme.theme}</div>
                        <div className="text-sm text-muted-foreground">{theme.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Examples: {theme.examples.slice(0, 2).join(', ')}
                        </div>
                      </div>
                      <Badge variant="secondary">{theme.frequency} reports</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Patterns */}
            {patternAnalysis.category_patterns.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Category Patterns</h3>
                <div className="grid gap-2">
                  {patternAnalysis.category_patterns.slice(0, 4).map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{category.count} reports</Badge>
                        <Badge 
                          variant={
                            category.trend === 'increasing' ? 'destructive' :
                            category.trend === 'decreasing' ? 'default' :
                            'secondary'
                          }
                        >
                          {category.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Insights */}
            {patternAnalysis.risk_insights.high_risk_categories.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Risk Insights</h3>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-800 mb-2">High Risk Categories:</div>
                  <div className="flex flex-wrap gap-1">
                    {patternAnalysis.risk_insights.high_risk_categories.map((category, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-red-700 mt-2">
                    {patternAnalysis.risk_insights.risk_trends}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {patternAnalysis.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {patternAnalysis.recommendations.slice(0, 3).map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-4" />
            <p>No pattern analysis available. Click "Refresh" to analyze your reports.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatternDetection;
