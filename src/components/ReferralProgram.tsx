import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check, Gift, Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ReferralProgram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchReferralLink();
    }
  }, [user]);

  const fetchReferralLink = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      // Call edge function to get or create referral link
      const { data, error } = await supabase.functions.invoke('get-referral-link', {
        body: { email: user.email },
      });

      if (error) throw error;

      if (data?.referralLink) {
        setReferralLink(data.referralLink);
        // Extract code from link
        const url = new URL(data.referralLink);
        const code = url.searchParams.get('ref') || url.searchParams.get('referral') || '';
        setReferralCode(code);
      }
    } catch (error) {
      console.error('Error fetching referral link:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral information. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const baseUrl = window.location.origin;
  const fullReferralLink = referralLink || `${baseUrl}/pricing?ref=${referralCode}`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Referral Program</h3>
        <p className="text-sm text-muted-foreground">
          Share Disclosurely with others and earn rewards when they subscribe. Your unique referral link tracks sign-ups and subscriptions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with friends and colleagues. When they sign up and subscribe, you'll both benefit!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading your referral link...</div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  value={fullReferralLink}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(fullReferralLink)}
                  variant="outline"
                  size="icon"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {referralCode && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Your Referral Code:</Label>
                  <Badge variant="secondary" className="font-mono">
                    {referralCode}
                  </Badge>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">How it works</div>
                    <div className="text-sm text-muted-foreground">
                      Share your unique link. When someone signs up using your link and subscribes, both you and they may receive rewards based on our referral program terms.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Track your referrals</div>
                    <div className="text-sm text-muted-foreground">
                      Referral tracking is handled automatically. Check back here for updates on your referral activity.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              const subject = encodeURIComponent('Check out Disclosurely - Secure Whistleblowing Platform');
              const body = encodeURIComponent(
                `I've been using Disclosurely for secure whistleblowing and compliance. Check it out using my referral link:\n\n${fullReferralLink}`
              );
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
          >
            Share via Email
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Check out Disclosurely',
                  text: 'I've been using Disclosurely for secure whistleblowing and compliance.',
                  url: fullReferralLink,
                });
              } else {
                copyToClipboard(fullReferralLink);
              }
            }}
          >
            Share via Native Share
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralProgram;

