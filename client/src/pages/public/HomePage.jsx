import { Link } from 'react-router-dom';
import BrandMark from '../../components/common/BrandMark';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  LineChart,
  Check,
  GraduationCap,
  Compass,
  Sparkles,
  Quote,
} from 'lucide-react';
import Button from '../../components/common/Button';
import CourseCard from '../../components/courses/CourseCard';
import { useFetch } from '../../hooks/useFetch';
import { listCourses } from '../../services/courseService';
import { FEATURE_HIGHLIGHTS, BRAND } from '../../constants';

const AI_TUTOR_ACTIONS = ['Explain any lesson', 'Simplify hard topics', 'Quiz me', 'Build a study plan'];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Compass,
    title: 'Create your account',
    text: 'Sign up free as a student or instructor in under a minute.',
  },
  {
    step: '02',
    icon: BookOpen,
    title: 'Choose a course',
    text: 'Browse structured courses and pick the path that fits your goals.',
  },
  {
    step: '03',
    icon: LineChart,
    title: 'Learn & practice',
    text: 'Complete lessons, then reinforce them with quizzes and assignments.',
  },
  {
    step: '04',
    icon: Award,
    title: 'Track & grow',
    text: 'See progress at a glance and earn certificates as you finish.',
  },
];

function FeaturedCourses() {
  const featured = useFetch(() => listCourses({ sort: 'popular', limit: 3 }), []);

  return (
    <section className="container-page py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
            Featured Courses
          </p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Popular right now</h2>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          Explore all courses
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {featured.error && (
        <p className="text-sm text-navy/60">Featured courses are temporarily unavailable.</p>
      )}

      {featured.loading && !featured.data && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl border border-line bg-surface" />
          ))}
        </div>
      )}

      {!featured.loading && !featured.error && featured.data?.courses?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.data.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface">
        <div className="container-page flex flex-col items-center py-24 text-center sm:py-32">
          <BrandMark className="h-20 w-20" />
          <h1 className="mt-8 max-w-3xl text-4xl font-extrabold tracking-tight text-navy sm:text-5xl lg:text-6xl">
            {BRAND.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy/60 sm:text-xl">
            Learnova brings courses, practice, progress tracking, and AI-powered guidance together
            in one learning platform built to help you learn with confidence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Learning
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-line bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
          {[
            { icon: BookOpen, label: 'Structured courses' },
            { icon: Bot, label: 'AI Tutor built-in' },
            { icon: LineChart, label: 'Track your progress' },
            { icon: Award, label: 'Earn certificates' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-navy/70">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why Learnova */}
      <section className="container-page py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
            Why Learnova
          </p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Everything you need to learn with confidence
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_HIGHLIGHTS.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-md"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-navy/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="bg-white">
        <div className="border-y border-line">
          <FeaturedCourses />
        </div>
      </section>

      {/* AI Tutor */}
      <section className="container-page grid items-center gap-10 py-20 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
            Meet your AI Tutor
          </p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Your personal tutor, ready whenever you are
          </h2>
          <p className="mt-4 max-w-lg text-navy/60">
            Learnova's AI Tutor explains lessons in plain language, simplifies tricky topics,
            quizzes you, and helps you build study plans that adapt to your level.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {AI_TUTOR_ACTIONS.map((action) => (
              <li key={action} className="flex items-center gap-2.5 text-sm text-navy/80">
                <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                {action}
              </li>
            ))}
          </ul>
          <Link to="/ai-tutor" className="mt-8 inline-block">
            <Button variant="outline">
              Learn about the AI Tutor
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold">Ask about any lesson</p>
              <p className="text-xs text-navy/50">Adapts to your level</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl rounded-bl-sm bg-surface p-4 text-sm text-navy/80">
              Can you explain closures in JavaScript with an example?
            </div>
            <div className="w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-primary p-4 text-sm text-white">
              Of course! Think of a closure as a function that remembers the variables around it.
              Here's a quick, friendly example...
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="container-page py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
              How it works
            </p>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              From interest to achievement in four steps
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="rounded-2xl border border-line bg-background p-6">
                <p className="mb-3 text-sm font-bold text-primary">{item.step}</p>
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mb-2 font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-navy/60">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
            >
              See the full journey
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instructor CTA */}
      <section className="border-y border-line bg-background">
        <div className="container-page flex flex-col items-center gap-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Share what you know. Teach on Learnova.
          </h2>
          <p className="max-w-xl text-navy/60">
            Build structured courses with modules, lessons, quizzes and assignments — then guide
            your students as they learn.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Become an Instructor
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
            Loved by learners
          </p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">What learners say</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                'The structured lessons and friendly AI tutor kept me motivated every single day.',
              name: 'Grace H.',
              role: 'Web Development Student',
            },
            {
              quote:
                'I created my first full course in a weekend and love tracking how my students progress.',
              name: 'Ada L.',
              role: 'Instructor',
            },
            {
              quote:
                'Progress tracking made it obvious what to study next. Earning my certificate felt great.',
              name: 'Marie C.',
              role: 'Data Science Student',
            },
          ].map((t) => (
            <figure key={t.name} className="rounded-2xl border border-line bg-white p-6">
              <Quote className="mb-4 h-6 w-6 text-primary/40" aria-hidden="true" />
              <blockquote className="text-sm leading-relaxed text-navy/70">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-navy/50">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy">
        <div className="container-page flex flex-col items-center gap-5 py-16 text-center">
          <h2 className="max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            Your learning journey starts here
          </h2>
          <p className="max-w-xl text-lg text-white/70">
            Create a free account and start learning with Learnova today.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Start Learning
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}