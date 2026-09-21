import { HeartHandshake, Target, Eye, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const values = [
  { icon: Target, title: 'Learning first', text: 'Every feature exists to help you understand more deeply.' },
  { icon: HeartHandshake, title: 'Confidence', text: 'Guidance should make learners believe they can grow.' },
  { icon: Eye, title: 'Clarity', text: 'Simple tools with an obvious next action at every step.' },
  { icon: ShieldCheck, title: 'Trust', text: 'Secure, private, and honest about what the platform can do.' },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-page flex flex-col items-center py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">About</p>
        <h1 className="mb-4 max-w-2xl text-3xl font-extrabold sm:text-4xl">
          Building smarter learning for everyone
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-navy/60">
          Learnova brings courses, practice, progress tracking, and AI-powered guidance together
          in one platform built to help people learn with confidence.
        </p>

        <div className="grid w-full max-w-4xl gap-5 text-left sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-line bg-white p-6">
              <v.icon className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mb-1 font-bold">{v.title}</h2>
              <p className="text-sm text-navy/60">{v.text}</p>
            </div>
          ))}
        </div>

        <Link to="/register" className="mt-10">
          <Button>Start Learning</Button>
        </Link>
      </section>
    </>
  );
}