import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PatternAnalysis {
  key_insights: string;
  common_themes: Array<{
    theme: string;
    frequency: string;
    description: string;
  }>;
  recommendations: string[];
}

const PatternDetection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);

  // Load cached analysis on component mount
  useEffect(() => {
    const cachedAnalysis = localStorage.getItem('patternAnalysis');
    const cachedDate = localStorage.getItem('lastAnalyzed');
    
    if (cachedAnalysis && cachedDate) {
      try {
        setPatternAnalysis(JSON.parse(cachedAnalysis));
        setLastAnalyzed(cachedDate);
      } catch (error) {
        console.error('Error loading cached pattern analysis:', error);
      }
    }
  }, []);

  const analyzePatterns = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      // Fetch all reports for pattern analysis
      const { data: reports, error } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, priority, report_type, tags')
        .eq('organization_id', user.user_metadata?.organization_id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!reports || reports.length === 0) {
        toast({
          title: "No Reports Found",
          description: "No reports available for pattern analysis.",
          variant: "destructive",
        });
        return;
      }

      // Call AI pattern analysis function
      const { data, error: aiError } = await supabase.functions.invoke('analyze-patterns-with-ai', {
        body: { reports }
      });

      if (aiError) {
        throw aiError;
      }

      if (data.success && data.analysis) {
        setPatternAnalysis(data.analysis);
        setLastAnalyzed(new Date().toISOString());
        
        // Cache the analysis
        localStorage.setItem('patternAnalysis', JSON.stringify(data.analysis));
        localStorage.setItem('lastAnalyzed', new Date().toISOString());

        toast({
          title: "Pattern Analysis Complete",
          description: `Analyzed ${data.reports_analyzed} reports for patterns and insights.`,
        });
      } else {
        throw new Error('Failed to analyze patterns');
      }

    } catch (error) {
      console.error('Pattern analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze patterns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Analysis
          </CardTitle>
          <Button
            onClick={analyzePatterns}
            disabled={isAnalyzing}
            size="sm"
            variant="outline"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analysis
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
        {patternAnalysis ? (
          <div className="space-y-6">
            {/* Key Insights */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Key Insights
              </h4>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                {patternAnalysis.key_insights}
              </p>
              
              {/* Recommendations */}
              {patternAnalysis.recommendations && patternAnalysis.recommendations.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                    View Recommendations ({patternAnalysis.recommendations.length})
                  </summary>
                  <div className="mt-2 ml-4">
                    <ul className="space-y-1">
                      {patternAnalysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}
            </div>

            {/* Common Themes */}
            {patternAnalysis.common_themes && patternAnalysis.common_themes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Common Themes
                </h4>
                <div className="grid gap-2">
                  {patternAnalysis.common_themes.map((theme, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm">{theme.theme}</span>
                        <p className="text-xs text-muted-foreground">{theme.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {theme.frequency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Pattern Analysis Available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Refresh Analysis" to analyze patterns across your reports.
            </p>
            <Button onClick={analyzePatterns} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Patterns
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatternDetection;
