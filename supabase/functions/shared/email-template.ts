// Shared email template utility for consistent branding
export const createEmailTemplate = (options: {
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
                  <td style="background: ${brandColor}; padding: 32px 30px; text-align: center;">
                    <p style="color: white; margin: 0 0 8px 0; font-size: 14px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;">DISCLOSURELY</p>
                    <h1 style="color: white; margin: 0 0 4px 0; font-size: 28px; font-weight: 700;">${title}</h1>
                    ${organizationName ? `<p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 15px;">${organizationName}</p>` : ''}
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
