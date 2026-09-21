import { ClipboardList, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listAssignments } from '../../services/adminService';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAssignments({
        search: search.trim(),
        page: pagination.page,
        limit: 12,
      });
      const data = response?.data ?? {};
      setAssignments(data.assignments ?? []);
      setPagination(data.pagination ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <section className="container-page py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Admin</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Assignment oversight</h1>
        <p className="mt-1 text-navy/60">Review every assignment on the platform and its submission activity.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search assignments"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search assignment, course, module or instructor…"
            className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-navy/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
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
      ) : assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <ClipboardList className="mx-auto mb-4 h-10 w-10 text-primary/50" />
          <h2 className="text-xl font-bold">No assignments found</h2>
          <p className="mt-2 text-navy/60">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-line bg-surface/50 text-xs uppercase tracking-wide text-navy/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Assignment</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 text-center font-semibold">Submissions</th>
                <th className="px-4 py-3 text-center font-semibold">Pending</th>
                <th className="px-4 py-3 text-center font-semibold">Graded</th>
                <th className="px-4 py-3 text-center font-semibold">Avg grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{assignment.title}</p>
                    <span className="text-xs text-navy/50">Points {assignment.points}{assignment.dueDate ? ` · Due ${new Date(assignment.dueDate).toLocaleDateString()}` : ''}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/course/${assignment.module.course.slug}`} className="block max-w-[240px] truncate font-semibold hover:text-primary" title={assignment.module.course.title}>
                      {assignment.module.course.title}
                    </Link>
                    <span className="text-xs text-navy/50">{assignment.module.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{assignment.module.course.instructor.firstName} {assignment.module.course.instructor.lastName}</p>
                    <span className="text-xs text-navy/50">{assignment.module.course.instructor.email}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-navy/70">{assignment.submissions}</td>
                  <td className="px-4 py-3 text-center">
                    {assignment.pending > 0 ? (
                      <span className="inline-flex justify-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">{assignment.pending}</span>
                    ) : (
                      <span className="text-xs text-navy/40">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-navy/70">{assignment.graded}</td>
                  <td className="px-4 py-3 text-center">
                    {assignment.graded > 0 && assignment.averageGrade !== null ? (
                      <span className="text-sm font-semibold text-success">{assignment.averageGrade}/{assignment.points}</span>
                    ) : (
                      <span className="text-xs text-navy/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-sm text-navy/60">
              <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} assignments</span>
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