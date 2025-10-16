import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

// Shared email template utility
const createEmailTemplate = (options: {
  title: string;
  content: string;
  organizationName?: string;
  brandColor?: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  footerText?: string;
}) => {
  const { title, content, organizationName, brandColor = '#000000', ctaButton, footerText } = options;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                <!-- Header with Disclosurely logo -->
                <tr>
                  <td style="background: #000000; padding: 20px 30px; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                      <div style="background: white; padding: 8px 12px; border-radius: 4px; margin-right: 12px;">
                        <span style="color: #000000; font-weight: bold; font-size: 16px;">DISCLOSURELY</span>
                      </div>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${title}</h1>
                    ${organizationName ? `<p style="color: rgba(255, 255, 255, 0.8); margin: 5px 0 0 0; font-size: 14px;">${organizationName}</p>` : ''}
                  </td>
                </tr>
                
                <!-- Main content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    ${content}
                    
                    ${ctaButton ? `
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${ctaButton.url}" style="background: ${brandColor}; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                          ${ctaButton.text}
                        </a>
                      </div>
                    ` : ''}
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
                      ${footerText || 'This is an automated notification from Disclosurely. If you believe you received this email in error, please contact your administrator.'}
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
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, otp, type = 'signup' } = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate OTP email HTML using the new template
    const emailHtml = createEmailTemplate({
      title: 'Your Verification Code',
      content: `
        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
          Thank you for joining Disclosurely! To complete your account setup, please use the verification code below:
        </p>
        
        <div style="background: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007bff; font-family: 'Courier New', monospace;">${otp}</div>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
          Enter this 6-digit code in the verification form to activate your account.
        </p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; color: #856404;">
          <strong>Security Note:</strong> This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
          If you have any questions or need assistance, please contact our support team.
        </p>
      `,
      footerText: 'If you didn\'t request this verification code, please ignore this email.'
    });

    const subject = type === 'signup' 
      ? 'Complete Your Disclosurely Account Setup' 
      : 'Your Disclosurely Verification Code';

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Disclosurely <notifications@disclosurely.com>',
      to: [email],
      subject: subject,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending OTP email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OTP email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailData.id,
        message: 'Verification email sent successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-otp-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
