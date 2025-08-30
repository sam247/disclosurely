
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2 } from 'lucide-react';
import { sanitizeHtml } from '@/utils/sanitizer';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';

interface AICaseHelperProps {
  reportId: string;
  reportContent: string;
}

const AICaseHelper: React.FC<AICaseHelperProps> = ({ reportId, reportContent }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  const analyzeCase = async (prompt?: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-case-with-ai', {
        body: {
          reportId,
          reportContent,
          customPrompt: prompt
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated for this case."
      });
    } catch (error) {
      console.error('Error analyzing case:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomAnalysis = () => {
    if (customPrompt.trim()) {
      analyzeCase(customPrompt);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Case Analysis
        </CardTitle>
        <CardDescription>
          Get AI-powered insights and recommendations for this case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => analyzeCase()}
            disabled={isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Case'
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Ask a specific question about this case..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={isAnalyzing}
          />
          <Button
            onClick={handleCustomAnalysis}
            disabled={isAnalyzing || !customPrompt.trim()}
            variant="outline"
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Custom Analysis'
            )}
          </Button>
        </div>

        {analysis && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">AI Analysis Results:</h4>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHtml(formatMarkdownToHtml(analysis))
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICaseHelper;
