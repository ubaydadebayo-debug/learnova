import { ClipboardList, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listAssignments } from '../../services/studentService';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listAssignments()
      .then((response) => setAssignments(response.data.assignments ?? []))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return <section className="container-page py-8">
    <div className="mb-8"><p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Learning</p><h1 className="text-3xl font-extrabold">Assignments</h1><p className="mt-2 text-navy/60">Submit work and review feedback from your instructors.</p></div>
    {loading && <div className="flex justify-center py-20"><Spinner className="border-primary/30 border-t-primary" /></div>}
    {error && <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white py-16 text-center"><p className="text-error">{error.message}</p><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></div>}
    {!loading && !error && assignments.length === 0 && <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center"><ClipboardList className="mx-auto h-10 w-10 text-primary/50" aria-hidden="true" /><h2 className="mt-4 text-xl font-bold">No assignments yet</h2><p className="mt-2 text-navy/60">Assignments from your enrolled courses will appear here.</p></div>}
    {!loading && !error && assignments.length > 0 && <div className="overflow-hidden rounded-2xl border border-line bg-white"><div className="divide-y divide-line">{assignments.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} />)}</div></div>}
  </section>;
}

function AssignmentRow({ assignment }) {
  const status = assignment.submission?.status ?? 'PENDING';
  return <Link to={`/student/assignments/${assignment.id}`} className="flex flex-col gap-3 p-5 transition-colors hover:bg-surface/50 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ClipboardList className="h-4 w-4" aria-hidden="true" /></span><div className="min-w-0"><h2 className="truncate font-bold">{assignment.title}</h2><p className="mt-1 truncate text-sm text-navy/50">{assignment.module.course.title} · {assignment.module.title}</p></div></div><div className="flex items-center gap-3 pl-12 text-sm sm:pl-0"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'GRADED' ? 'bg-success/10 text-success' : status === 'SUBMITTED' ? 'bg-primary/10 text-primary' : 'bg-surface text-navy/60'}`}>{status}</span><span className="text-navy/50">{assignment.points} pts</span></div></Link>;
}