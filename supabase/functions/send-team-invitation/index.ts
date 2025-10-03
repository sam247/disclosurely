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
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                    <!-- Header with branding -->
                    <tr>
                      <td style="background: linear-gradient(135deg, ${invitation.organization.brand_color || '#2563eb'} 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">DISCLOSURELY</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 14px;">Secure Whistleblowing Platform</p>
                      </td>
                    </tr>
                    
                    <!-- Main content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <div style="display: inline-block; background: #eff6ff; border-radius: 50%; padding: 16px; margin-bottom: 20px;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="${invitation.organization.brand_color || '#2563eb'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <circle cx="9" cy="7" r="4" stroke="${invitation.organization.brand_color || '#2563eb'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="${invitation.organization.brand_color || '#2563eb'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </div>
                          <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">You're Invited!</h2>
                          <p style="color: #6b7280; margin: 0; font-size: 14px;">Join ${invitation.organization.name} on Disclosurely</p>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                          Hi there,
                        </p>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                          <strong style="color: #111827;">${inviterName}</strong> has invited you to join <strong style="color: #111827;">${invitation.organization.name}</strong> as a <strong style="color: #111827;">${invitation.role.replace('_', ' ')}</strong>.
                        </p>
                        
                        <div style="background: #f9fafb; border-left: 4px solid ${invitation.organization.brand_color || '#2563eb'}; padding: 16px; margin: 24px 0; border-radius: 4px;">
                          <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0;">
                            Disclosurely is a secure platform for managing whistleblower reports and compliance cases. You'll be able to review reports, communicate securely, and help maintain organizational integrity.
                          </p>
                        </div>
                        
                        <div style="text-align: center; margin: 32px 0;">
                          <a href="${inviteUrl}" style="background: ${invitation.organization.brand_color || '#2563eb'}; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                            Accept Invitation
                          </a>
                        </div>
                        
                        <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin: 24px 0;">
                          <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; font-weight: 600;">Or copy and paste this link:</p>
                          <p style="font-size: 12px; color: #2563eb; margin: 0; word-break: break-all;">
                            <a href="${inviteUrl}" style="color: #2563eb; text-decoration: none;">${inviteUrl}</a>
                          </p>
                        </div>
                        
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0; border-radius: 4px;">
                          <p style="font-size: 13px; color: #92400e; margin: 0;">
                            ⏱️ This invitation expires on <strong>${new Date(invitation.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                          </p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
                          If you didn't expect this invitation, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">
                          © ${new Date().getFullYear()} Disclosurely. All rights reserved.
                        </p>
                        <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                          Secure whistleblowing and compliance management platform
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
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
