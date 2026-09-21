import { ArrowLeft, CheckCircle2, ClipboardList, Clock, FileDown, Paperclip, RefreshCw, Send, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { getAssignment, submitAssignment, downloadSubmissionFile } from '../../services/studentService';

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

export default function StudentAssignmentDetailPage() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getAssignment(assignmentId)
      .then((response) => {
        const next = response.data.assignment;
        setAssignment(next);
        setText(next.submission?.text ?? '');
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [assignmentId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim() && !file) {
      setError({ message: 'Write a response or attach a file before submitting.' });
      return;
    }
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await submitAssignment(assignmentId, { text: text.trim(), file });
      setFile(null);
      setNotice('Your assignment was submitted successfully.');
      load();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const blob = await downloadSubmissionFile(assignment.submission.id);
      saveBlob(blob, assignment.submission.fileName || 'submission');
    } catch (err) {
      setError(err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="border-primary/30 border-t-primary" /></div>;
  if (error && !assignment) return <section className="container-page py-16 text-center"><p className="text-error">{error.message}</p><Button variant="outline" className="mt-4" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></section>;
  if (!assignment) return null;

  const graded = assignment.submission?.status === 'GRADED';
  const hasFile = Boolean(assignment.submission?.fileUrl || assignment.submission?.fileName);
  return <section className="container-page py-8">
    <Link to="/student/assignments" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Assignments</Link>
    <div className="mx-auto max-w-3xl"><div className="mb-8"><div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary"><ClipboardList className="h-4 w-4" aria-hidden="true" />{assignment.module.course.title}</div><h1 className="mt-2 text-3xl font-extrabold">{assignment.title}</h1><p className="mt-2 text-sm text-navy/50">{assignment.module.title} · {assignment.points} points</p>{assignment.dueDate && <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-navy/60"><Clock className="h-4 w-4" aria-hidden="true" />Due {new Date(assignment.dueDate).toLocaleDateString()}</p>}</div>
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8"><h2 className="mb-3 text-lg font-bold">Instructions</h2><p className="whitespace-pre-wrap text-sm leading-7 text-navy/75">{assignment.instructions || 'No additional instructions were provided.'}</p></div>
      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Your submission</h2>{assignment.submission && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{assignment.submission.status}</span>}</div>
        {hasFile && assignment.submission.fileName && <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3 text-sm"><span className="inline-flex min-w-0 items-center gap-2 text-navy/75"><FileDown className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{assignment.submission.fileName}{assignment.submission.fileSize ? <span className="ml-1 text-xs text-navy/45">({formatFileSize(assignment.submission.fileSize)})</span> : null}</span></span><Button type="button" size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>{downloading ? <Spinner /> : <FileDown className="h-4 w-4" aria-hidden="true" />}Download</Button></div>}
        <textarea value={text} onChange={(event) => setText(event.target.value)} disabled={graded || submitting} rows={12} maxLength={30000} placeholder="Write your response here, or attach a PDF, document or image below (or both)." className="mt-4 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm leading-6 text-navy placeholder:text-navy/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        {!graded && <div className="mt-4">
          {file ? (<div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3 text-sm"><span className="inline-flex min-w-0 items-center gap-2 text-navy/75"><Paperclip className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{file.name}</span></span><button type="button" onClick={() => setFile(null)} className="rounded p-1 text-navy/40 hover:bg-error/10 hover:text-error" aria-label="Remove file"><X className="h-4 w-4" /></button></div>) : (<label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface/50 px-4 py-4 text-sm text-navy/60 transition-colors hover:border-primary hover:text-primary"><Paperclip className="h-4 w-4" aria-hidden="true" />Attach a file (PDF, DOC, DOCX, TXT, PNG, JPG, GIF, WEBP — max 10 MB)<input type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>)}
        </div>}
        {assignment.submission?.feedback && <div className="mt-4 rounded-lg bg-surface p-4"><p className="text-xs font-semibold uppercase tracking-wider text-navy/50">Instructor feedback</p><p className="mt-2 text-sm text-navy/75">{assignment.submission.feedback}</p></div>}{assignment.submission?.grade !== null && assignment.submission?.grade !== undefined && <p className="mt-4 text-sm font-semibold text-success">Grade: {assignment.submission.grade} / {assignment.points}</p>}{error && <p className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error.message}</p>}{notice && <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{notice}</p>} {!graded && <div className="mt-5"><Button type="submit" disabled={submitting}><Send className="h-4 w-4" aria-hidden="true" />{submitting ? 'Submitting…' : assignment.submission ? 'Resubmit assignment' : 'Submit assignment'}</Button></div>}</form>
    </div>
  </section>;
}