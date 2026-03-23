import {
  emailLayout,
  greeting,
  paragraph,
  ctaButton,
  divider,
  infoBox,
  amountBadge,
} from './layout';
import { APP_URL } from './resend';

/**
 * TEMPLATE 1: Welcome email
 */
export function welcomeEmail({
  firstName,
  planType,
  charityName,
  contributionPct,
}: {
  firstName: string;
  planType: 'monthly' | 'yearly';
  charityName?: string;
  contributionPct: number;
}): { subject: string; html: string } {
  const planLabel = planType === 'yearly' ? '₹999/year' : '₹100/month';
  const drawDate = getNextDrawDate();

  const body = `
    ${greeting(firstName)}
    ${paragraph(
      "Welcome to GolfDraw! Your subscription is now active and you have been automatically entered into this month's prize draw."
    )}

    ${infoBox(`
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;
                 color:#27500a;">Your subscription</p>
      <p style="margin:0;font-size:14px;color:#3B6D11;">
        ${planLabel} · Auto-entered every month
      </p>
    `)}

    ${
      contributionPct > 0 && charityName
        ? infoBox(`
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;
                 color:#27500a;">Your charity</p>
      <p style="margin:0;font-size:14px;color:#3B6D11;">
        ${contributionPct}% of your subscription goes to 
        ${charityName} every month — automatically.
      </p>
    `)
        : ''
    }

    ${paragraph(
      `The next draw runs on <strong>${drawDate}</strong>. Submit your golf scores before then to maximise your chances.`
    )}

    ${ctaButton('Go to your dashboard', `${APP_URL}/dashboard`)}

    ${divider()}

    ${paragraph(
      '<strong>How it works:</strong><br/>1. Submit your scores after each round (1–45)<br/>2. We keep your last 5 scores<br/>3. On draw day, your scores are matched against the draw number<br/>4. 3, 4, or 5 matches wins a prize'
    )}
  `;

  return {
    subject: "⛳ Welcome to GolfDraw — you're in!",
    html: emailLayout({
      previewText:
        "Your subscription is active and you're entered in the next draw.",
      body,
    }),
  };
}

/**
 * TEMPLATE 2: Payment confirmation (renewal)
 */
export function paymentConfirmationEmail({
  firstName,
  planType,
  amount,
  nextBillingDate,
  charityName,
  charityAmount,
}: {
  firstName: string;
  planType: 'monthly' | 'yearly';
  amount: number;
  nextBillingDate: string;
  charityName?: string;
  charityAmount?: number;
}): { subject: string; html: string } {
  const body = `
    ${greeting(firstName)}
    ${paragraph(
      "Your GolfDraw subscription has been renewed. You are entered in this month's draw."
    )}

    ${infoBox(`
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;
                 color:#27500a;">Payment receipt</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#3B6D11;
                     padding:3px 0;">Plan</td>
          <td style="font-size:13px;color:#3B6D11;
                     text-align:right;padding:3px 0;">
            ${planType === 'yearly' ? 'Yearly' : 'Monthly'}
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#3B6D11;
                     padding:3px 0;">Amount paid</td>
          <td style="font-size:13px;font-weight:600;
                     color:#1a5e38;text-align:right;
                     padding:3px 0;">₹${amount.toFixed(2)}</td>
        </tr>
        ${
          charityName && charityAmount
            ? `
        <tr>
          <td style="font-size:13px;color:#3B6D11;
                     padding:3px 0;">
            Donated to ${charityName}</td>
          <td style="font-size:13px;color:#3B6D11;
                     text-align:right;padding:3px 0;">
            ₹${charityAmount.toFixed(2)}
          </td>
        </tr>`
            : ''
        }
        <tr>
          <td style="font-size:13px;color:#3B6D11;
                     padding:3px 0;">Next billing date</td>
          <td style="font-size:13px;color:#3B6D11;
                     text-align:right;padding:3px 0;">
            ${nextBillingDate}
          </td>
        </tr>
      </table>
    `)}

    ${ctaButton('View your dashboard', `${APP_URL}/dashboard`)}
  `;

  return {
    subject: `✅ GolfDraw payment confirmed — ₹${amount.toFixed(2)}`,
    html: emailLayout({
      previewText: `Your ₹${amount.toFixed(2)} payment was successful. Draw entry confirmed.`,
      body,
    }),
  };
}

/**
 * TEMPLATE 3: Payment failed
 */
