import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import Button from '../../components/common/Button';

const initialForm = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Sending is wired to the backend in a later stage; validate locally for now.
    setSubmitted(true);
  };

  const inputClasses =
    'w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-primary focus:outline-2 focus:outline-primary';

  return (
    <section className="container-page flex flex-col items-center py-20">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="mb-3 text-3xl font-extrabold sm:text-4xl">Get in touch</h1>
        <p className="max-w-xl text-lg text-navy/60">
          Questions, feedback, or ideas — we would love to hear from you.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-4 rounded-2xl border border-line bg-white p-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className={inputClasses}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="mb-1 block text-sm font-medium text-navy">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            value={form.subject}
            onChange={handleChange}
            className={inputClasses}
            placeholder="How can we help?"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-navy">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={form.message}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Write your message…"
          />
        </div>

        <Button type="submit" className="w-full">
          Send Message
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>

        {submitted && (
          <p className="rounded-lg bg-surface px-4 py-3 text-sm text-navy/70">
            Thanks — your message was validated locally. Sending will be connected to the backend
            in a later stage.
          </p>
        )}
      </form>
    </section>
  );
}