import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";
import { checkRateLimit, rateLimiters, rateLimitResponse } from '../_shared/rateLimit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCLOSURELY_PRIMARY_COLOR = '#2563eb';
const DISCLOSURELY_LOGO_URL = 'https://app.disclosurely.com/lovable-uploads/416d39db-53ff-402e-a2cf-26d1a3618601.png';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

// Shared email template utility
const createEmailTemplate = (options: {
  title: string;
  subtitle?: string;
  content: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  footerText?: string;
}) => {
  const { title, subtitle, content, ctaButton, footerText } = options;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111827;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 15px 35px rgba(15,23,42,.08);border-collapse:collapse;">
                <tr>
                  <td style="background:${DISCLOSURELY_PRIMARY_COLOR};padding:32px 24px;text-align:center;">
                    <img src="${DISCLOSURELY_LOGO_URL}" alt="Disclosurely" width="160" style="display:block;margin:0 auto 16px auto;" />
                    <h1 style="margin:0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">${title}</h1>
                    ${subtitle ? `<p style=\"margin:12px 0 0 0;font-size:15px;color:rgba(255,255,255,0.9);\">${subtitle}</p>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 28px;">
                    ${content}
                    ${ctaButton ? `
                      <div style=\"text-align:center;margin:36px 0 8px 0;\">
                        <a href=\"${ctaButton.url}\" style=\"display:inline-block;background:${DISCLOSURELY_PRIMARY_COLOR};color:#ffffff;font-weight:600;padding:14px 36px;text-decoration:none;border-radius:8px;box-shadow:0 10px 20px rgba(37,99,235,0.22);\">${ctaButton.text}</a>
                      </div>
                    ` : ''}
                    <p style="margin:40px 0 0 0;font-size:13px;line-height:1.6;color:#6b7280;text-align:center;">
                      ${footerText || 'This is an automated notification from Disclosurely. If you believe you received this email in error, please contact your administrator.'}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;text-align:center;padding:20px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
                    © ${new Date().getFullYear()} Disclosurely. Secure whistleblowing & compliance management platform.
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

  // 🔒 Rate limiting: 5 OTP emails per 15 minutes per IP
  const rateLimit = await checkRateLimit(req, rateLimiters.auth)
  if (!rateLimit.success) {
    console.warn('⚠️ Rate limit exceeded for OTP email')
    return rateLimitResponse(rateLimit, corsHeaders)
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
      subtitle: 'Secure account access for Disclosurely',
      content: `
        <p style=\"font-size:15px;line-height:1.7;color:#1f2937;margin:0 0 18px 0;\">
          Thank you for joining Disclosurely! To complete your account setup, please use the verification code below:
        </p>
        
        <div style=\"background:#eff6ff;border:2px dashed ${DISCLOSURELY_PRIMARY_COLOR};border-radius:12px;padding:24px;text-align:center;margin:26px 0;\">
          <div style=\"font-size:36px;font-weight:700;letter-spacing:10px;color:${DISCLOSURELY_PRIMARY_COLOR};font-family:'Courier New',monospace;\">${otp}</div>
        </div>
        
        <p style=\"font-size:15px;line-height:1.7;color:#1f2937;margin:0 0 20px 0;\">
          Enter this 6-digit code in the verification form to activate your account.
        </p>
        
        <div style=\"background:#fff4e5;border:1px solid #fcd9a7;border-radius:8px;padding:16px;margin:22px 0;color:#92400e;font-size:14px;\">
          <strong>Security Note:</strong> This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
        </div>
        
        <p style=\"font-size:15px;line-height:1.7;color:#1f2937;margin:0;\">
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
