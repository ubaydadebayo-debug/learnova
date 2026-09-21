import { Bot, MessageCircle, BookOpenCheck, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const capabilities = [
  {
    icon: MessageCircle,
    title: 'Explain',
    text: 'Get clear explanations of tricky lesson concepts.',
  },
  {
    icon: BookOpenCheck,
    title: 'Practice',
    text: 'Receive practice questions tailored to your level.',
  },
  {
    icon: ListChecks,
    title: 'Study Plans',
    text: 'Build a study plan that fits your goals and schedule.',
  },
];

export default function AITutorPage() {
  return (
    <>
      <section className="container-page flex flex-col items-center py-20 text-center">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bot className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
          AI Tutor
        </p>
        <h1 className="mb-4 max-w-2xl text-3xl font-extrabold sm:text-4xl">
          Personalized help whenever you need it
        </h1>
        <p className="mb-8 max-w-xl text-lg text-navy/60">
          Learnova's AI Tutor assists your learning with explanations, practice, quizzes, and
          study plans — always in step with your courses and lessons.
        </p>

        <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="rounded-2xl border border-line bg-white p-6 text-left">
              <c.icon className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mb-1 font-bold">{c.title}</h2>
              <p className="text-sm text-navy/60">{c.text}</p>
            </div>
          ))}
        </div>

        <Link to="/register" className="mt-10">
          <Button size="lg">Meet Your AI Tutor</Button>
        </Link>
      </section>
    </>
  );
}