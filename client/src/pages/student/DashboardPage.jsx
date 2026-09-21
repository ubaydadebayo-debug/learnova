import { BookOpen, CheckCircle2, PlayCircle, RefreshCw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { getProgressSummary, listMyCourses } from '../../services/studentService';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([getProgressSummary(), listMyCourses()])
      .then(([summaryResponse, coursesResponse]) => {
        setSummary(summaryResponse.data);
        setCourses(coursesResponse.data.courses ?? []);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="border-primary/30 border-t-primary" /></div>;
  }

  if (error) {
    return <section className="container-page py-16"><div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"><p>{error.message}</p><Button variant="outline" size="sm" className="mt-3" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></div></section>;
  }

  return (
    <section className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Student dashboard</p>
          <h1 className="text-3xl font-extrabold">Welcome back, {user?.firstName}</h1>
          <p className="mt-2 text-navy/60">Keep your learning moving forward.</p>
        </div>
        <Link to="/courses"><Button><BookOpen className="h-4 w-4" aria-hidden="true" />Explore courses</Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={BookOpen} label="Enrolled courses" value={summary?.enrolled ?? 0} />
        <Stat icon={PlayCircle} label="Lessons completed" value={`${summary?.lessonsCompleted ?? 0}/${summary?.totalLessons ?? 0}`} />
        <Stat icon={CheckCircle2} label="Average progress" value={`${summary?.averagePercent ?? 0}%`} />
        <Stat icon={Trophy} label="Courses completed" value={summary?.completedCourses ?? 0} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Continue learning</h2><Link to="/student/courses" className="text-sm font-semibold text-primary">View all</Link></div>
          {summary?.continue ? (
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="text-sm text-navy/50">{summary.continue.courseTitle}</p>
              <h3 className="mt-1 text-lg font-bold">{summary.continue.lessonTitle}</h3>
              <p className="mt-2 text-sm text-navy/60">{summary.continue.moduleTitle}</p>
              <Link to={`/student/learn/${summary.continue.courseId}/${summary.continue.lessonId}`} className="mt-5 inline-block"><Button><PlayCircle className="h-4 w-4" aria-hidden="true" />Continue lesson</Button></Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center"><p className="text-navy/60">Enroll in a course to start learning.</p><Link to="/courses" className="mt-4 inline-block"><Button variant="outline">Browse courses</Button></Link></div>
          )}
        </section>

        <section><h2 className="mb-4 text-xl font-bold">Your courses</h2>{courses.length === 0 ? <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center"><p className="text-navy/60">Your enrolled courses will appear here.</p><Link to="/courses" className="mt-4 inline-block"><Button variant="outline">Browse courses</Button></Link></div> : <div className="space-y-3">{courses.slice(0, 3).map((item) => <CourseSummary key={item.enrollment.id} item={item} />)}</div>}</section>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-line bg-white p-5"><Icon className="h-5 w-5 text-primary" aria-hidden="true" /><p className="mt-4 text-sm text-navy/60">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p></div>;
}

function CourseSummary({ item }) {
  const percent = item.progress?.percent ?? 0;
  return <Link to={`/student/courses/${item.course.id}`} className="block rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-md"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{item.course.title}</h3><span className="text-sm font-bold text-primary">{percent}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-navy/60">{(item.progress?.completed ?? 0)} of {(item.progress?.total ?? 0)} lessons</p></Link>;
}