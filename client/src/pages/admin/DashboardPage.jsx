import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { getOverview, getActivity } from '../../services/adminService';

const ACTIVITY_ICONS = {
  registration: { icon: Users, styles: 'bg-primary/10 text-primary' },
  enrollment: { icon: BookOpen, styles: 'bg-secondary/10 text-secondary' },
  publication: { icon: LayoutDashboard, styles: 'bg-warning/10 text-warning' },
  certificate: { icon: ShieldCheck, styles: 'bg-success/10 text-success' },
  grading: { icon: CheckCircle2, styles: 'bg-secondary/10 text-secondary' },
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([
      getOverview(),
      getActivity({ limit: 10 }),
    ])
      .then(([overviewResponse, activityResponse]) => {
        if (!active) return;
        setMetrics(overviewResponse?.data?.metrics ?? null);
        setActivity(activityResponse?.data?.activity ?? []);
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
  }, [reload]);

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
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Admin dashboard</p>
          <h1 className="text-3xl font-extrabold">Welcome back, {user?.firstName}</h1>
          <p className="mt-2 text-navy/60">Monitor platform health, enrollments and approval queues.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users">
            <Button variant="outline">Manage users</Button>
          </Link>
          <Link to="/admin/courses">
            <Button>Review courses</Button>
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
        <StatCard icon={Users} label="Total users" value={metrics?.users ?? 0} accent="text-primary" />
        <StatCard icon={Clock3} label="Pending instructors" value={metrics?.pendingInstructors ?? 0} accent="text-warning" />
        <StatCard icon={CheckCircle2} label="Active students" value={metrics?.students ?? 0} accent="text-success" />
        <StatCard icon={BookOpen} label="Published courses" value={metrics?.publishedCourses ?? 0} accent="text-secondary" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">Platform snapshot</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-navy/60">
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
              Live
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm text-navy/60">Draft courses</p>
              <p className="mt-2 text-3xl font-extrabold">{Math.max((metrics?.courses ?? 0) - (metrics?.publishedCourses ?? 0), 0)}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm text-navy/60">Approval queue</p>
              <p className="mt-2 text-3xl font-extrabold">{metrics?.pendingInstructors ?? 0}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy/50">Quick actions</h3>
            <div className="space-y-3">
              <ActionRow
                title="Review pending instructors"
                description="Approve or suspend instructor accounts before they can publish courses."
                href="/admin/users"
              />
              <ActionRow
                title="Manage course approvals"
                description="Check published, archived, and draft course status across the catalog."
                href="/admin/courses"
              />
              <ActionRow
                title="Organize categories"
                description="Keep course discovery clean and consistent for students."
                href="/admin/categories"
              />
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent activity</h2>
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-navy/55">No activity yet — changes across the platform will appear here.</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((event, index) => {
                const kind = ACTIVITY_ICONS[event.type] ?? ACTIVITY_ICONS.registration;
                const Icon = kind.icon;
                return (
                  <li key={`${event.type}-${index}`} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${kind.styles}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug">{event.label}</p>
                      <p className="mt-0.5 text-xs text-navy/55">{event.detail} · {new Date(event.at).toLocaleDateString()}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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
