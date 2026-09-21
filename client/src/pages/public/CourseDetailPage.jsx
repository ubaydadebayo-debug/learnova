import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  ListOrdered,
  RefreshCw,
  Star,
  Users,
  Check,
  ChevronDown,
  ClipboardList,
  PlayCircle,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getCourse } from '../../services/courseService';
import Button from '../../components/common/Button';
import CategoryIcon from '../../components/common/CategoryIcon';
import { LEVEL_STYLES } from '../../constants/courses';
import { formatDuration, formatStudents, formatRating } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { enrollInCourse } from '../../services/studentService';
import { useState } from 'react';

function Skeleton() {
  return (
    <div className="container-page py-12">
      <div className="h-4 w-32 animate-pulse rounded bg-surface" />
      <div className="mt-6 h-10 w-2/3 animate-pulse rounded bg-surface" />
      <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-surface" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-surface" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-surface" />
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);

  const course = useFetch(() => getCourse(id), [id]);

  if (course.loading) {
    return <Skeleton />;
  }

  if (course.error) {
    return (
      <section className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold">Something went wrong.</h1>
        <p className="max-w-md text-navy/60">{course.error.message}</p>
        <Button variant="outline" onClick={course.refetch}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>
      </section>
    );
  }

  const c = course.data?.course;

  if (!c) {
    return (
      <section className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">We couldn't find what you're looking for.</h1>
        <p className="text-navy/60">The course may have been unpublished or removed.</p>
        <Link to="/courses">
          <Button>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Browse Courses
          </Button>
        </Link>
      </section>
    );
  }

  const instructorName = `${c.instructor?.firstName || ''} ${c.instructor?.lastName || ''}`.trim();
  const lessonsCount = c.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
  const quizzesCount = c.modules?.reduce((sum, m) => sum + (m.quizzes?.length || 0), 0) || 0;
  const assignmentsCount = c.modules?.reduce((sum, m) => sum + (m.assignments?.length || 0), 0) || 0;
  const students = c._count?.enrollments ?? 0;
  const levelStyle = LEVEL_STYLES[c.level] || LEVEL_STYLES.BEGINNER;
  const handleEnroll = async () => {
    if (!user) {
      navigate('/register');
      return;
    }
    if (user.role !== 'STUDENT') return;
    setEnrolling(true);
    setEnrollmentError(null);
    try {
      await enrollInCourse(c.id);
      navigate(`/student/courses/${c.id}`);
    } catch (err) {
      setEnrollmentError(err.message);
      setEnrolling(false);
    }
  };

  return (
    <section className="container-page py-12">
      <Link
        to="/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Courses
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <CategoryIcon name={c.category?.icon} className="h-3.5 w-3.5" />
              {c.category?.name}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${levelStyle}`}>
              {c.level === 'BEGINNER'
                ? 'Beginner'
                : c.level === 'ADVANCED'
                  ? 'Advanced'
                  : 'Intermediate'}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{c.title}</h1>

          {c.shortDescription && (
            <p className="mt-4 max-w-2xl text-lg text-navy/60">{c.shortDescription}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-navy/60">
            {c.ratingAverage > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-warning" aria-hidden="true" />
                <strong className="text-navy">{formatRating(c.ratingAverage)}</strong>
                <span>({c.ratingCount})</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden="true" />
              {formatStudents(students)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatDuration(c.durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              {lessonsCount} lessons
            </span>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-xl font-bold">Learning outcomes</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {c.outcomes?.length > 0 ? (
                c.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2 text-sm text-navy/75">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    {outcome}
                  </li>
                ))
              ) : (
                <li className="text-sm text-navy/50">Outcomes will be published soon.</li>
              )}
            </ul>
          </div>

          {c.description && (
            <div className="mt-8">
              <h2 className="mb-3 text-xl font-bold">About this course</h2>
              <p className="text-navy/70">{c.description}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold">Curriculum</h2>
            {c.modules?.length > 0 ? (
              <div className="space-y-4">
                {c.modules.map((module) => (
                  <ModuleBlock
                    key={module.id}
                    module={module}
                    lessonsCount={module.lessons?.length || 0}
                  />
                ))}
              </div>
            ) : (
              <p className="text-navy/50">This course is being prepared. Check back soon.</p>
            )}
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/15 via-secondary/10 to-surface">
              {c.thumbnailUrl ? (
                <img src={c.thumbnailUrl} alt={c.title} className="h-full w-full object-cover" />
              ) : (
                <CategoryIcon name={c.category?.icon} className="h-14 w-14 text-primary/40" />
              )}
            </div>

            <div className="p-6">
              <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling || user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN'}>
                {enrolling ? 'Enrolling…' : user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' ? 'Student enrollment only' : 'Enroll Now'}
              </Button>
              {enrollmentError && <p className="mt-3 text-center text-xs text-error">{enrollmentError}</p>}

              <p className="mt-3 text-center text-xs text-navy/50">
                This course includes {lessonsCount} lessons, {quizzesCount} quiz
                {quizzesCount === 1 ? '' : 'zes'} and {assignmentsCount} assignment
                {assignmentsCount === 1 ? '' : 's'}.
              </p>

              <div className="mt-6 border-t border-line pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy/40">
                  Instructor
                </p>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {c.instructor?.avatarUrl ? (
                      <img
                        src={c.instructor.avatarUrl}
                        alt={instructorName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy">{instructorName}</p>
                    {c.instructor?.title && (
                      <p className="truncate text-xs text-navy/50">{c.instructor.title}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ModuleBlock({ module, lessonsCount }) {
  return (
    <details className="group rounded-2xl border border-line bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Module · {lessonsCount} lessons
          </p>
          <h3 className="mt-1 text-base font-bold">{module.title}</h3>
          {module.description && <p className="mt-1 text-sm text-navy/50">{module.description}</p>}
        </div>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-navy/40 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="border-t border-line px-5 py-3">
        {module.lessons?.map((lesson) => (
          <li
            key={lesson.id}
            className="flex items-center justify-between gap-3 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2.5 text-navy/80">
              <PlayCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              {lesson.title}
            </span>
            {lesson.durationMinutes > 0 && (
              <span className="shrink-0 text-xs text-navy/40">{lesson.durationMinutes}m</span>
            )}
          </li>
        ))}
        {module.quizzes?.map((quiz) => (
          <li key={quiz.id} className="flex items-center gap-2.5 py-2.5 text-sm">
            <ClipboardList className="h-4 w-4 text-warning" aria-hidden="true" />
            <span className="text-navy/80">{quiz.title}</span>
            <span className="ml-auto rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
              Quiz
            </span>
          </li>
        ))}
        {module.assignments?.map((assignment) => (
          <li key={assignment.id} className="flex items-center gap-2.5 py-2.5 text-sm">
            <FileText className="h-4 w-4 text-success" aria-hidden="true" />
            <span className="text-navy/80">{assignment.title}</span>
            <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              {assignment.points} pts
            </span>
          </li>
        ))}
        <li className="flex items-center gap-2.5 py-2.5 text-xs font-medium text-navy/40">
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
          {module.lessons?.length || 0} lessons · {module.quizzes?.length || 0} quizzes · {module.assignments?.length || 0} assignments
        </li>
      </ul>
    </details>
  );
}