/**
 * Example component showing how to send cold emails via Uptics.io
 * 
 * This is a reference implementation - adapt it to your needs!
 */

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const ColdEmailSender: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    html: '',
    from_name: 'Sam Pettiford',
    from_email: 'support@disclosurely.com',
  });

  const handleSend = async () => {
    if (!formData.to || !formData.subject || !formData.html) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-email-uptics', {
        body: {
          to: formData.to,
          subject: formData.subject,
          html: formData.html,
          from_name: formData.from_name,
          from_email: formData.from_email,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success!',
        description: 'Email sent via Uptics.io',
      });

      // Reset form
      setFormData({
        to: '',
        subject: '',
        html: '',
        from_name: 'Sam Pettiford',
        from_email: 'support@disclosurely.com',
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Send Cold Email</h2>
        <p className="text-gray-600">Send emails via Uptics.io</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="to">To Email *</Label>
          <Input
            id="to"
            type="email"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            placeholder="prospect@company.com"
          />
        </div>

        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Introduction to Disclosurely"
          />
        </div>

        <div>
          <Label htmlFor="from_name">From Name</Label>
          <Input
            id="from_name"
            value={formData.from_name}
            onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="from_email">From Email</Label>
          <Input
            id="from_email"
            type="email"
            value={formData.from_email}
            onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="html">Email Content (HTML) *</Label>
          <Textarea
            id="html"
            value={formData.html}
            onChange={(e) => setFormData({ ...formData, html: e.target.value })}
            placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
            rows={10}
          />
        </div>

        <Button 
          onClick={handleSend} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send via Uptics.io'}
        </Button>
      </div>
    </div>
  );
};

