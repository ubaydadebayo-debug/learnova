import { BookOpen, PlayCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listMyCourses } from '../../services/studentService';
import { formatDuration } from '../../utils/format';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listMyCourses().then((response) => setCourses(response.data.courses ?? [])).catch(setError).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return <section className="container-page py-8">
    <div className="mb-8"><p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Learning</p><h1 className="text-3xl font-extrabold">My courses</h1><p className="mt-2 text-navy/60">Pick up where you left off.</p></div>
    {loading && <div className="flex justify-center py-20"><Spinner className="border-primary/30 border-t-primary" /></div>}
    {error && <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white py-16 text-center"><p className="text-error">{error.message}</p><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></div>}
    {!loading && !error && courses.length === 0 && <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center"><BookOpen className="mx-auto h-10 w-10 text-primary/50" aria-hidden="true" /><h2 className="mt-4 text-xl font-bold">No courses yet</h2><p className="mt-2 text-navy/60">Find a course and start building your skills.</p><Link to="/courses" className="mt-5 inline-block"><Button>Explore courses</Button></Link></div>}
    {!loading && !error && courses.length > 0 && <div className="grid gap-5 md:grid-cols-2">{courses.map((item) => <CourseCard key={item.enrollment.id} item={item} />)}</div>}
  </section>;
}

function CourseCard({ item }) {
  const next = item.continue;
  return <article className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-secondary">{item.course.category?.name}</p><h2 className="mt-1 text-xl font-bold">{item.course.title}</h2></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{item.progress.percent}%</span></div><p className="mt-3 line-clamp-2 text-sm text-navy/60">{item.course.shortDescription || 'Continue your learning journey.'}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-primary" style={{ width: `${item.progress.percent}%` }} /></div><div className="mt-3 flex items-center justify-between text-xs text-navy/50"><span>{item.progress.completed} of {item.progress.total} lessons</span><span>{formatDuration(item.course.durationMinutes)}</span></div><div className="mt-5 border-t border-line pt-4">{next ? <Link to={`/student/learn/${item.course.id}/${next.lessonId}`}><Button size="sm"><PlayCircle className="h-4 w-4" aria-hidden="true" />Continue</Button></Link> : <Link to={`/student/courses/${item.course.id}`}><Button size="sm" variant="outline">Review course</Button></Link>}</div></article>;
}