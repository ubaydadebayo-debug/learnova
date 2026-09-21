import { RefreshCw, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listInstructorStudents } from '../../services/instructorService';

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    listInstructorStudents()
      .then((response) => setStudents(response?.data?.students ?? []))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? students.filter((entry) =>
        [entry.student?.firstName, entry.student?.lastName, entry.student?.email, entry.course?.title]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    : students;

  return (
    <section className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Instructor</p>
          <h1 className="text-3xl font-extrabold">Students</h1>
          <p className="mt-2 text-navy/60">See everyone learning in your courses and how far they have come.</p>
        </div>
        <Link to="/instructor/analytics">
          <Button variant="outline">View analytics</Button>
        </Link>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search students or courses..."
          aria-label="Search students"
          className="w-full rounded-lg border border-line bg-white py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner className="border-primary/30 border-t-primary" /></div>}
      {error && <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white py-16 text-center"><p className="text-error">{error.message}</p><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-primary/50" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">{students.length === 0 ? 'No students yet' : 'No matches'}</h2>
          <p className="mt-2 text-navy/60">{students.length === 0 ? 'Students who enroll in your courses will appear here.' : 'Try a different search.'}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface/70 text-xs uppercase tracking-wide text-navy/50">
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold">Course</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Progress</th>
                  <th className="hidden px-6 py-3 text-right font-semibold md:table-cell">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((entry) => (
                  <tr key={entry.enrollmentId} className="hover:bg-surface/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="h-4 w-4" aria-hidden="true" /></span>
                        <div>
                          <p className="font-semibold">{entry.student?.firstName} {entry.student?.lastName}</p>
                          <p className="text-xs text-navy/50">{entry.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-navy/75">{entry.course?.title}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${entry.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>{entry.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-primary" style={{ width: `${entry.progress?.percent ?? 0}%` }} /></div>
                        <span className="text-navy/60">{entry.progress?.percent ?? 0}%</span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-right text-navy/60 md:table-cell">{new Date(entry.enrolledAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}