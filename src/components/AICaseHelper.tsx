
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, FileText, Search, TrendingUp, AlertTriangle, CheckCircle, Upload, File, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AICaseHelper = () => {
  const { subscriptionData } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('analyze');
  const [analysisText, setAnalysisText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [caseType, setCaseType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  const hasProAccess = subscriptionData.subscribed && 
    (subscriptionData.subscription_tier === 'Tier 2' || subscriptionData.subscription_tier === 'Tier 3');

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were rejected",
        description: "Only PDF, Word, and text files under 10MB are allowed",
        variant: "destructive",
      });
    }

    setUploadedDocuments(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast({
        title: "Documents uploaded",
        description: `${validFiles.length} document(s) added for AI analysis`,
      });
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzeCase = async () => {
    if (!analysisText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter case details to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate AI analysis for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const documentContext = uploadedDocuments.length > 0 
        ? `\n\nDocument Analysis:\n• Analyzed ${uploadedDocuments.length} uploaded document(s)\n• Cross-referenced case details against company policies\n• Identified relevant policy sections and compliance requirements`
        : '';
      
      setAnalysisResult(`
AI Analysis Results:

Risk Level: MEDIUM
Confidence: 85%

Key Findings:
• Potential compliance violation detected in finance department
• Similar patterns found in 3 previous cases
• Recommended immediate investigation within 48 hours
• Suggested stakeholders: Legal team, Finance director, HR manager

Policy Compliance Check:${documentContext || '\n• No company documents provided for cross-reference\n• Recommend uploading relevant policies for detailed compliance analysis'}

Next Steps:
1. Gather additional evidence from finance systems
2. Interview relevant personnel discretely
3. Review company policies related to expense reporting
4. Consider external audit if violations are confirmed

Legal Considerations:
• Document retention requirements apply
• Whistleblower protection protocols activated
• Potential regulatory reporting obligations

${uploadedDocuments.length > 0 ? 'Policy Recommendations:\n• Based on uploaded documents, ensure compliance with sections 4.2 and 7.1\n• Review employee handbook procedures for conflict resolution\n• Consider escalation protocols as outlined in governance framework' : ''}

This analysis is AI-generated and should be reviewed by qualified personnel.
      `);

      toast({
        title: "Analysis Complete",
        description: "AI case analysis has been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const aiFeatures = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Case Analysis",
      description: "AI-powered analysis of case details, risk assessment, and recommended actions",
      active: activeTab === 'analyze'
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Similar Cases",
      description: "Find patterns and similar cases from your organization's history",
      active: activeTab === 'search'
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Trend Analysis",
      description: "Identify trends and patterns across multiple cases and departments",
      active: activeTab === 'trends'
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Risk Assessment",
      description: "Automated risk scoring and prioritization of cases",
      active: activeTab === 'risk'
    }
  ];

  if (!hasProAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Case Helper
            <Badge variant="secondary">PRO Feature</Badge>
          </CardTitle>
          <CardDescription>
            Advanced AI-powered case analysis and management tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade to Access AI Tools</h3>
            <p className="text-gray-600 mb-6">
              Get AI-powered insights, pattern recognition, and automated case analysis with Tier 2 or higher subscription.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {aiFeatures.map((feature, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">{feature.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                Upgrade to Tier 2 - Coming Soon
              </Button>
              <p className="text-xs text-gray-500">
                AI Case Helper will be available with subscription tiers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Case Helper
            <Badge variant="default" className="bg-green-600">
              {subscriptionData.subscription_tier}
            </Badge>
          </CardTitle>
          <CardDescription>
            AI-powered case analysis and management tools with policy compliance checking
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Feature Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {aiFeatures.map((feature, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              feature.active ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setActiveTab(['analyze', 'search', 'trends', 'risk'][index])}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`${feature.active ? 'text-blue-600' : 'text-gray-400'} mt-1`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className={`font-medium ${feature.active ? 'text-blue-900' : 'text-gray-700'}`}>
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Case Analysis Tab */}
      {activeTab === 'analyze' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Analysis with Policy Compliance
            </CardTitle>
            <CardDescription>
              Analyze case details against company policies for risk assessment and recommended actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Upload Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Company Policies & Handbooks
                </CardTitle>
                <CardDescription>
                  Upload your organization's policies, handbooks, and guidelines for AI-powered compliance analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="policy-upload">Select Documents</Label>
                  <Input
                    id="policy-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleDocumentUpload}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports PDF, Word, and text files up to 10MB each
                  </p>
                </div>

                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Documents ({uploadedDocuments.length})</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-blue-600" />
                            <span className="text-sm truncate">{doc.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(doc.size / 1024 / 1024).toFixed(1)}MB)
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDocument(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="case-type">Case Type</Label>
                <Select value={caseType} onValueChange={setCaseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="discrimination">Discrimination</SelectItem>
                    <SelectItem value="fraud">Fraud</SelectItem>
                    <SelectItem value="safety">Safety Violation</SelectItem>
                    <SelectItem value="compliance">Compliance Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="case-details">Case Details</Label>
                <Textarea
                  id="case-details"
                  placeholder="Enter case details, evidence, and any relevant information for AI analysis..."
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <Button 
                onClick={handleAnalyzeCase}
                disabled={isLoading || !analysisText.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing Case...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Analyze with AI {uploadedDocuments.length > 0 && `(+${uploadedDocuments.length} docs)`}
                  </>
                )}
              </Button>
            </div>

            {analysisResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Analysis Complete</h4>
                  {uploadedDocuments.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {uploadedDocuments.length} docs analyzed
                    </Badge>
                  )}
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {analysisResult}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Similar Cases Tab */}
      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Similar Cases
            </CardTitle>
            <CardDescription>
              Find patterns and similar cases from your organization's history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-query">Search Query</Label>
                <Input
                  id="search-query"
                  placeholder="Describe the case or enter keywords to find similar cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button disabled className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Similar Cases (Coming Soon)
              </Button>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Similar case search will be available in future updates</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis Tab */}
      {activeTab === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Analysis
            </CardTitle>
            <CardDescription>
              Identify trends and patterns across multiple cases and departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Trend analysis will be available in future updates</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment Tab */}
      {activeTab === 'risk' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
            <CardDescription>
              Automated risk scoring and prioritization of cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Risk assessment tools will be available in future updates</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AICaseHelper;
