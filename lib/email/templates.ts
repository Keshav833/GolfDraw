import { Resend } from 'resend';

// Using a fallback for environments without the key during build
export const resend = new Resend(process.env.RESEND_API_KEY || 're_mock123');

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    return await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@golfdraw.com',
      to,
      subject: `Welcome to GolfDraw, ${name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're in!</h2>
          <p>Your subscription is active and your first draw entry is confirmed.</p>
          <p>Remember to log your scores after your next round to maximize your chances.</p>
        </div>
      `
    });
  } catch (err) {
    console.error("Resend delivery failed:", err);
    return null;
  }
}

export async function sendWinnerNotificationEmail(params: {
  to: string;
  name: string;
  prizeAmount: number;
  drawMonth: string;
  matchCategory: string;
  verifyUrl: string;
}) {
  try {
    return await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@golfdraw.com',
      to: params.to,
      subject: `You won £${params.prizeAmount.toFixed(2)} in GolfDraw`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Great news, ${params.name}!</h2>
          <p>You hit a ${params.matchCategory} in the ${params.drawMonth} draw.</p>
          <p>Your prize amount is <strong>£${params.prizeAmount.toFixed(2)}</strong>.</p>
          <p>Please upload your scorecard so we can verify the win:</p>
          <p><a href="${params.verifyUrl}">Upload proof now</a></p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Winner email failed:', err);
    return null;
  }
}

export async function sendVerificationRejectedEmail(params: {
  to: string;
  name: string;
  rejectionNote: string;
  drawsUrl: string;
}) {
  try {
    return await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@golfdraw.com',
      to: params.to,
      subject: 'Your GolfDraw prize verification was unsuccessful',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${params.name},</h2>
          <p>We could not approve your uploaded scorecard.</p>
          <p><strong>Reason:</strong> ${params.rejectionNote}</p>
          <p>If this was a mistake or you have a clearer scorecard, you can upload again from your draws page.</p>
          <p><a href="${params.drawsUrl}">Go to my draws</a></p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Rejection email failed:', err);
    return null;
  }
}

export async function sendPaymentConfirmedEmail(params: {
  to: string;
  name: string;
  prizeAmount: number;
  drawMonth: string;
}) {
  try {
    return await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@golfdraw.com',
      to: params.to,
      subject: 'Your GolfDraw prize payment is on its way',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Great news ${params.name}!</h2>
          <p>Your <strong>£${params.prizeAmount.toFixed(2)}</strong> prize for the ${params.drawMonth} draw has been confirmed and payment is being processed.</p>
          <p>Please allow 3-5 business days for it to arrive.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Payment confirmation email failed:', err);
    return null;
  }
}