export function paymentFailedEmail({
  firstName,
  planType: _planType,
}: {
  firstName: string;
  planType: 'monthly' | 'yearly';
}): { subject: string; html: string } {
  const body = `
    ${greeting(firstName)}
    ${paragraph(
      'We were unable to process your GolfDraw subscription payment. Your draw entry has been paused until your payment is updated.'
    )}

    <table width="100%" cellpadding="0" cellspacing="0"
           style="margin:20px 0;">
      <tr>
        <td style="background:#fce8e8;border-radius:10px;
                   padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#7a1a1a;
                     font-weight:500;">
            ⚠️ Action required — update your payment method
            to stay entered in draws.
          </p>
        </td>
      </tr>
    </table>

    ${paragraph(
      'We will retry your payment automatically. If it continues to fail, you can update your payment details below.'
    )}

    ${ctaButton('Update payment method', `${APP_URL}/account`)}

    ${divider()}

    ${paragraph(
      'If you believe this is an error or need help, simply reply to this email.'
    )}
  `;

  return {
    subject: '⚠️ GolfDraw payment failed — action required',
    html: emailLayout({
      previewText:
        'Your payment failed. Update your payment method to stay in draws.',
      body,
      footerNote: 'This is an automated payment notification from GolfDraw.',
    }),
  };
}

/**
 * TEMPLATE 4: Subscription cancelled
 */
export function subscriptionCancelledEmail({
  firstName,
  accessUntil,
}: {
  firstName: string;
  accessUntil: string;
}): { subject: string; html: string } {
  const body = `
    ${greeting(firstName)}
    ${paragraph(
      'Your GolfDraw subscription has been cancelled. We are sorry to see you go.'
    )}

    ${infoBox(`
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;
                 color:#27500a;">Your access continues until</p>
      <p style="margin:0;font-size:16px;font-weight:600;
                 color:#1a5e38;">${accessUntil}</p>
      <p style="margin:6px 0 0;font-size:13px;color:#3B6D11;">
        You will remain entered in draws until this date.
      </p>
    `)}

    ${paragraph(
      'If you cancelled by mistake or change your mind, you can resubscribe at any time.'
    )}

    ${ctaButton('Resubscribe', `${APP_URL}/register/plan`)}

    ${divider()}

    ${paragraph(
      'Thank you for being part of GolfDraw. We hope to see you back on the fairway soon.'
    )}
  `;

  return {
    subject: 'Your GolfDraw subscription has been cancelled',
    html: emailLayout({
      previewText: `Your access continues until ${accessUntil}.`,
      body,
      footerNote:
        'You received this because your GolfDraw subscription was cancelled.',
    }),
  };
}

/**
 * TEMPLATE 5: Draw winner notification
 */
