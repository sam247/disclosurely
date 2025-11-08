import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight } from 'lucide-react';
import { resumeDraft } from '@/services/draftService';
import { Card, CardContent } from '@/components/ui/card';

export const ResumeDraft = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draftCode, setDraftCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResume = async () => {
    setError('');
    setIsLoading(true);

    const response = await resumeDraft({ draftCode: draftCode.trim() });
    setIsLoading(false);

    if (response.success) {
      // Navigate to form with draft data
      navigate(`/newform?draft=${draftCode}`);
    } else {
      setError(response.message || 'Failed to load draft');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Resume Draft</h1>
              <p className="text-sm text-muted-foreground">
                Enter your draft code to continue your report
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="draft-code">Draft Code</Label>
                <Input
                  id="draft-code"
                  placeholder="DR-A7K9-M3P2-X8Q5"
                  value={draftCode}
                  onChange={(e) => setDraftCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                onClick={handleResume}
                disabled={!draftCode || isLoading}
                className="w-full gap-2"
              >
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>
                    Resume Draft
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => navigate('/newform')}
                  className="text-sm"
                >
                  Start a new report instead
                </Button>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
              <p><strong>Note:</strong> Drafts expire after 48 hours for security reasons.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeDraft;
