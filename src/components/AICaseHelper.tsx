
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, FileText, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  report_type: string;
  encrypted_content: string;
  organizations: {
    name: string;
  };
}

interface AICaseHelperProps {
  report: Report;
  companyDocuments: any[];
}

const AICaseHelper = ({ report, companyDocuments }: AICaseHelperProps) => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCase = async () => {
    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI analysis for case:', report.tracking_id);
      
      const { data, error } = await supabase.functions.invoke('analyze-case-with-ai', {
        body: {
          caseData: report,
          companyDocuments: companyDocuments,
          caseContent: report.encrypted_content
        }
      });

      if (error) {
        console.error('Error invoking AI analysis:', error);
        throw error;
      }

      console.log('AI analysis response:', data);

      if (data.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analysis Complete",
          description: "AI case analysis has been generated successfully.",
        });
      } else if (data.fallbackAnalysis) {
        setAnalysis(data.fallbackAnalysis);
        toast({
          title: "Analysis Generated",
          description: "A basic analysis has been provided. AI service is temporarily unavailable.",
        });
      } else {
        throw new Error('No analysis data received');
      }

    } catch (error) {
      console.error('Error analyzing case:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-analysis-${report.tracking_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Analysis has been downloaded as a text file.",
    });
  };

  const copyToClipboard = async () => {
    if (!analysis) return;
    
    try {
      await navigator.clipboard.writeText(analysis);
      toast({
        title: "Copied",
        description: "Analysis has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy analysis to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Case Helper
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">PRO</span>
        </CardTitle>
        <CardDescription>
          AI-powered compliance analysis and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Generate AI-powered analysis and compliance recommendations for this case.
            </p>
            <Button 
              onClick={analyzeCase}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Case'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadAnalysis}>
                  <Download className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
            <div 
              className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(analysis) }}
            />
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={analyzeCase}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                {isAnalyzing ? 'Re-analyzing...' : 'Re-analyze Case'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICaseHelper;