export function drawWinnerEmail({
  firstName,
  matchCategory,
  prizeAmount,
  drawMonth,
  drawNumber,
  drawResultId,
}: {
  firstName: string;
  matchCategory: '3-match' | '4-match' | '5-match';
  prizeAmount: number;
  drawMonth: string;
  drawNumber: number;
  drawResultId: string;
}): { subject: string; html: string } {
  const categoryLabel = {
    '3-match': '3-match prize 🥉',
    '4-match': '4-match prize 🥈',
    '5-match': 'Jackpot winner 🥇',
  }[matchCategory];

  const uploadUrl = `${APP_URL}/draws/verify/${drawResultId}`;

  const body = `
    ${greeting(firstName)}
    ${paragraph(`Congratulations — you won the ${drawMonth} GolfDraw!`)}

    ${amountBadge(`₹${prizeAmount.toFixed(2)}`, categoryLabel)}

    ${infoBox(`
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;
                 color:#27500a;">Draw details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#3B6D11;
                     padding:2px 0;">Draw month</td>
          <td style="font-size:13px;color:#3B6D11;
                     text-align:right;padding:2px 0;">
            ${drawMonth}
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#3B6D11;
                     padding:2px 0;">Draw number</td>
          <td style="font-size:13px;color:#3B6D11;
                     text-align:right;padding:2px 0;">
            ${drawNumber}
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#3B6D11;
                     padding:2px 0;">Your prize</td>
          <td style="font-size:13px;font-weight:600;
                     color:#1a5e38;text-align:right;
                     padding:2px 0;">
            ₹${prizeAmount.toFixed(2)}
          </td>
        </tr>
      </table>
    `)}

    ${paragraph(
      'To claim your prize, upload a clear screenshot of your official scorecard showing your name, the date, and your score.'
    )}

    ${ctaButton('Upload your scorecard now', uploadUrl)}

    <table width="100%" cellpadding="0" cellspacing="0"
           style="margin:16px 0;">
      <tr>
        <td style="background:#faeeda;border-radius:10px;
                   padding:14px 18px;">
          <p style="margin:0;font-size:13px;color:#633806;">
            ⏰ Please upload your proof within 14 days to 
            claim your prize.
          </p>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `🏆 You won ₹${prizeAmount.toFixed(2)} in the ${drawMonth} GolfDraw!`,
    html: emailLayout({
      previewText: `Congratulations! You hit ${matchCategory} and won ₹${prizeAmount.toFixed(2)}.`,
      body,
      footerNote:
        'You received this because you won a prize in a GolfDraw monthly draw.',
    }),
  };
}

/**
 * TEMPLATE 6: Verification approved
 */
export function verificationApprovedEmail({
  firstName,
  prizeAmount,
  drawMonth,
}: {
  firstName: string;
  prizeAmount: number;
  drawMonth: string;
}): { subject: string; html: string } {
  const body = `
    ${greeting(firstName)}
    ${paragraph(
      'Great news — your scorecard has been verified and your prize payment is being processed.'
    )}

    ${amountBadge(`₹${prizeAmount.toFixed(2)}`, `${drawMonth} draw prize`)}

    ${infoBox(`
      <p style="margin:0;font-size:14px;color:#3B6D11;">
        ✅ Scorecard verified<br/>
        💸 Payment processing — allow 3–5 business days
      </p>
    `)}

    ${paragraph(
      'You will receive a final confirmation email once the payment has been sent.'
    )}

    ${ctaButton('View your winnings', `${APP_URL}/draws`)}
  `;

  return {
    subject: `✅ Prize verified — ₹${prizeAmount.toFixed(2)} is on its way`,
    html: emailLayout({
      previewText: `Your scorecard was approved. ₹${prizeAmount.toFixed(2)} payment is being processed.`,
      body,
    }),
  };
}

/**
 * TEMPLATE 7: Verification rejected
 */
export function verificationRejectedEmail({
  firstName,
  prizeAmount,
  drawMonth,
  rejectionNote,
  drawResultId,
}: {
  firstName: string;
  prizeAmount: number;
  drawMonth: string;
  rejectionNote: string;
  drawResultId: string;
}): { subject: string; html: string } {
  const uploadUrl = `${APP_URL}/draws/verify/${drawResultId}`;

  const body = `
    ${greeting(firstName)}
    ${paragraph(
      'Unfortunately we were unable to verify your scorecard for the ' +
        drawMonth +
        ' draw.'
    )}

    <table width="100%" cellpadding="0" cellspacing="0"
           style="margin:20px 0;">
      <tr>
        <td style="background:#fce8e8;border-radius:10px;
                   padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:13px;
                     font-weight:600;color:#7a1a1a;">
            Reason for rejection
          </p>
          <p style="margin:0;font-size:14px;color:#7a1a1a;">
            ${rejectionNote}
          </p>
        </td>
      </tr>
    </table>

    ${paragraph(
      'You can re-upload a clearer version of your scorecard. Make sure it clearly shows:'
    )}

    <ul style="margin:0 0 20px;padding-left:20px;
               color:#4a5a4a;font-size:15px;
               line-height:2;">
      <li>Your full name</li>
      <li>The date of the round</li>
      <li>Your score clearly visible</li>
    </ul>

    ${ctaButton('Re-upload your scorecard', uploadUrl)}

    ${divider()}

    ${paragraph(
      'If you believe this decision is incorrect or need help, simply reply to this email.'
    )}
  `;

  return {
    subject: `Your GolfDraw proof needs resubmission — ₹${prizeAmount.toFixed(2)} prize`,
    html: emailLayout({
      previewText:
        'Your scorecard could not be verified. Re-upload to claim your prize.',
      body,
      footerNote:
        'You received this because your GolfDraw prize verification was unsuccessful.',
    }),
  };
}

/**
 * TEMPLATE 8: Payment processed (paid)
 */
export function paymentProcessedEmail({
  firstName,
  prizeAmount,
  drawMonth,
}: {
  firstName: string;
  prizeAmount: number;
  drawMonth: string;
}): { subject: string; html: string } {
  const body = `
    ${greeting(firstName)}
    ${paragraph(
      `Your GolfDraw prize payment for the ${drawMonth} draw has been confirmed and is on its way to you.`
    )}

    ${amountBadge(`₹${prizeAmount.toFixed(2)}`, 'Prize payment confirmed')}

    ${infoBox(`
      <p style="margin:0;font-size:14px;color:#3B6D11;
                 line-height:1.7;">
        💸 Payment sent<br/>
        ⏱️ Allow 3–5 business days to appear in your account<br/>
        🏦 Paid to your registered payment details
      </p>
    `)}

    ${paragraph(
      "Congratulations again on your win. Keep submitting scores for next month's draw!"
    )}

    ${ctaButton('Submit scores for next draw', `${APP_URL}/scores`)}
  `;

  return {
    subject: `💸 GolfDraw prize payment sent — ₹${prizeAmount.toFixed(2)}`,
    html: emailLayout({
      previewText: `Your ₹${prizeAmount.toFixed(2)} prize payment has been sent. Allow 3–5 business days.`,
      body,
    }),
  };
}

/**
 * HELPER: get next draw date
 */
function getNextDrawDate(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
