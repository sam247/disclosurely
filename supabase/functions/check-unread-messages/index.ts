
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@4.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting unread messages check...')
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    console.log('Checking for unread messages older than:', twentyFourHoursAgo.toISOString())

    // Find unread messages from organization to whistleblowers that are 24+ hours old
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('report_messages')
      .select(`
        id,
        report_id,
        created_at,
        reports!inner(
          tracking_id,
          title,
          submitted_by_email,
          organization_id,
          organizations!inner(
            name
          )
        )
      `)
      .eq('sender_type', 'organization')
      .eq('is_read', false)
      .lt('created_at', twentyFourHoursAgo.toISOString())

    if (messagesError) {
      console.error('Error fetching unread messages:', messagesError)
      throw messagesError
    }

    console.log(`Found ${unreadMessages?.length || 0} unread messages`)

    if (!unreadMessages || unreadMessages.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No unread messages found',
        count: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let emailsSent = 0
    const processedReports = new Set()

    // Group messages by report to avoid sending multiple emails for the same report
    for (const message of unreadMessages) {
      const report = message.reports
      const trackingId = report.tracking_id
      
      // Skip if we've already processed this report
      if (processedReports.has(trackingId)) {
        continue
      }

      processedReports.add(trackingId)

      // Only send if there's an email address
      if (report.submitted_by_email) {
        try {
          console.log(`Sending notification for report ${trackingId}`)
          
          const { error: emailError } = await resend.emails.send({
            from: 'Disclosurely <notifications@disclosurely.com>',
            to: [report.submitted_by_email],
            subject: `New response to your report ${trackingId}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Response Available</h2>
                <p>Hello,</p>
                <p>You have received a new response regarding your report <strong>${trackingId}</strong> titled "${report.title}".</p>
                <p>To view the response and continue the conversation, please visit:</p>
                <p><a href="https://app.disclosurely.com/secure/tool/report-status" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Report Status</a></p>
                <p>You will need your tracking ID: <strong>${trackingId}</strong></p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #6b7280;">
                  This is an automated notification from ${report.organizations.name}. 
                  For security reasons, please do not reply to this email directly.
                </p>
              </div>
            `,
          })

          if (emailError) {
            console.error(`Error sending email for report ${trackingId}:`, emailError)
          } else {
            console.log(`Email sent successfully for report ${trackingId}`)
            emailsSent++
          }
        } catch (emailSendError) {
          console.error(`Failed to send email for report ${trackingId}:`, emailSendError)
        }
      }
    }

    console.log(`Process completed. Emails sent: ${emailsSent}`)

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${unreadMessages.length} unread messages, sent ${emailsSent} emails`,
      unreadMessagesCount: unreadMessages.length,
      emailsSent
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in check-unread-messages function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
