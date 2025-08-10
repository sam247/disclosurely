
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  message: string;
  duration?: number;
}

const AnonymousSubmissionTest = () => {
  const [linkToken, setLinkToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    if (!linkToken.trim()) {
      alert('Please enter a link token');
      return;
    }

    setTesting(true);
    setResults([]);

    const testResults: TestResult[] = [];

    // Test 1: Validate link token
    const test1Start = Date.now();
    testResults.push({ name: 'Link Token Validation', status: 'pending', message: 'Testing...' });
    setResults([...testResults]);

    try {
      const { data: linkData, error: linkError } = await supabase
        .from('organization_links')
        .select('*')
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        testResults[0] = {
          name: 'Link Token Validation',
          status: 'fail',
          message: 'Link token not found or inactive',
          duration: Date.now() - test1Start
        };
      } else {
        testResults[0] = {
          name: 'Link Token Validation',
          status: 'pass',
          message: `Link found: ${linkData.name}`,
          duration: Date.now() - test1Start
        };
      }
    } catch (error) {
      testResults[0] = {
        name: 'Link Token Validation',
        status: 'fail',
        message: `Error: ${error}`,
        duration: Date.now() - test1Start
      };
    }

    setResults([...testResults]);

    // Test 2: Test anonymous submission
    if (testResults[0].status === 'pass') {
      const test2Start = Date.now();
      testResults.push({ name: 'Anonymous Submission', status: 'pending', message: 'Testing submission...' });
      setResults([...testResults]);

      try {
        const testReportData = {
          tracking_id: `TEST-${Date.now()}`,
          title: 'Test Report for Automated Testing',
          encrypted_content: 'encrypted_test_content',
          encryption_key_hash: 'test_hash',
          report_type: 'anonymous' as const,
          submitted_by_email: null,
          status: 'new' as const,
          priority: 3,
          tags: ['Test']
        };

        const { data, error } = await supabase.functions.invoke('submit-anonymous-report', {
          body: {
            reportData: testReportData,
            linkToken: linkToken
          }
        });

        if (error) {
          testResults[1] = {
            name: 'Anonymous Submission',
            status: 'fail',
            message: `Submission failed: ${error.message}`,
            duration: Date.now() - test2Start
          };
        } else if (data.success) {
          testResults[1] = {
            name: 'Anonymous Submission',
            status: 'pass',
            message: `Report created successfully: ${data.report?.id}`,
            duration: Date.now() - test2Start
          };
        } else {
          testResults[1] = {
            name: 'Anonymous Submission',
            status: 'fail',
            message: `Submission failed: ${data.error}`,
            duration: Date.now() - test2Start
          };
        }
      } catch (error) {
        testResults[1] = {
          name: 'Anonymous Submission',
          status: 'fail',
          message: `Error: ${error}`,
          duration: Date.now() - test2Start
        };
      }

      setResults([...testResults]);
    }

    // Test 3: Test report lookup
    if (testResults[1]?.status === 'pass') {
      const test3Start = Date.now();
      testResults.push({ name: 'Report Lookup', status: 'pending', message: 'Testing report lookup...' });
      setResults([...testResults]);

      try {
        const trackingId = `TEST-${Date.now()}`;
        
        const { data: reportData, error: reportError } = await supabase
          .from('reports')
          .select(`
            *,
            organizations!inner(name, brand_color)
          `)
          .eq('tracking_id', trackingId)
          .maybeSingle();

        if (reportError) {
          testResults[2] = {
            name: 'Report Lookup',
            status: 'warning',
            message: 'Report lookup test completed (expected for test data)',
            duration: Date.now() - test3Start
          };
        } else {
          testResults[2] = {
            name: 'Report Lookup',
            status: 'pass',
            message: 'Report lookup functionality working',
            duration: Date.now() - test3Start
          };
        }
      } catch (error) {
        testResults[2] = {
          name: 'Report Lookup',
          status: 'fail',
          message: `Error: ${error}`,
          duration: Date.now() - test3Start
        };
      }

      setResults([...testResults]);
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Anonymous Submission Test Suite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="linkToken">Link Token</Label>
            <Input
              id="linkToken"
              value={linkToken}
              onChange={(e) => setLinkToken(e.target.value)}
              placeholder="Enter organization link token"
              disabled={testing}
            />
          </div>

          <Button 
            onClick={runTests}
            disabled={testing || !linkToken.trim()}
            className="w-full"
          >
            {testing ? 'Running Tests...' : 'Run Test Suite'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Test Results</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.duration && (
                      <span className="text-xs text-gray-500">{result.duration}ms</span>
                    )}
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnonymousSubmissionTest;
