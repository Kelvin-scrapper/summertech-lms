import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Help Center' };

const faqs = [
  {
    q: 'How do I sign in?',
    a: 'Enter your email on the sign-in page and click the link we email you. Links expire after 20 minutes. There are no passwords.',
  },
  {
    q: 'I was enrolled but a course is not on my dashboard.',
    a: 'Refresh the page. If it is still missing, contact your programme manager — enrolment is done by an administrator.',
  },
  {
    q: 'How is my progress calculated?',
    a: 'Each lesson you mark complete counts towards the course percentage. You can un-mark a lesson if you clicked by mistake.',
  },
  {
    q: 'A video or file will not open.',
    a: 'Resources open in a new tab. If a download stalls, check your connection and try again, or use the audio/transcript alternative where available.',
  },
  {
    q: 'I am a tutor. Where do I edit my course?',
    a: 'Use the Teaching section in the sidebar (visible to instructors). You can add and reorder modules and lessons, write notes, and attach videos, PDFs or slides.',
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Help Center</h1>
      <p className="mt-1 text-slate-500">Common questions about the learning platform.</p>

      <div className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {faqs.map((f) => (
          <div key={f.q} className="p-5">
            <h2 className="font-semibold text-slate-900">{f.q}</h2>
            <p className="mt-1.5 text-sm text-slate-600">{f.a}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Still stuck? Email{' '}
        <a href="mailto:support@summertech.ac.ke" className="font-medium text-accent-600">
          support@summertech.ac.ke
        </a>
        .
      </p>
    </div>
  );
}
