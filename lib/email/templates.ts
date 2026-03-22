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
