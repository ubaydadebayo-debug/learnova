import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, Layers, ListChecks, Users, BookOpen, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listCourses, updateCourse, deleteCourse } from '../../services/adminService';
import { LEVEL_STYLES } from '../../constants/courses';

const STATUS_STYLES = {
  DRAFT: 'bg-surface text-navy ring-1 ring-line',
  PUBLISHED: 'bg-success/10 text-success',
  ARCHIVED: 'bg-warning/10 text-warning',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCourses({
        search: debouncedSearch,
        status: status === 'all' ? '' : status,
        page: pagination.page,
        limit: 12,
      });
      const data = response?.data ?? {};
      setCourses(data.courses ?? []);
      setPagination(data.pagination ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (course, next) => {
    if (next === course.status) return;
    setBusy(`${course.id}:status`);
    setError(null);
    try {
      await updateCourse(course.id, { status: next });
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (course) => {
    if (!window.confirm(`Delete "${course.title}" and all of its content? This cannot be undone.`)) return;
    setBusy(`${course.id}:delete`);
    setError(null);
    try {
      await deleteCourse(course.id);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="container-page py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Admin</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Course Management</h1>
        <p className="mt-1 text-navy/60">Oversee every course on the platform.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search courses"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search courses…"
            className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-navy/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-navy sm:flex-row sm:items-center sm:justify-between">
          <span role="alert">{error.message}</span>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="border-primary/30 border-t-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary/50" />
          <h2 className="text-xl font-bold">No courses found</h2>
          <p className="mt-2 text-navy/60">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-surface/50 text-xs uppercase tracking-wide text-navy/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 font-semibold">Level</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Stats</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <Link
                      to={`/course/${course.slug}`}
                      className="block max-w-[280px] truncate font-semibold hover:text-primary"
                      title={course.title}
                    >
                      {course.title}
                    </Link>
                    <span className="text-xs text-navy/50">{course.category?.name ?? 'Uncategorized'}</span>
                  </td>
                  <td className="px-4 py-3 text-navy/70">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_STYLES[course.level]}`}>
                      {course.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={course.status}
                      disabled={busy === `${course.id}:status`}
                      onChange={(e) => changeStatus(course, e.target.value)}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 ${STATUS_STYLES[course.status]}`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-navy/60">
                      <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{course.modules.length}</span>
                      <span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" />{course.stats.lessons}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.stats.students}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/instructor/courses/${course.id}/builder`}>
                        <Button size="sm" variant="ghost">Builder</Button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(course)}
                        disabled={busy === `${course.id}:delete`}
                        className="rounded-lg p-2 text-navy/40 transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${course.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-sm text-navy/60">
              <span>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} courses
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}