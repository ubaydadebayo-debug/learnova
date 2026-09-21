import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, ExternalLink, FileText, List, PlayCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { completeLesson, getCourseEnrollment, uncompleteLesson } from '../../services/studentService';
import { formatDuration } from '../../utils/format';

export default function StudentLearningPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getCourseEnrollment(courseId)
      .then((response) => setData(response.data))
      .catch(setError)
      .finally(() => {
        setLoading(false);
        setBusy(false);
      });
  };

  useEffect(() => { load(); }, [courseId]);

  const lessons = useMemo(() => data?.course?.modules?.flatMap((module) => (module.lessons ?? []).map((lesson) => ({ ...lesson, moduleTitle: module.title }))) ?? [], [data]);
  const activeLesson = lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];
  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeLesson?.id);

  useEffect(() => {
    if (!lessonId && activeLesson) navigate(`/student/learn/${courseId}/${activeLesson.id}`, { replace: true });
  }, [activeLesson, courseId, lessonId, navigate]);

  const toggleComplete = async () => {
    if (!activeLesson) return;
    setBusy(true);
    setError(null);
    try {
      await (activeLesson.completed ? uncompleteLesson(activeLesson.id) : completeLesson(activeLesson.id));
      load();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="border-primary/30 border-t-primary" /></div>;
  if (error && !data) return <section className="container-page py-16"><div className="flex flex-col items-center gap-4 text-center"><p className="text-error">{error.message}</p><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></div></section>;
  if (!data?.course || !activeLesson) return <section className="container-page py-16"><p>No lessons are available in this course yet.</p></section>;

  const previous = lessons[activeIndex - 1];
  const next = lessons[activeIndex + 1];

  return <section className="container-page py-6">
    <Link to="/student/courses" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" aria-hidden="true" />My courses</Link>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-navy/60">{data.course.title}</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{activeLesson.title}</h1><p className="mt-1 text-sm text-navy/60">{activeLesson.moduleTitle} · {formatDuration(activeLesson.durationMinutes)}</p></div><div className="text-sm font-semibold text-primary">{(data.progress?.completed ?? 0)} / {(data.progress?.total ?? 0)} completed</div></div>
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="order-2 rounded-2xl border border-line bg-white p-4 lg:order-1"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><List className="h-4 w-4 text-primary" aria-hidden="true" />Course content</div><div className="space-y-4">{data.course.modules.map((module) => <div key={module.id}><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy/60">{module.title}</p><div className="space-y-1">{(module.lessons ?? []).map((lesson) => <Link key={lesson.id} to={`/student/learn/${courseId}/${lesson.id}`} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${lesson.id === activeLesson.id ? 'bg-primary/10 font-semibold text-primary' : 'text-navy/70 hover:bg-surface'}`}>{lesson.completed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" /> : <PlayCircle className="h-4 w-4 shrink-0 text-navy/35" aria-hidden="true" />}<span className="truncate">{lesson.title}</span></Link>)}{module.quizzes?.map((quiz) => <Link key={quiz.id} to={`/student/quizzes/${courseId}/${quiz.id}`} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-navy/70 hover:bg-surface"><ClipboardCheck className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" /><span className="truncate">{quiz.title}</span></Link>)}{module.assignments?.map((assignment) => <Link key={assignment.id} to={`/student/assignments/${assignment.id}`} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-navy/70 hover:bg-surface"><FileText className="h-4 w-4 shrink-0 text-success" aria-hidden="true" /><span className="truncate">{assignment.title}</span></Link>)}</div></div>)}</div></aside>
      <article className="order-1 min-w-0 lg:order-2"><div className="rounded-2xl border border-line bg-white p-6 sm:p-8">{activeLesson.videoUrl && <div className="mb-6 overflow-hidden rounded-xl bg-navy"><video controls className="aspect-video w-full" src={activeLesson.videoUrl} /></div>}<div className="whitespace-pre-wrap text-[15px] leading-7 text-navy/80">{activeLesson.content || 'This lesson has no written content yet.'}</div>{activeLesson.resources?.length > 0 && <div className="mt-8 border-t border-line pt-6"><h2 className="mb-3 font-bold">Resources</h2><div className="grid gap-2 sm:grid-cols-2">{activeLesson.resources.map((resource) => <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-line p-3 text-sm hover:bg-surface"><FileText className="h-4 w-4 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{resource.title}</span><ExternalLink className="h-4 w-4 text-navy/40" aria-hidden="true" /></a>)}</div></div>}<div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">{error && <p className="text-sm text-error">{error.message}</p>}<div className="flex flex-wrap gap-3"><Link to="/student/ai-tutor" state={{ courseId, lessonId: activeLesson.id }}><Button variant="outline"><Sparkles className="h-4 w-4" aria-hidden="true" />Ask About This Lesson</Button></Link><Button onClick={toggleComplete} disabled={busy}><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{activeLesson.completed ? 'Mark incomplete' : 'Mark complete'}</Button></div></div></div><div className="mt-4 flex items-center justify-between gap-3">{previous ? <Link to={`/student/learn/${courseId}/${previous.id}`}><Button size="sm" variant="outline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Previous</Button></Link> : <span />}{next ? <Link to={`/student/learn/${courseId}/${next.id}`}><Button size="sm">Next lesson<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></Link> : <Link to={`/student/courses/${courseId}`}><Button size="sm">Finish course</Button></Link>}</div></article>
    </div>
  </section>;
}