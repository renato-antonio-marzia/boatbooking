import emailjs from '@emailjs/browser';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

const isConfigured = SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY;

const formatItalianDate = (isoDate) =>
  format(parseISO(isoDate), 'EEEE d MMMM yyyy', { locale: it });

/**
 * Send booking notification emails to all recipients except the booking creator.
 *
 * Fire-and-forget: failures are logged but never thrown — email outage must not
 * break the booking flow (the booking is already saved in Firebase).
 */
export async function sendBookingNotifications({
  booking,
  recipients,
  authorEmail,
}) {
  if (!isConfigured) {
    console.warn('EmailJS non configurato, salto invio email');
    return { sent: 0, skipped: 0 };
  }

  const targets = recipients.filter(
    (r) => r.email.toLowerCase() !== (authorEmail || '').toLowerCase()
  );

  if (targets.length === 0) {
    return { sent: 0, skipped: recipients.length };
  }

  const params = {
    author_name: booking.userName,
    start_date: formatItalianDate(booking.startDate),
    end_date: formatItalianDate(booking.endDate),
    notes: booking.notes?.trim() ? booking.notes : '(nessuna nota)',
  };

  const results = await Promise.allSettled(
    targets.map((r) =>
      emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { ...params, to_email: r.email },
        { publicKey: PUBLIC_KEY }
      )
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;
  if (failed > 0) {
    console.error(
      `Email: ${sent}/${results.length} inviate. Errori:`,
      results.filter((r) => r.status === 'rejected').map((r) => r.reason)
    );
  }
  return { sent, skipped: recipients.length - targets.length, failed };
}
