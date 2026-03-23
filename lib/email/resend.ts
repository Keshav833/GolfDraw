import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set — emails will not send');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM = process.env.EMAIL_FROM ?? 'noreply@golfdraw.com';
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
