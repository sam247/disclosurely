import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { invitationId } = await req.json();

    if (!invitationId) {
      return new Response(
        JSON.stringify({ error: 'Invitation ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch invitation details
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('user_invitations')
      .select(`
        *,
        organization:organizations (
          name,
          brand_color
        ),
        invited_by_profile:profiles!user_invitations_invited_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: 'Invitation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation is still valid
    if (invitation.accepted_at) {
      return new Response(
        JSON.stringify({ error: 'Invitation already accepted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invitation has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const inviterName = (invitation.invited_by_profile?.first_name || invitation.invited_by_profile?.last_name)
      ? `${invitation.invited_by_profile?.first_name ?? ''} ${invitation.invited_by_profile?.last_name ?? ''}`.trim()
      : (invitation.invited_by_profile?.email ?? 'Your team');

    const inviteUrl = `https://app.disclosurely.com/invite/${invitation.token}`;

    const subject = `You've been invited to join ${invitation.organization.name} on Disclosurely`;

    // Send email via Resend and log to email_notifications (same pattern as new-report notifications)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Disclosurely <notifications@disclosurely.com>',
      to: [invitation.email],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Team Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, ${invitation.organization.brand_color || '#2563eb'} 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited!</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hi there,
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${inviterName}</strong> has invited you to join <strong>${invitation.organization.name}</strong> on Disclosurely as a <strong>${invitation.role.replace('_', ' ')}</strong>.
              </p>
              
              <p style="font-size: 16px; margin-bottom: 30px;">
                Disclosurely is a secure platform for managing whistleblower reports and compliance cases. Click the button below to accept your invitation and create your account.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background: ${invitation.organization.brand_color || '#2563eb'}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                This invitation will expire on ${new Date(invitation.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Disclosurely. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    // Log outcome to email_notifications for observability
    try {
      await supabaseClient
        .from('email_notifications')
        .insert({
          user_id: invitation.invited_by ?? null,
          organization_id: invitation.organization_id,
          report_id: null,
          notification_type: 'team_invitation',
          email_address: invitation.email,
          subject,
          status: emailError ? 'failed' : 'sent',
          metadata: {
            resend_id: emailData?.id ?? null,
            invitation_id: invitation.id,
            token: invitation.token,
            invite_url: inviteUrl,
            inviter_name: inviterName
          }
        })
    } catch (logError) {
      console.error('Failed to log email notification:', logError)
    }

    if (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Invitation email sent successfully to:', invitation.email);

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-team-invitation:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
