/**
 * All emails share this wrapper. It handles the
 * outer container, header with logo, and footer.
 */
export function emailLayout({
  previewText,
  body,
  footerNote,
}: {
  previewText: string;
  body: string;
  footerNote?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${previewText}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#f9f9f6;
             font-family:-apple-system,BlinkMacSystemFont,
             'Segoe UI',sans-serif;">

  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;
              color:#f9f9f6;font-size:1px;">
    ${previewText}
  </div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" 
         style="background:#f9f9f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;
                      background:#ffffff;border-radius:16px;
                      overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0f3d2e;padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:700;
                                 color:#ffffff;letter-spacing:-0.3px;">
                      ⛳ GolfDraw
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 28px;
                       border-top:1px solid #f0efe8;">
              <p style="margin:0;font-size:12px;
                        color:#9aaa9a;line-height:1.6;">
                ${
                  footerNote ??
                  'You are receiving this email because you have ' +
                    'an active GolfDraw subscription. ' +
                    'Questions? Reply to this email.'
                }
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#9aaa9a;">
                © ${new Date().getFullYear()} GolfDraw Ltd. 
                All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- End card -->
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// Reusable building blocks used inside body strings:

export function greeting(firstName: string): string {
  return `<p style="margin:0 0 20px;font-size:24px;
                     font-weight:600;color:#1a1a18;
                     letter-spacing:-0.3px;">
    Hi ${firstName} 👋
  </p>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;
                     color:#4a5a4a;line-height:1.7;">
    ${text}
  </p>`;
}

export function ctaButton(text: string, url: string): string {
  return `
  <table cellpadding="0" cellspacing="0" 
         style="margin:24px 0;">
    <tr>
      <td style="background:#1a5e38;border-radius:10px;">
        <a href="${url}"
           style="display:inline-block;padding:13px 28px;
                  font-size:14px;font-weight:600;
                  color:#ffffff;text-decoration:none;
                  letter-spacing:0.1px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f0efe8;
                      margin:24px 0;" />`;
}

export function infoBox(content: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
         style="margin:20px 0;">
    <tr>
      <td style="background:#eaf3de;border-radius:10px;
                 padding:16px 20px;">
        ${content}
      </td>
    </tr>
  </table>`;
}

export function amountBadge(amount: string, label: string): string {
  return `
  <table cellpadding="0" cellspacing="0"
         style="margin:20px 0;">
    <tr>
      <td style="background:#0f3d2e;border-radius:12px;
                 padding:20px 28px;text-align:center;">
        <p style="margin:0;font-size:32px;font-weight:700;
                   color:#ffffff;letter-spacing:-0.5px;">
          ${amount}
        </p>
        <p style="margin:4px 0 0;font-size:13px;
                   color:rgba(255,255,255,0.6);">
          ${label}
        </p>
      </td>
    </tr>
  </table>`;
}
