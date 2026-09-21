import { BookOpen, RefreshCw, RotateCcw, Search, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listEnrollments, updateEnrollmentStatus } from '../../services/adminService';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  ACTIVE: 'bg-success/10 text-success',
  COMPLETED: 'bg-primary/10 text-primary',
  CANCELLED: 'bg-error/10 text-error',
};

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listEnrollments({
        search: search.trim(),
        status: status === 'all' ? '' : status,
        page: pagination.page,
        limit: 12,
      });
      const data = response?.data ?? {};
      setEnrollments(data.enrollments ?? []);
      setPagination(data.pagination ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const changeStatus = async (enrollment, next) => {
    if (enrollment.status === next) return;
    setBusy(enrollment.id);
    setError(null);
    try {
      await updateEnrollmentStatus(enrollment.id, next);
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
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Enrollment management</h1>
        <p className="mt-1 text-navy/60">Track enrollments across every course and manage access.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search enrollments"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search student or course…"
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
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
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
      ) : enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary/50" />
          <h2 className="text-xl font-bold">No enrollments found</h2>
          <p className="mt-2 text-navy/60">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-line bg-surface/50 text-xs uppercase tracking-wide text-navy/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Enrolled</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{enrollment.student.firstName} {enrollment.student.lastName}</p>
                    <span className="text-xs text-navy/50">{enrollment.student.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/course/${enrollment.course.slug}`} className="block max-w-[260px] truncate font-semibold hover:text-primary" title={enrollment.course.title}>
                      {enrollment.course.title}
                    </Link>
                    <span className="text-xs text-navy/50">{enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}</span>
                  </td>
                  <td className="px-4 py-3 text-navy/70">{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[enrollment.status]}`}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {enrollment.status === 'ACTIVE' && (
                        <Button size="sm" variant="outline" disabled={busy === enrollment.id} onClick={() => changeStatus(enrollment, 'CANCELLED')}>
                          <XCircle className="h-4 w-4" aria-hidden="true" />Cancel
                        </Button>
                      )}
                      {enrollment.status === 'CANCELLED' && (
                        <Button size="sm" variant="outline" disabled={busy === enrollment.id} onClick={() => changeStatus(enrollment, 'ACTIVE')}>
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />Reactivate
                        </Button>
                      )}
                      {enrollment.status === 'COMPLETED' && (
                        <span className="text-xs text-navy/40">Completed</span>
                      )}
                      {busy === enrollment.id && <Spinner className="border-primary/30 border-t-primary" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-sm text-navy/60">
              <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} enrollments</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>Previous</Button>
                <Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}