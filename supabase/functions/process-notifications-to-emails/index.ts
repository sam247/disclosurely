import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Logging utility
const logToSystem = async (level: string, context: string, message: string, data?: any) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data: data || {},
      sessionId: 'email-processor',
      requestId: `email-${Date.now()}`
    };

    // Send to logs Edge Function
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify(logEntry)
    });
  } catch (error) {
    console.error('Failed to log to system:', error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Processing notifications to email notifications...');
    await logToSystem('INFO', 'EMAIL_PROCESSING', 'Starting notification to email conversion process');

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get unprocessed notifications (those without corresponding email_notifications)
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        organization_id,
        report_id,
        type,
        title,
        message,
        metadata,
        created_at,
        profiles!inner(email, display_name)
      `)
      .eq('type', 'new_report')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      console.error('❌ Error fetching notifications:', fetchError);
      await logToSystem('ERROR', 'EMAIL_PROCESSING', 'Failed to fetch notifications', { error: fetchError });
      throw fetchError;
    }

    if (!notifications || notifications.length === 0) {
      console.log('✅ No new notifications to process');
      await logToSystem('INFO', 'EMAIL_PROCESSING', 'No notifications found to process');
      return new Response(JSON.stringify({ 
        message: 'No notifications to process',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📧 Found ${notifications.length} notifications to process`);
    await logToSystem('INFO', 'EMAIL_PROCESSING', `Found ${notifications.length} notifications to process`, { count: notifications.length });

    let processed = 0;
    let skipped = 0;

    // Process each notification
    for (const notification of notifications) {
      try {
        // Check if email notification already exists
        const { data: existingEmail, error: checkError } = await supabase
          .from('email_notifications')
          .select('id')
          .eq('report_id', notification.report_id)
          .eq('email_address', notification.profiles.email)
          .eq('notification_type', notification.type)
          .maybeSingle();

        if (checkError) {
          console.error('❌ Error checking existing email notification:', checkError);
          continue;
        }

        if (existingEmail) {
          console.log(`⏭️ Skipping notification ${notification.id} - email already sent`);
          await logToSystem('INFO', 'EMAIL_PROCESSING', 'Skipping duplicate notification', { 
            notificationId: notification.id, 
            email: notification.profiles.email 
          });
          skipped++;
          continue;
        }

        // Create email notification record
        const { error: insertError } = await supabase
          .from('email_notifications')
          .insert({
            user_id: notification.user_id,
            organization_id: notification.organization_id,
            report_id: notification.report_id,
            email_address: notification.profiles.email,
            subject: notification.title,
            notification_type: notification.type,
            status: 'pending',
            metadata: notification.metadata
          });

        if (insertError) {
          console.error('❌ Error creating email notification:', insertError);
          await logToSystem('ERROR', 'EMAIL_PROCESSING', 'Failed to create email notification', { 
            error: insertError, 
            notificationId: notification.id 
          });
          continue;
        }

        console.log(`✅ Created email notification for ${notification.profiles.email}`);
        await logToSystem('INFO', 'EMAIL_PROCESSING', 'Created email notification', { 
          notificationId: notification.id, 
          email: notification.profiles.email,
          reportId: notification.report_id 
        });
        processed++;

      } catch (error) {
        console.error('❌ Error processing notification:', error);
        continue;
      }
    }

    console.log(`🎯 Processing complete: ${processed} created, ${skipped} skipped`);
    await logToSystem('INFO', 'EMAIL_PROCESSING', 'Processing complete', { 
      processed, 
      skipped, 
      total: notifications.length 
    });

    // Now trigger the email sending process
    if (processed > 0) {
      console.log('📤 Triggering email sending process...');
      await logToSystem('INFO', 'EMAIL_PROCESSING', 'Triggering email sending process', { processed });
      
      try {
        const emailResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/process-pending-email-notifications`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({})
          }
        );

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          console.log('✅ Email sending process completed:', emailResult);
          await logToSystem('INFO', 'EMAIL_PROCESSING', 'Email sending process completed', emailResult);
        } else {
          const errorText = await emailResponse.text();
          console.error('❌ Email sending process failed:', errorText);
          await logToSystem('ERROR', 'EMAIL_PROCESSING', 'Email sending process failed', { error: errorText });
        }
      } catch (error) {
        console.error('❌ Error triggering email sending:', error);
        await logToSystem('ERROR', 'EMAIL_PROCESSING', 'Error triggering email sending', { error });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed,
      skipped,
      total: notifications.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in process-notifications-to-emails:', error);
    await logToSystem('CRITICAL', 'EMAIL_PROCESSING', 'Critical error in email processing', { error });
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: (error as Error).message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
