import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  LayoutDashboard,
  Plus,
  Users,
  Hourglass,
  NotebookPen,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listInstructorCourses } from '../../services/instructorService';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (user?.status === 'PENDING') {
      setLoading(false);
      return;
    }

    let active = true;
    listInstructorCourses()
      .then((response) => {
        if (!active) return;
        setCourses(response?.data?.courses ?? []);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.status, reload]);

  const pending = user?.status === 'PENDING';

  const metrics = useMemo(() => {
    const totalCourses = courses.length;
    const published = courses.filter((course) => course.status === 'PUBLISHED').length;
    const draft = courses.filter((course) => course.status === 'DRAFT').length;
    const totalStudents = courses.reduce((sum, course) => sum + (course.stats?.students ?? 0), 0);

    return { totalCourses, published, draft, totalStudents };
  }, [courses]);

  if (pending) {
    return (
      <section className="container-page flex flex-col items-center justify-center py-24 text-center">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Hourglass className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">Instructor</p>
        <h1 className="mb-4 text-3xl font-extrabold">Your account is awaiting approval</h1>
        <p className="max-w-xl text-lg text-navy/60">
          An administrator must approve your instructor account before you can build and publish courses.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="container-page flex justify-center py-24">
        <Spinner className="border-primary/30 border-t-primary" />
      </section>
    );
  }

  return (
    <section className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Instructor dashboard</p>
          <h1 className="text-3xl font-extrabold">Welcome back, {user?.firstName}</h1>
          <p className="mt-2 text-navy/60">Manage your teaching pipeline and keep each course moving forward.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/instructor/courses">
            <Button variant="outline">My courses</Button>
          </Link>
          <Link to="/instructor/courses/create">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New course
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-navy sm:flex-row sm:items-center sm:justify-between">
          <span role="alert">{error.message}</span>
          <Button size="sm" variant="outline" onClick={() => setReload((value) => value + 1)}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Total courses" value={metrics.totalCourses} accent="text-primary" />
        <StatCard icon={LayoutDashboard} label="Published" value={metrics.published} accent="text-success" />
        <StatCard icon={Clock3} label="Drafts" value={metrics.draft} accent="text-warning" />
        <StatCard icon={Users} label="Students" value={metrics.totalStudents} accent="text-secondary" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent courses</h2>
            <Link to="/instructor/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
              <NotebookPen className="mx-auto mb-4 h-10 w-10 text-primary/50" aria-hidden="true" />
              <h3 className="text-lg font-bold">No courses yet</h3>
              <p className="mt-2 text-navy/60">Build your first course and start teaching students.</p>
              <Link to="/instructor/courses/create" className="mt-5 inline-block">
                <Button>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create a course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 4).map((course) => (
                <div key={course.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{course.title}</p>
                    <p className="mt-1 text-sm text-navy/60">{course.category?.name ?? 'General'} · {course.level}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[course.status] ?? 'bg-surface text-navy ring-1 ring-line'}`}>
                      {course.status}
                    </span>
                    <Link to={`/instructor/courses/${course.id}/builder`}>
                      <Button size="sm" variant="outline">Open</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Next actions</h2>
          <div className="space-y-3">
            <ActionRow title="Create a new course" description="Publish your next learning experience." href="/instructor/courses/create" />
            <ActionRow title="Review submissions" description="Grade learner work and provide feedback." href="/instructor/assignments" />
            <ActionRow title="View analytics" description="Track enrollments, quiz and assignment performance." href="/instructor/analytics" />
            <ActionRow title="Manage students" description="See who is learning and how far they have come." href="/instructor/students" />
          </div>
        </aside>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface ${accent}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm text-navy/60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function ActionRow({ title, description, href }) {
  return (
    <Link to={href} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 transition-colors hover:border-primary/30 hover:bg-primary/5">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-navy/60">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
    </Link>
  );
}

const statusStyles = {
  DRAFT: 'bg-surface text-navy ring-1 ring-line',
  PUBLISHED: 'bg-success/10 text-success',
  ARCHIVED: 'bg-warning/10 text-warning',
};
