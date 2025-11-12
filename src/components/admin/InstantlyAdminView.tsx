/**
 * Instantly.ai Campaign Management Admin View
 * 
 * This component provides an admin interface for managing Instantly.ai campaigns,
 * leads, and email sending. It uses the Supabase Edge Functions we created
 * to interact with the Instantly.ai API.
 * 
 * Note: The Instantly.ai MCP is configured in Cursor for AI assistant use.
 * This UI uses the Edge Functions for direct API access.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, Users, BarChart3, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  leads_count?: number;
}

export const InstantlyAdminView = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState('send');

  // Send email form state
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    html: '',
    text: '',
    from_name: 'Sam Pettiford',
    from_email: 'support@disclosurely.com',
    provider: 'instantly' as 'instantly' | 'uptics',
  });

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    campaign_id: '',
    emails: '',
    variables: '',
  });

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || (!emailForm.html && !emailForm.text)) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const functionName = emailForm.provider === 'instantly' 
        ? 'send-email-instantly' 
        : 'send-email-uptics';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          to: emailForm.to.split(',').map(e => e.trim()),
          subject: emailForm.subject,
          html: emailForm.html,
          text: emailForm.text,
          from_name: emailForm.from_name,
          from_email: emailForm.from_email,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success!',
        description: `Email sent via ${emailForm.provider === 'instantly' ? 'Instantly.ai' : 'Uptics.io'}`,
      });

      // Reset form
      setEmailForm({
        ...emailForm,
        to: '',
        subject: '',
        html: '',
        text: '',
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCampaign = async () => {
    if (!campaignForm.campaign_id || !campaignForm.emails) {
      toast({
        title: 'Error',
        description: 'Please provide campaign ID and email addresses',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const emails = campaignForm.emails.split('\n').map(e => e.trim()).filter(e => e);
      let variables = {};

      if (campaignForm.variables) {
        try {
          variables = JSON.parse(campaignForm.variables);
        } catch {
          // If not valid JSON, try parsing as key=value pairs
          variables = campaignForm.variables.split('\n').reduce((acc, line) => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length) {
              acc[key.trim()] = valueParts.join('=').trim();
            }
            return acc;
          }, {} as Record<string, string>);
        }
      }

      const { data, error } = await supabase.functions.invoke('send-email-instantly', {
        body: {
          to: emails,
          campaign_id: campaignForm.campaign_id,
          variables: Object.keys(variables).length > 0 ? variables : undefined,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success!',
        description: `Added ${emails.length} lead(s) to campaign`,
      });

      // Reset form
      setCampaignForm({
        campaign_id: '',
        emails: '',
        variables: '',
      });
    } catch (error: any) {
      console.error('Error adding to campaign:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add leads to campaign',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Instantly.ai Campaign Management</h2>
        <p className="text-gray-600">
          Manage cold email campaigns, send emails, and add leads to campaigns.
          The Instantly.ai MCP is configured in Cursor for AI assistant use.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Send Email
          </TabsTrigger>
          <TabsTrigger value="campaign">
            <Users className="h-4 w-4 mr-2" />
            Add to Campaign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Cold Email</CardTitle>
              <CardDescription>
                Send individual emails via Instantly.ai or Uptics.io
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Email Provider</Label>
                  <select
                    id="provider"
                    value={emailForm.provider}
                    onChange={(e) => setEmailForm({ ...emailForm, provider: e.target.value as 'instantly' | 'uptics' })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="instantly">Instantly.ai (Unlimited)</option>
                    <option value="uptics">Uptics.io (Good Limits)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="to">To Email(s) *</Label>
                  <Input
                    id="to"
                    type="text"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    placeholder="email@example.com or email1@example.com, email2@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Introduction to Disclosurely"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={emailForm.from_name}
                    onChange={(e) => setEmailForm({ ...emailForm, from_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={emailForm.from_email}
                    onChange={(e) => setEmailForm({ ...emailForm, from_email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="html">HTML Content *</Label>
                <Textarea
                  id="html"
                  value={emailForm.html}
                  onChange={(e) => setEmailForm({ ...emailForm, html: e.target.value })}
                  placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="text">Plain Text Content (Optional)</Label>
                <Textarea
                  id="text"
                  value={emailForm.text}
                  onChange={(e) => setEmailForm({ ...emailForm, text: e.target.value })}
                  placeholder="Plain text version of your email"
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendEmail} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send via {emailForm.provider === 'instantly' ? 'Instantly.ai' : 'Uptics.io'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Leads to Campaign</CardTitle>
              <CardDescription>
                Add email addresses to an existing Instantly.ai campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaign_id">Campaign ID *</Label>
                <Input
                  id="campaign_id"
                  value={campaignForm.campaign_id}
                  onChange={(e) => setCampaignForm({ ...campaignForm, campaign_id: e.target.value })}
                  placeholder="Your Instantly.ai campaign ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this in your Instantly.ai dashboard
                </p>
              </div>

              <div>
                <Label htmlFor="emails">Email Addresses *</Label>
                <Textarea
                  id="emails"
                  value={campaignForm.emails}
                  onChange={(e) => setCampaignForm({ ...campaignForm, emails: e.target.value })}
                  placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  One email address per line
                </p>
              </div>

              <div>
                <Label htmlFor="variables">Template Variables (Optional)</Label>
                <Textarea
                  id="variables"
                  value={campaignForm.variables}
                  onChange={(e) => setCampaignForm({ ...campaignForm, variables: e.target.value })}
                  placeholder='{"first_name": "John", "company_name": "Acme Corp"}&#10;Or:&#10;first_name=John&#10;company_name=Acme Corp'
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON format or key=value pairs (one per line)
                </p>
              </div>

              <Button 
                onClick={handleAddToCampaign} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Add Leads to Campaign
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Function Endpoints:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Instantly.ai: <code className="bg-gray-100 px-1 rounded">send-email-instantly</code></li>
                <li>Uptics.io: <code className="bg-gray-100 px-1 rounded">send-email-uptics</code></li>
              </ul>
              <p className="mt-4"><strong>Note:</strong> The Instantly.ai MCP server is configured in Cursor for AI assistant use. This UI uses Supabase Edge Functions to interact with the Instantly.ai API.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

