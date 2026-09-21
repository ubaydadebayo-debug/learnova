import { Award, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listCertificates } from '../../services/adminService';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCertificates({
        search: search.trim(),
        page: pagination.page,
        limit: 12,
      });
      const data = response?.data ?? {};
      setCertificates(data.certificates ?? []);
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
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Certificate registry</h1>
        <p className="mt-1 text-navy/60">Review every credential issued on the platform.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search certificates"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search student, course or certificate number…"
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
      ) : certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <Award className="mx-auto mb-4 h-10 w-10 text-primary/50" />
          <h2 className="text-xl font-bold">No certificates found</h2>
          <p className="mt-2 text-navy/60">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-surface/50 text-xs uppercase tracking-wide text-navy/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Certificate</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Issued</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {certificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-navy/70">{certificate.number}</span>
                    <span className="block text-xs text-navy/50">Code: {certificate.verificationCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{certificate.student.firstName} {certificate.student.lastName}</p>
                    <span className="text-xs text-navy/50">{certificate.student.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/course/${certificate.course.slug}`} className="block max-w-[240px] truncate font-semibold hover:text-primary" title={certificate.course.title}>
                      {certificate.course.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-navy/70">{new Date(certificate.issuedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Link to={`/certificates/verify/${certificate.verificationCode}`}>
                        <Button size="sm" variant="outline">
                          <Award className="h-4 w-4" aria-hidden="true" />View
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-sm text-navy/60">
              <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} certificates</span>
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