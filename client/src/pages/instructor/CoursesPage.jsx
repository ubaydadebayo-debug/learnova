import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, BookOpen, Layers, ListChecks, ClipboardList, Users, Eye, EyeOff, Archive, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  listInstructorCourses,
  publishCourse,
  archiveCourse,
  deleteCourse,
} from '../../services/instructorService';
import { LEVEL_STYLES } from '../../constants/courses';
import { formatDuration } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
  DRAFT: 'bg-surface text-navy ring-1 ring-line',
  PUBLISHED: 'bg-success/10 text-success',
  ARCHIVED: 'bg-warning/10 text-warning',
};

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listInstructorCourses();
      setCourses(response?.data?.courses ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublished = async (course) => {
    setBusy(`${course.id}:publish`);
    try {
      if (course.status === 'PUBLISHED') await archiveCourse(course.id);
      else await publishCourse(course.id);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setBusy(`${course.id}:delete`);
    try {
      await deleteCourse(course.id);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  if (user?.status === 'PENDING') {
    return (
      <section className="container-page flex flex-col items-center justify-center py-24 text-center">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LayoutDashboard className="h-8 w-8" />
        </span>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">Course Management</p>
        <h1 className="mb-4 text-3xl font-extrabold">Awaiting approval</h1>
        <p className="max-w-xl text-lg text-navy/60">
          Your instructor account must be approved before you can create and publish courses.
        </p>
      </section>
    );
  }

  return (
    <section className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Course Management</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">My Courses</h1>
          <p className="mt-1 text-navy/60">Create, build and publish your learning experiences.</p>
        </div>
        <Button onClick={() => navigate('/instructor/courses/create')}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Course
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-navy">
          {error.message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="border-primary/30 border-t-primary" />
        </div>
      ) : courses && courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary/50" />
          <h2 className="text-xl font-bold">No courses yet</h2>
          <p className="mx-auto mt-2 max-w-md text-navy/60">
            Create your first course to start building modules, lessons and quizzes.
          </p>
          <Link to="/instructor/courses/create" className="mt-6 inline-block">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create your first course
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <Link to={`/instructor/courses/${course.id}/builder`} className="min-w-0">
                  <h2 className="truncate text-lg font-bold hover:text-primary">{course.title}</h2>
                  <p className="truncate text-sm text-navy/50">{course.category?.name}</p>
                </Link>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[course.status]}`}>
                  {course.status}
                </span>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy/60">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${LEVEL_STYLES[course.level]}`}>{course.level}</span>
                <span>{formatDuration(course.durationMinutes)}</span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> {course.stats.modules} modules
                </span>
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5" /> {course.stats.lessons} lessons
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {course.stats.students}
                </span>
                {course.stats.quizzes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5" /> {course.stats.quizzes} quizzes
                  </span>
                )}
                {course.stats.assignments > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5" /> {course.stats.assignments} assignments
                  </span>
                )}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Link to={`/instructor/courses/${course.id}/builder`}>
                  <Button size="sm" variant="outline">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Builder
                  </Button>
                </Link>
                <Link to={`/instructor/courses/${course.id}/edit`}>
                  <Button size="sm" variant="ghost">Edit details</Button>
                </Link>
                <Button
                  size="sm"
                  variant={course.status === 'PUBLISHED' ? 'ghost' : 'outline'}
                  disabled={busy === `${course.id}:publish`}
                  onClick={() => togglePublished(course)}
                  className={course.status === 'PUBLISHED' ? 'text-warning' : 'text-success'}
                >
                  {course.status === 'PUBLISHED' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {course.status === 'PUBLISHED' ? 'Archive' : 'Publish'}
                </Button>
                <button
                  type="button"
                  onClick={() => remove(course)}
                  disabled={busy === `${course.id}:delete`}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg p-2 text-navy/40 transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
                  aria-label={`Delete ${course.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}