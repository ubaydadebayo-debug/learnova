import { BarChart3, Award, ClipboardCheck, GraduationCap, ListChecks, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { getReports } from '../../services/adminService';

export default function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    getReports()
      .then(({ data }) => setReports(data.reports))
      .catch(setError);
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <section className="container-page py-8"><div className="rounded-lg border border-error/30 bg-error/10 p-4 text-error" role="alert"><p>{error.message}</p><Button variant="outline" size="sm" className="mt-3" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></div></section>;
  if (!reports) return <div className="flex justify-center py-20"><Spinner className="border-primary/30 border-t-primary" /></div>;

  const enrollments = reports.enrollments ?? {};
  const submissions = reports.submissions ?? {};

  return (
    <section className="container-page py-8">
      <div className="mb-8"><p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Administration</p><h1 className="text-3xl font-extrabold">Reports</h1><p className="mt-2 text-navy/60">Review persisted platform activity and learning outcomes.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard icon={GraduationCap} label="Active enrollments" value={enrollments.ACTIVE ?? 0} />
        <ReportCard icon={Award} label="Certificates issued" value={reports.certificates ?? 0} />
        <ReportCard icon={ClipboardCheck} label="Submitted assignments" value={(submissions.PENDING ?? 0) + (submissions.GRADED ?? 0)} />
        <ReportCard icon={ListChecks} label="Submitted quizzes" value={reports.submittedQuizAttempts ?? 0} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ReportList title="Enrollment status" values={enrollments} />
        <ReportList title="Assignment status" values={submissions} />
      </div>
    </section>
  );
}

function ReportCard({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><Icon className="h-6 w-6 text-primary" aria-hidden="true" /><p className="mt-4 text-sm text-navy/60">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p></div>;
}

function ReportList({ title, values }) {
  return <section className="rounded-2xl border border-line bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />{title}</h2><div className="mt-4 space-y-3">{Object.entries(values).map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 text-sm"><span className="capitalize text-navy/70">{label.toLowerCase()}</span><strong>{value}</strong></div>)}</div></section>;
}