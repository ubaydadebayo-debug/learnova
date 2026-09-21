import { ArrowLeft, CheckCircle2, ClipboardList, FileDown, RefreshCw, Save, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { getInstructorAssignment, gradeSubmission, downloadSubmissionFile } from '../../services/instructorService';

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename || 'submission';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function InstructorAssignmentDetailPage() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getInstructorAssignment(assignmentId).then((response) => setAssignment(response.data.assignment)).catch(setError).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [assignmentId]);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="border-primary/30 border-t-primary" /></div>;
  if (error && !assignment) return <section className="container-page py-16 text-center"><p className="text-error">{error.message}</p><Button variant="outline" className="mt-4" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></section>;
  if (!assignment) return null;

  return <section className="container-page py-8"><Link to="/instructor/assignments" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Assignments</Link><div className="mb-8"><div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary"><ClipboardList className="h-4 w-4" aria-hidden="true" />{assignment.module.course.title}</div><h1 className="mt-2 text-3xl font-extrabold">{assignment.title}</h1><p className="mt-2 text-sm text-navy/50">{assignment.module.title} · {assignment.points} points</p><p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-navy/70">{assignment.instructions || 'No additional instructions.'}</p></div>{assignment.submissions.length === 0 ? <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center"><UserRound className="mx-auto h-10 w-10 text-primary/50" aria-hidden="true" /><h2 className="mt-4 text-xl font-bold">No submissions yet</h2><p className="mt-2 text-navy/60">Student submissions will appear here.</p></div> : <div className="space-y-5">{assignment.submissions.map((submission) => <SubmissionCard key={submission.id} submission={submission} points={assignment.points} onSaved={load} />)}</div>}</section>;
}

function SubmissionCard({ submission, points, onSaved }) {
  const [grade, setGrade] = useState(submission.grade ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await gradeSubmission(submission.id, { grade: Number(grade), feedback });
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const download = async () => {
    setDownloading(true);
    setError(null);
    try {
      const blob = await downloadSubmissionFile(submission.id);
      saveBlob(blob, submission.fileName || 'submission');
    } catch (err) {
      setError(err);
    } finally {
      setDownloading(false);
    }
  };

  return <article className="rounded-2xl border border-line bg-white p-6"><div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-bold">{submission.student.firstName} {submission.student.lastName}</h2><p className="text-sm text-navy/50">{submission.student.email}</p></div></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${submission.status === 'GRADED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{submission.status}</span></div><div className="mt-5 whitespace-pre-wrap rounded-lg bg-surface p-4 text-sm leading-6 text-navy/80">{submission.text || 'No text submitted.'}</div>{submission.fileName && <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3 text-sm"><span className="inline-flex min-w-0 items-center gap-2 text-navy/75"><FileDown className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{submission.fileName}{submission.fileSize ? <span className="ml-1 text-xs text-navy/45">({formatFileSize(submission.fileSize)})</span> : null}</span></span><Button type="button" size="sm" variant="outline" onClick={download} disabled={downloading}>{downloading ? <Spinner /> : <FileDown className="h-4 w-4" aria-hidden="true" />}Download</Button></div>}<form onSubmit={save} className="mt-5 grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-end"><div><label htmlFor={`grade-${submission.id}`} className="mb-1.5 block text-sm font-semibold">Grade / {points}</label><input id={`grade-${submission.id}`} type="number" min="0" max={points} required value={grade} onChange={(event) => setGrade(event.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></div><div><label htmlFor={`feedback-${submission.id}`} className="mb-1.5 block text-sm font-semibold">Feedback</label><textarea id={`feedback-${submission.id}`} rows={2} maxLength={10000} value={feedback} onChange={(event) => setFeedback(event.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Share useful feedback..." /></div><Button type="submit" disabled={saving}><Save className="h-4 w-4" aria-hidden="true" />{saving ? 'Saving…' : 'Save grade'}</Button></form>{error && <p className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error.message}</p>}{saved && <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Grade saved</p>}</article>
}