import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { createEmailTemplate } from '../shared/email-template.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const today = new Date();
    const emailsSent = {
      policyReviews: 0,
      riskAlerts: 0,
      calendarReminders: 0,
      overdueAlerts: 0
    };

    console.log('🔔 Starting compliance reminders check...');

    // ============================================================================
    // 1. POLICY REVIEW REMINDERS (30/7/3/1 days before)
    // ============================================================================
    const reminderDays = [30, 7, 3, 1];
    
    for (const days of reminderDays) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + days);
      targetDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      const { data: policiesDueReview, error: policiesError } = await supabase
        .from('compliance_policies')
        .select(`
          id,
          policy_name,
          policy_type,
          next_review_date,
          owner_name,
          organization_id,
          organizations (
            name,
            brand_color
          )
        `)
        .gte('next_review_date', targetDate.toISOString().split('T')[0])
        .lt('next_review_date', nextDay.toISOString().split('T')[0])
        .eq('status', 'active');

      if (!policiesError && policiesDueReview && policiesDueReview.length > 0) {
        console.log(`📋 Found ${policiesDueReview.length} policies due for review in ${days} days`);

        for (const policy of policiesDueReview) {
          // Get org admins
          const { data: admins } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('organization_id', policy.organization_id)
            .eq('role', 'org_admin');

          if (admins && admins.length > 0) {
            for (const admin of admins) {
              if (!admin.email) continue;

              const urgencyColor = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#3b82f6';
              const urgencyText = days === 1 ? 'TOMORROW' : days <= 3 ? 'URGENT' : '';

              const emailHtml = createEmailTemplate({
                title: 'Policy Review Reminder',
                organizationName: (policy.organizations as any)?.name,
                brandColor: (policy.organizations as any)?.brand_color || '#2563eb',
                content: `
                  <p style="font-size: 16px; line-height: 1.6; color: #1f2937; margin: 0 0 20px 0;">
                    Hello ${admin.full_name || 'there'},
                  </p>

                  <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                    This is a reminder that the following policy is due for review ${days === 1 ? 'tomorrow' : `in ${days} days`}:
                  </p>

                  <div style="background: #f9fafb; border: 2px solid ${urgencyColor}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    ${urgencyText ? `<div style="background: ${urgencyColor}; color: white; display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">${urgencyText}</div>` : ''}
                    <p style="margin: 0 0 8px 0;"><strong>Policy:</strong> ${policy.policy_name}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Type:</strong> ${policy.policy_type.replace('_', ' ')}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Review Date:</strong> ${new Date(policy.next_review_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    ${policy.owner_name ? `<p style="margin: 0;"><strong>Owner:</strong> ${policy.owner_name}</p>` : ''}
                  </div>

                  <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
                    Please review and update this policy to ensure ongoing compliance.
                  </p>
                `,
                ctaButton: {
                  text: 'Review Policy',
                  url: 'https://app.disclosurely.com/dashboard/compliance/policies'
                },
                footerText: 'This is an automated reminder from Disclosurely. You are receiving this because you are an administrator for this organization.'
              });

              await resend.emails.send({
                from: 'Disclosurely <notifications@disclosurely.com>',
                to: [admin.email],
                subject: `${urgencyText ? `${urgencyText}: ` : ''}Policy Review Due - ${policy.policy_name}`,
                html: emailHtml,
              });

              emailsSent.policyReviews++;
            }
          }
        }
      }
    }

    // ============================================================================
    // 2. HIGH RISK ALERTS (New high-risk items in last 24 hours)
    // ============================================================================
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const { data: highRisks, error: risksError } = await supabase
      .from('compliance_risks')
      .select(`
        id,
        risk_title,
        category,
        risk_score,
        likelihood,
        impact,
        owner_name,
        organization_id,
        organizations (
          name,
          brand_color
        )
      `)
      .gte('created_at', yesterday.toISOString())
      .gte('risk_score', 15);

    if (!risksError && highRisks && highRisks.length > 0) {
      console.log(`⚠️  Found ${highRisks.length} new high-risk items`);

      for (const risk of highRisks) {
        const { data: admins } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('organization_id', risk.organization_id)
          .eq('role', 'org_admin');

        if (admins && admins.length > 0) {
          for (const admin of admins) {
            if (!admin.email) continue;

            const emailHtml = createEmailTemplate({
              title: 'High Risk Alert',
              organizationName: (risk.organizations as any)?.name,
              brandColor: (risk.organizations as any)?.brand_color || '#2563eb',
              content: `
                <p style="font-size: 16px; line-height: 1.6; color: #1f2937; margin: 0 0 20px 0;">
                  Hello ${admin.full_name || 'there'},
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                  A new high-risk item has been added to your risk register and requires immediate attention:
                </p>

                <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; margin: 24px 0;">
                  <div style="background: #ef4444; color: white; display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">HIGH RISK</div>
                  <p style="margin: 0 0 8px 0;"><strong>Risk:</strong> ${risk.risk_title}</p>
                  <p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${risk.category}</p>
                  <p style="margin: 0 0 8px 0;"><strong>Risk Score:</strong> ${risk.risk_score}/25 (Likelihood: ${risk.likelihood}/5, Impact: ${risk.impact}/5)</p>
                  ${risk.owner_name ? `<p style="margin: 0;"><strong>Owner:</strong> ${risk.owner_name}</p>` : ''}
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
                  Please review this risk and implement appropriate mitigation measures.
                </p>
              `,
              ctaButton: {
                text: 'View Risk Register',
                url: 'https://app.disclosurely.com/dashboard/compliance/risks'
              },
              footerText: 'This is an automated alert from Disclosurely. You are receiving this because you are an administrator for this organization.'
            });

            await resend.emails.send({
              from: 'Disclosurely <notifications@disclosurely.com>',
              to: [admin.email],
              subject: `⚠️ High Risk Alert: ${risk.risk_title}`,
              html: emailHtml,
            });

            emailsSent.riskAlerts++;
          }
        }
      }
    }

    // ============================================================================
    // 3. CALENDAR EVENT REMINDERS (7/3/1 days before)
    // ============================================================================
    const eventReminderDays = [7, 3, 1];
    
    for (const days of eventReminderDays) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + days);
      targetDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      const { data: upcomingEvents, error: eventsError } = await supabase
        .from('compliance_calendar')
        .select(`
          id,
          event_title,
          event_type,
          event_description,
          due_date,
          assigned_to_name,
          organization_id,
          organizations (
            name,
            brand_color
          )
        `)
        .gte('due_date', targetDate.toISOString().split('T')[0])
        .lt('due_date', nextDay.toISOString().split('T')[0])
        .in('status', ['pending', 'in_progress']);

      if (!eventsError && upcomingEvents && upcomingEvents.length > 0) {
        console.log(`📅 Found ${upcomingEvents.length} events due in ${days} days`);

        for (const event of upcomingEvents) {
          const { data: admins } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('organization_id', event.organization_id)
            .eq('role', 'org_admin');

          if (admins && admins.length > 0) {
            for (const admin of admins) {
              if (!admin.email) continue;

              const urgencyColor = days === 1 ? '#ef4444' : days <= 3 ? '#f59e0b' : '#3b82f6';

              const emailHtml = createEmailTemplate({
                title: 'Compliance Event Reminder',
                organizationName: (event.organizations as any)?.name,
                brandColor: (event.organizations as any)?.brand_color || '#2563eb',
                content: `
                  <p style="font-size: 16px; line-height: 1.6; color: #1f2937; margin: 0 0 20px 0;">
                    Hello ${admin.full_name || 'there'},
                  </p>

                  <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                    You have a compliance event due ${days === 1 ? 'tomorrow' : `in ${days} days`}:
                  </p>

                  <div style="background: #f9fafb; border: 2px solid ${urgencyColor}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${event.event_title}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Type:</strong> ${event.event_type.replace('_', ' ')}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Due Date:</strong> ${new Date(event.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    ${event.assigned_to_name ? `<p style="margin: 0 0 8px 0;"><strong>Assigned To:</strong> ${event.assigned_to_name}</p>` : ''}
                    ${event.event_description ? `<p style="margin: 0; color: #6b7280; font-size: 14px;">${event.event_description}</p>` : ''}
                  </div>

                  <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
                    Please complete this event on time to maintain compliance.
                  </p>
                `,
                ctaButton: {
                  text: 'View Calendar',
                  url: 'https://app.disclosurely.com/dashboard/compliance/calendar'
                },
                footerText: 'This is an automated reminder from Disclosurely. You are receiving this because you are an administrator for this organization.'
              });

              await resend.emails.send({
                from: 'Disclosurely <notifications@disclosurely.com>',
                to: [admin.email],
                subject: `Compliance Event Due ${days === 1 ? 'Tomorrow' : `in ${days} Days`}: ${event.event_title}`,
                html: emailHtml,
              });

              emailsSent.calendarReminders++;
            }
          }
        }
      }
    }

    // ============================================================================
    // 4. OVERDUE ALERTS (Policies & Calendar Events)
    // ============================================================================
    // Overdue Policies
    const { data: overduePolicies } = await supabase
      .from('compliance_policies')
      .select(`
        id,
        policy_name,
        next_review_date,
        organization_id,
        organizations (
          name,
          brand_color
        )
      `)
      .lt('next_review_date', today.toISOString().split('T')[0])
      .eq('status', 'active');

    // Overdue Calendar Events
    const { data: overdueEvents } = await supabase
      .from('compliance_calendar')
      .select(`
        id,
        event_title,
        due_date,
        organization_id,
        organizations (
          name,
          brand_color
        )
      `)
      .lt('due_date', today.toISOString().split('T')[0])
      .eq('status', 'overdue');

    const totalOverdue = (overduePolicies?.length || 0) + (overdueEvents?.length || 0);

    if (totalOverdue > 0) {
      console.log(`🚨 Found ${totalOverdue} overdue items`);

      // Group by organization
      const orgOverdueMap: Record<string, { policies: any[], events: any[], org: any }> = {};

      overduePolicies?.forEach(policy => {
        if (!orgOverdueMap[policy.organization_id]) {
          orgOverdueMap[policy.organization_id] = { policies: [], events: [], org: policy.organizations };
        }
        orgOverdueMap[policy.organization_id].policies.push(policy);
      });

      overdueEvents?.forEach(event => {
        if (!orgOverdueMap[event.organization_id]) {
          orgOverdueMap[event.organization_id] = { policies: [], events: [], org: event.organizations };
        }
        orgOverdueMap[event.organization_id].events.push(event);
      });

      // Send one email per organization with all overdue items
      for (const [orgId, data] of Object.entries(orgOverdueMap)) {
        const { data: admins } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('organization_id', orgId)
          .eq('role', 'org_admin');

        if (admins && admins.length > 0) {
          for (const admin of admins) {
            if (!admin.email) continue;

            let overdueList = '';
            
            if (data.policies.length > 0) {
              overdueList += '<div style="margin-bottom: 16px;"><strong style="color: #ef4444;">Overdue Policy Reviews:</strong><ul style="margin: 8px 0; padding-left: 20px;">';
              data.policies.forEach((p: any) => {
                overdueList += `<li>${p.policy_name} (Due: ${new Date(p.next_review_date).toLocaleDateString()})</li>`;
              });
              overdueList += '</ul></div>';
            }

            if (data.events.length > 0) {
              overdueList += '<div style="margin-bottom: 16px;"><strong style="color: #ef4444;">Overdue Calendar Events:</strong><ul style="margin: 8px 0; padding-left: 20px;">';
              data.events.forEach((e: any) => {
                overdueList += `<li>${e.event_title} (Due: ${new Date(e.due_date).toLocaleDateString()})</li>`;
              });
              overdueList += '</ul></div>';
            }

            const emailHtml = createEmailTemplate({
              title: 'Overdue Compliance Items',
              organizationName: (data.org as any)?.name,
              brandColor: (data.org as any)?.brand_color || '#2563eb',
              content: `
                <p style="font-size: 16px; line-height: 1.6; color: #1f2937; margin: 0 0 20px 0;">
                  Hello ${admin.full_name || 'there'},
                </p>

                <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; margin: 24px 0;">
                  <div style="background: #ef4444; color: white; display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; margin-bottom: 16px;">OVERDUE</div>
                  <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 16px 0;">
                    You have ${totalOverdue} overdue compliance ${totalOverdue === 1 ? 'item' : 'items'} requiring immediate attention:
                  </p>
                  ${overdueList}
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
                  Please address these overdue items as soon as possible to maintain compliance.
                </p>
              `,
              ctaButton: {
                text: 'View Compliance Dashboard',
                url: 'https://app.disclosurely.com/dashboard/compliance'
              },
              footerText: 'This is an automated alert from Disclosurely. You are receiving this because you are an administrator for this organization.'
            });

            await resend.emails.send({
              from: 'Disclosurely <notifications@disclosurely.com>',
              to: [admin.email],
              subject: `🚨 ${totalOverdue} Overdue Compliance ${totalOverdue === 1 ? 'Item' : 'Items'}`,
              html: emailHtml,
            });

            emailsSent.overdueAlerts++;
          }
        }
      }
    }

    console.log('✅ Compliance reminders completed:', emailsSent);

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending compliance reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

