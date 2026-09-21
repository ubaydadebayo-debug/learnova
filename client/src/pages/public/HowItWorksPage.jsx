import { Compass } from 'lucide-react';
import PlaceholderPage from '../../components/common/PlaceholderPage';

const steps = [
  { step: '01', title: 'Create Account', text: 'Sign up free and build your learner profile.' },
  { step: '02', title: 'Choose Course', text: 'Browse courses and enroll in what matters to you.' },
  { step: '03', title: 'Learn & Practice', text: 'Work through lessons, quizzes, and assignments.' },
  { step: '04', title: 'Track Progress', text: 'See your progress and keep your momentum.' },
  { step: '05', title: 'Complete', text: 'Finish your course with confidence and grow further.' },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="container-page py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
            How It Works
          </p>
          <h1 className="mb-4 text-3xl font-extrabold sm:text-4xl">
            A simple path from first lesson to real growth
          </h1>
          <p className="text-lg text-navy/60">
            Create Account to Choose Course to Learn & Practice to Track Progress to Complete and
            grow.
          </p>
        </div>

        <ol className="mx-auto grid max-w-3xl gap-6">
          {steps.map((item) => (
            <li
              key={item.step}
              className="flex gap-5 rounded-2xl border border-line bg-white p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-lg font-extrabold text-primary">
                {item.step}
              </span>
              <div>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="mt-1 text-navy/60">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}