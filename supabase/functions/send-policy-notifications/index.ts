import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createEmailTemplate } from '../shared/email-template.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface PolicyNotificationRequest {
  type: 'assignment' | 'reminder';
  policy_id?: string;
  user_ids?: string[];
}

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle both manual triggers and cron job triggers
    let notificationData: PolicyNotificationRequest;
    
    if (req.headers.get('x-cron-job') === 'true') {
      // Cron job trigger - send reminders for all due policies
      notificationData = { type: 'reminder' };
    } else {
      // Manual trigger - send specific notifications
      notificationData = await req.json();
    }

    const { type } = notificationData;

    if (type === 'assignment') {
      // Send assignment notifications
      await handleAssignmentNotifications(supabase, notificationData);
    } else if (type === 'reminder') {
      // Send reminder notifications
      await handleReminderNotifications(supabase);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending policy notifications:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function handleAssignmentNotifications(
  supabase: any,
  data: PolicyNotificationRequest
) {
  const { policy_id, user_ids } = data;

  if (!policy_id || !user_ids || user_ids.length === 0) {
    throw new Error('policy_id and user_ids are required for assignment notifications');
  }

  // Get policy details
  const { data: policy, error: policyError } = await supabase
    .from('compliance_policies')
    .select('policy_name, policy_description, organization_id')
    .eq('id', policy_id)
    .single();

  if (policyError) throw policyError;

  // Get organization details
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', policy.organization_id)
    .single();

  if (orgError) throw orgError;

  // Get user details
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('email, first_name, last_name')
    .in('id', user_ids);

  if (usersError) throw usersError;

  // Send email to each user
  for (const user of users) {
    const emailHTML = createEmailTemplate({
      title: 'New Policy Requires Your Acknowledgment',
      organizationName: org.name,
      brandColor: '#2563eb',
      content: `
        <h2 style="color: #2563eb; margin-top: 0;">New Policy Assignment</h2>
        <p style="margin: 16px 0;">Hi ${user.first_name || 'there'},</p>
        <p style="margin: 16px 0;">
          A new policy has been assigned to you and requires your acknowledgment:
        </p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 24px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937;">${policy.policy_name}</h3>
          ${policy.policy_description ? `<p style="margin: 8px 0 0 0; color: #6b7280;">${policy.policy_description}</p>` : ''}
        </div>
        <p style="margin: 16px 0;">
          Please review and acknowledge this policy as soon as possible.
        </p>
      `,
      ctaButton: {
        text: 'Review Policy',
        url: `${SUPABASE_URL.replace('.supabase.co', '')}/dashboard/my-policies`
      },
      footerText: `This policy was assigned by ${org.name}. You can review all your assigned policies in your dashboard.`
    });

    await sendEmail({
      to: user.email,
      subject: `New Policy Assignment: ${policy.policy_name}`,
      html: emailHTML
    });
  }
}

async function handleReminderNotifications(supabase: any) {
  // Get all pending acknowledgments that are due soon or overdue
  const { data: pending, error } = await supabase
    .from('pending_policy_acknowledgments')
    .select('*')
    .or('status.eq.due_soon,status.eq.overdue');

  if (error) throw error;

  if (!pending || pending.length === 0) {
    console.log('No pending acknowledgments require reminders');
    return;
  }

  // Group by user to send one email per user
  const userPolicies = new Map<string, any[]>();
  for (const item of pending) {
    if (!userPolicies.has(item.user_id)) {
      userPolicies.set(item.user_id, []);
    }
    userPolicies.get(item.user_id)!.push(item);
  }

  // Send reminders
  for (const [userId, policies] of userPolicies.entries()) {
    const user = policies[0]; // All items have same user info
    const overdueCount = policies.filter(p => p.status === 'overdue').length;
    const dueSoonCount = policies.filter(p => p.status === 'due_soon').length;

    const policyListHTML = policies.map(p => `
      <div style="background: ${p.status === 'overdue' ? '#fef2f2' : '#fef3c7'}; 
                  padding: 12px; 
                  border-radius: 6px; 
                  border-left: 4px solid ${p.status === 'overdue' ? '#dc2626' : '#f59e0b'}; 
                  margin: 8px 0;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <strong>${p.policy_name}</strong>
            ${p.due_date ? `<div style="font-size: 14px; color: #6b7280; margin-top: 4px;">
              Due: ${new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>` : ''}
          </div>
          <span style="background: ${p.status === 'overdue' ? '#dc2626' : '#f59e0b'}; 
                       color: white; 
                       padding: 4px 8px; 
                       border-radius: 4px; 
                       font-size: 12px; 
                       font-weight: 600;">
            ${p.status === 'overdue' ? 'OVERDUE' : 'DUE SOON'}
          </span>
        </div>
      </div>
    `).join('');

    const emailHTML = createEmailTemplate({
      title: 'Policy Acknowledgment Reminder',
      brandColor: overdueCount > 0 ? '#dc2626' : '#f59e0b',
      content: `
        <h2 style="color: ${overdueCount > 0 ? '#dc2626' : '#f59e0b'}; margin-top: 0;">
          ${overdueCount > 0 ? '⚠️ Urgent: ' : ''}Policy Acknowledgment ${overdueCount > 0 ? 'Overdue' : 'Reminder'}
        </h2>
        <p style="margin: 16px 0;">Hi ${user.first_name || 'there'},</p>
        <p style="margin: 16px 0;">
          You have ${overdueCount + dueSoonCount} ${overdueCount + dueSoonCount === 1 ? 'policy' : 'policies'} requiring your acknowledgment:
        </p>
        ${overdueCount > 0 ? `<p style="margin: 16px 0; color: #dc2626; font-weight: 600;">
          ${overdueCount} ${overdueCount === 1 ? 'policy is' : 'policies are'} overdue
        </p>` : ''}
        ${dueSoonCount > 0 ? `<p style="margin: 16px 0; color: #f59e0b; font-weight: 600;">
          ${dueSoonCount} ${dueSoonCount === 1 ? 'policy is' : 'policies are'} due soon
        </p>` : ''}
        <div style="margin: 24px 0;">
          ${policyListHTML}
        </div>
        <p style="margin: 16px 0;">
          Please review and acknowledge ${(overdueCount + dueSoonCount) === 1 ? 'this policy' : 'these policies'} as soon as possible to maintain compliance.
        </p>
      `,
      ctaButton: {
        text: 'Review Pending Policies',
        url: `${SUPABASE_URL.replace('.supabase.co', '')}/dashboard/my-policies`
      },
      footerText: 'You can manage all your policy acknowledgments in your dashboard.'
    });

    await sendEmail({
      to: user.user_email,
      subject: overdueCount > 0 
        ? `⚠️ Urgent: ${overdueCount} Overdue Policy Acknowledgment${overdueCount > 1 ? 's' : ''}`
        : `Reminder: ${dueSoonCount} Policy Acknowledgment${dueSoonCount > 1 ? 's' : ''} Due Soon`,
      html: emailHTML
    });

    // Mark reminder as sent - BATCH UPDATE to prevent N+1 query
    const assignmentIds = policies.map(p => p.assignment_id);
    const { error: updateError } = await supabase
      .from('policy_assignments')
      .update({ 
        reminder_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', assignmentIds);
    
    if (updateError) {
      console.error('Failed to mark reminders as sent:', updateError);
    }
  }
}

async function sendEmail(params: { to: string; subject: string; html: string }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Disclosurely <notifications@disclosurely.com>',
      to: params.to,
      subject: params.subject,
      html: params.html
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

