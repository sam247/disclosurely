import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GDPRRequest {
  id: string;
  email_address: string;
  organization_id: string;
  status: string;
  request_type?: string;
  erasure_type?: string;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[GDPR-PROCESSOR] Starting GDPR request processing...');
    const body = await req.json().catch(() => null) as { type?: string; email?: string } | null;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Check for authenticated user requests (delete_data or delete_account)
    if (body?.type === 'delete_data' || body?.type === 'delete_account') {
      // Verify authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Verify user owns the email
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (user.email !== body.email) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete data for other users' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Enqueue the appropriate request
      if (body.type === 'delete_data') {
        console.log('[GDPR-PROCESSOR] Enqueuing data deletion (anonymize) for', body.email);
        await supabase
          .from('data_erasure_requests')
          .insert({ 
            email_address: body.email, 
            status: 'approved', 
            erasure_type: 'delete_personal_data',
            requested_by: user.id
          });
      } else if (body.type === 'delete_account') {
        console.log('[GDPR-PROCESSOR] Enqueuing full account deletion for', body.email);
        await supabase
          .from('data_erasure_requests')
          .insert({ 
            email_address: body.email, 
            status: 'approved', 
            erasure_type: 'full_erasure',
            requested_by: user.id
          });
      }
    }
    
    // Legacy support for unauthenticated requests (for backward compatibility)
    else if (body?.type === 'export' && body.email) {
      console.log('[GDPR-PROCESSOR] Enqueuing export request for', body.email);
      await supabase
        .from('data_export_requests')
        .insert({ email_address: body.email, status: 'pending', request_type: 'full_export' });
    }

    // Process pending export and erasure requests
    await processExportRequests(supabase, resend);
    await processErasureRequests(supabase);

    console.log('[GDPR-PROCESSOR] All GDPR requests processed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'GDPR requests processed' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('[GDPR-PROCESSOR] Error processing GDPR requests:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

async function processExportRequests(supabase: any, resend: any | null) {
  console.log('[GDPR-PROCESSOR] Processing export requests...');
  
  // Get pending export requests
  const { data: exportRequests, error: exportError } = await supabase
    .from('data_export_requests')
    .select('*')
    .eq('status', 'pending');

  if (exportError) {
    console.error('[GDPR-PROCESSOR] Error fetching export requests:', exportError);
    return;
  }

  for (const request of exportRequests || []) {
    try {
      console.log(`[GDPR-PROCESSOR] Processing export request ${request.id} for ${request.email_address}`);
      
      // Update status to processing
      await supabase
        .from('data_export_requests')
        .update({ status: 'processing' })
        .eq('id', request.id);

      // Generate export data based on request type
      const exportData = await generateExportData(supabase, request);
      
      // Create export file (in a real implementation, you'd upload to storage)
      const exportJson = JSON.stringify(exportData, null, 2);
      const exportFileName = `data-export-${request.id}.json`;
      
      // For now, we'll simulate file creation and provide a download URL
      const mockFileUrl = `https://example.com/exports/${exportFileName}`;

      // Update request as completed
      await supabase
        .from('data_export_requests')
        .update({
          status: 'completed',
          export_file_url: mockFileUrl,
          completed_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .eq('id', request.id);

      // Notify user via email if Resend is configured
      if (resend) {
        try {
          const emailResponse = await resend.emails.send({
            from: 'Disclosurely <onboarding@resend.dev>',
            to: [request.email_address],
            subject: 'Your data export is ready',
            html: `
              <h2>Your data export is ready</h2>
              <p>Click the link below to download your data export. The link will expire in 7 days.</p>
              <p><a href="${mockFileUrl}">Download your data export</a></p>
              <p>If you did not request this, please ignore this email.</p>
            `,
          });
          console.log('[GDPR-PROCESSOR] Email sent:', emailResponse);
        } catch (emailErr) {
          console.error('[GDPR-PROCESSOR] Failed to send email:', emailErr);
        }
      } else {
        console.warn('[GDPR-PROCESSOR] RESEND_API_KEY not configured; skipping email sending');
      }

      console.log(`[GDPR-PROCESSOR] Export request ${request.id} completed`);
    } catch (error) {
      console.error(`[GDPR-PROCESSOR] Error processing export request ${request.id}:`, error);
      
      // Mark as failed
      await supabase
        .from('data_export_requests')
        .update({ status: 'failed' })
        .eq('id', request.id);
    }
  }
}

async function processErasureRequests(supabase: any) {
  console.log('[GDPR-PROCESSOR] Processing erasure requests...');
  
  // Get approved erasure requests
  const { data: erasureRequests, error: erasureError } = await supabase
    .from('data_erasure_requests')
    .select('*')
    .eq('status', 'approved');

  if (erasureError) {
    console.error('[GDPR-PROCESSOR] Error fetching erasure requests:', erasureError);
    return;
  }

  for (const request of erasureRequests || []) {
    try {
      console.log(`[GDPR-PROCESSOR] Processing erasure request ${request.id} for ${request.email_address}`);
      
      // Perform data erasure based on erasure type
      await performDataErasure(supabase, request);

      // Update request as completed
      await supabase
        .from('data_erasure_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      console.log(`[GDPR-PROCESSOR] Erasure request ${request.id} completed`);
    } catch (error) {
      console.error(`[GDPR-PROCESSOR] Error processing erasure request ${request.id}:`, error);
      
      // Mark as failed
      await supabase
        .from('data_erasure_requests')
        .update({ status: 'failed' })
        .eq('id', request.id);
    }
  }
}

async function generateExportData(supabase: any, request: GDPRRequest) {
  const exportData: any = {
    request_info: {
      request_id: request.id,
      email_address: request.email_address,
      request_type: request.request_type,
      generated_at: new Date().toISOString()
    },
    data: {}
  };

  try {
    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', request.email_address)
      .single();

    if (profile) {
      exportData.data.profile = profile;

      // Export reports if user has submitted any
      const { data: reports } = await supabase
        .from('reports')
        .select('*')
        .eq('submitted_by_email', request.email_address);

      if (reports && reports.length > 0) {
        exportData.data.reports = reports.map((report: any) => ({
          ...report,
          encrypted_content: '[ENCRYPTED]', // Don't export encrypted content
          encryption_key_hash: '[REDACTED]'
        }));
      }

      // Export messages if any
      const { data: messages } = await supabase
        .from('report_messages')
        .select('*')
        .eq('sender_id', profile.id);

      if (messages && messages.length > 0) {
        exportData.data.messages = messages.map((msg: any) => ({
          ...msg,
          encrypted_message: '[ENCRYPTED]' // Don't export encrypted messages
        }));
      }
    }
  } catch (error) {
    console.error('[GDPR-PROCESSOR] Error generating export data:', error);
    exportData.data.error = 'Some data could not be retrieved';
  }

  return exportData;
}

async function performDataErasure(supabase: any, request: GDPRRequest) {
  const { email_address, erasure_type } = request;

  // Find user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, organization_id')
    .eq('email', email_address)
    .single();

  if (!profile) {
    console.log(`[GDPR-PROCESSOR] No profile found for ${email_address}, checking for anonymous data`);
  }

  switch (erasure_type) {
    case 'delete_personal_data':
      // Remove personal identifiable information but keep reports anonymized
      if (profile) {
        await supabase
          .from('profiles')
          .update({
            first_name: null,
            last_name: null,
            email: `deleted_${Date.now()}@deleted.local`
          })
          .eq('id', profile.id);
      }
      break;

    case 'anonymize_reports':
      // Anonymize reports submitted by this email
      await supabase
        .from('reports')
        .update({
          submitted_by_email: null,
          title: 'Anonymized Report',
        })
        .eq('submitted_by_email', email_address);
      break;

    case 'full_erasure':
      // COMPLETE data deletion - GDPR compliant
      console.log(`[GDPR-PROCESSOR] Starting full erasure for ${email_address}`);
      
      if (profile) {
        const userId = profile.id;
        const orgId = profile.organization_id;

        // 1. Delete storage files (profile pictures, report attachments, documents)
        console.log('[GDPR-PROCESSOR] Deleting storage files...');
        try {
          // Delete from report-attachments bucket
          const { data: reportFiles } = await supabase.storage
            .from('report-attachments')
            .list(`${userId}/`);
          
          if (reportFiles && reportFiles.length > 0) {
            const filePaths = reportFiles.map((file: any) => `${userId}/${file.name}`);
            await supabase.storage.from('report-attachments').remove(filePaths);
          }

          // Delete from ai-helper-docs bucket
          const { data: aiFiles } = await supabase.storage
            .from('ai-helper-docs')
            .list(`${userId}/`);
          
          if (aiFiles && aiFiles.length > 0) {
            const aiFilePaths = aiFiles.map((file: any) => `${userId}/${file.name}`);
            await supabase.storage.from('ai-helper-docs').remove(aiFilePaths);
          }

          // Delete from organization-logos if user uploaded any
          const { data: logoFiles } = await supabase.storage
            .from('organization-logos')
            .list(`${userId}/`);
          
          if (logoFiles && logoFiles.length > 0) {
            const logoFilePaths = logoFiles.map((file: any) => `${userId}/${file.name}`);
            await supabase.storage.from('organization-logos').remove(logoFilePaths);
          }

          console.log('[GDPR-PROCESSOR] Storage files deleted');
        } catch (storageError) {
          console.error('[GDPR-PROCESSOR] Error deleting storage files:', storageError);
        }

        // 2. Delete AI helper documents records
        await supabase.from('ai_helper_documents').delete().eq('uploaded_by', userId);

        // 3. Delete AI case analyses
        await supabase.from('ai_case_analyses').delete().eq('created_by', userId);

        // 4. Delete compliance evidence uploaded by user
        await supabase.from('compliance_evidence').delete().eq('uploaded_by', userId);

        // 5. Delete compliance calendar events created by user
        await supabase.from('compliance_calendar').delete().eq('created_by', userId);

        // 6. Delete compliance policies created by user
        await supabase.from('compliance_policies').delete().eq('created_by', userId);

        // 7. Delete compliance risks created by user
        await supabase.from('compliance_risks').delete().eq('created_by', userId);

        // 8. Delete user invitations (sent to and by user)
        await supabase.from('user_invitations').delete().eq('invited_email', email_address);
        await supabase.from('user_invitations').delete().eq('invited_by', userId);

        // 9. Delete notifications for the user
        await supabase.from('notifications').delete().eq('user_id', userId);

        // 10. Delete email notifications
        await supabase.from('email_notifications').delete().eq('user_id', userId);
        await supabase.from('email_notifications').delete().eq('email_address', email_address);

        // 11. Delete login attempts
        await supabase.from('login_attempts').delete().eq('email', email_address);

        // 12. Delete report messages sent by user
        await supabase.from('report_messages').delete().eq('sender_id', userId);

        // 13. Delete report notes created by user
        await supabase.from('report_notes').delete().eq('author_id', userId);

        // 14. Handle reports owned/assigned to user
        const { data: userReports } = await supabase
          .from('reports')
          .select('id')
          .eq('assigned_to', userId);
        
        if (userReports && userReports.length > 0) {
          for (const report of userReports) {
            // Delete report attachments
            await supabase.from('report_attachments').delete().eq('report_id', report.id);
            // Delete report messages
            await supabase.from('report_messages').delete().eq('report_id', report.id);
            // Delete report notes
            await supabase.from('report_notes').delete().eq('report_id', report.id);
          }
          // Delete the reports themselves
          await supabase.from('reports').delete().eq('assigned_to', userId);
        }

        // 15. Handle reports submitted by email
        const { data: submittedReports } = await supabase
          .from('reports')
          .select('id')
          .eq('submitted_by_email', email_address);
        
        if (submittedReports && submittedReports.length > 0) {
          for (const report of submittedReports) {
            await supabase.from('report_attachments').delete().eq('report_id', report.id);
            await supabase.from('report_messages').delete().eq('report_id', report.id);
            await supabase.from('report_notes').delete().eq('report_id', report.id);
          }
          await supabase.from('reports').delete().eq('submitted_by_email', email_address);
        }

        // 16. Anonymize audit logs (keep for compliance but remove PII)
        await supabase
          .from('audit_logs')
          .update({
            actor_id: null,
            actor_email: `deleted_${Date.now()}@deleted.local`,
            actor_ip_address: null,
            actor_user_agent: 'User Deleted'
          })
          .eq('actor_id', userId);

        // Also anonymize logs where user is the target
        await supabase
          .from('audit_logs')
          .update({
            target_id: null,
            metadata: { deleted: true, deleted_at: new Date().toISOString() }
          })
          .eq('target_id', userId);

        // 17. Delete user roles
        await supabase.from('user_roles').delete().eq('user_id', userId);

        // 18. Delete from profiles table
        await supabase.from('profiles').delete().eq('id', userId);

        // 19. Delete from auth.users using admin API
        console.log('[GDPR-PROCESSOR] Deleting from auth.users...');
        try {
          const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
          if (authDeleteError) {
            console.error('[GDPR-PROCESSOR] Error deleting from auth.users:', authDeleteError);
            throw authDeleteError;
          }
          console.log('[GDPR-PROCESSOR] Successfully deleted from auth.users');
        } catch (authError) {
          console.error('[GDPR-PROCESSOR] Failed to delete auth user:', authError);
          throw authError;
        }

        console.log(`[GDPR-PROCESSOR] Full erasure completed for user ${userId}`);
      } else {
        // No profile found, but check for anonymous reports
        const { data: anonymousReports } = await supabase
          .from('reports')
          .select('id')
          .eq('submitted_by_email', email_address);
        
        if (anonymousReports && anonymousReports.length > 0) {
          for (const report of anonymousReports) {
            await supabase.from('report_attachments').delete().eq('report_id', report.id);
            await supabase.from('report_messages').delete().eq('report_id', report.id);
            await supabase.from('report_notes').delete().eq('report_id', report.id);
          }
          await supabase.from('reports').delete().eq('submitted_by_email', email_address);
        }

        // Delete email notifications and login attempts for anonymous users
        await supabase.from('email_notifications').delete().eq('email_address', email_address);
        await supabase.from('login_attempts').delete().eq('email', email_address);
      }
      break;

    default:
      throw new Error(`Unknown erasure type: ${erasure_type}`);
  }

  console.log(`[GDPR-PROCESSOR] Data erasure completed for ${email_address} (${erasure_type})`);
}
