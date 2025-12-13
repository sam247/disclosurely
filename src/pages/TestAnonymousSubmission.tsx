
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TestAnonymousSubmission = () => {
  // This would typically be a real link token from your database
  const testLinkToken = 'test-token-123';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Anonymous Submission
          </h1>
          <p className="text-gray-600">
            This page is for testing the anonymous submission flow
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Submission Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Click the button below to test the anonymous submission form with a test link token.
            </p>
            <Link to={`/secure/tool/submit/${testLinkToken}`}>
              <Button>
                Test Submission Form
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestAnonymousSubmission;
