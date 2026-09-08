const FROM = process.env.EMAIL_FROM ?? 'Summertech <login@summertech.ac.ke>';

/**
 * Send an email. If RESEND_API_KEY is not set, the message is logged to the
 * server console instead — which is all you need for local development.
 */
export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string }) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log('\n──────── EMAIL (dev, not sent) ────────');
    console.log('To:      ', opts.to);
    console.log('Subject: ', opts.subject);
    console.log(opts.text);
    console.log('──────────────────────────────────────\n');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? `<p>${opts.text}</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed (${res.status}): ${body}`);
  }
}
