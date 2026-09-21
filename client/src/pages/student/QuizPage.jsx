import { ArrowLeft, CheckCircle2, ClipboardCheck, RefreshCw, Send, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { getQuiz, submitQuiz } from '../../services/studentService';

export default function StudentQuizPage() {
  const { courseId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getQuiz(quizId)
      .then((response) => setQuiz(response.data.quiz))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [quizId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await submitQuiz(
        quizId,
        Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId }))
      );
      setResult(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="border-primary/30 border-t-primary" /></div>;
  if (error && !quiz) return <section className="container-page py-16 text-center"><p className="text-error">{error.message}</p><Button variant="outline" className="mt-4" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></section>;
  if (!quiz) return null;

  return <section className="container-page py-8">
    <Link to={`/student/courses/${courseId}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to course</Link>
    <div className="mx-auto max-w-3xl"><div className="mb-8"><div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary"><ClipboardCheck className="h-4 w-4" aria-hidden="true" />Quiz</div><h1 className="mt-2 text-3xl font-extrabold">{quiz.title}</h1><p className="mt-2 text-navy/60">{quiz.description || 'Check your understanding of this course content.'}</p><p className="mt-3 text-sm text-navy/60">{(quiz.questions ?? []).length} questions · Passing score {quiz.passingScore}%</p></div>
      {result ? <QuizResult result={result} /> : <form onSubmit={handleSubmit} className="space-y-5">{quiz.questions.map((question, index) => <fieldset key={question.id} className="rounded-2xl border border-line bg-white p-6"><legend className="mb-4 block w-full text-base font-bold"><span className="mr-2 text-primary">{index + 1}.</span>{question.prompt}</legend><div className="space-y-2">{question.options.map((option) => <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${answers[question.id] === option.id ? 'border-primary bg-primary/5' : 'border-line hover:bg-surface'}`}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} className="h-4 w-4 accent-primary" />{option.text}</label>)}</div></fieldset>)}{error && <p className="rounded-lg bg-error/10 p-3 text-sm text-error">{error.message}</p>}<Button type="submit" disabled={submitting}><Send className="h-4 w-4" aria-hidden="true" />{submitting ? 'Submitting…' : 'Submit quiz'}</Button></form>}
    </div>
  </section>;
}

function QuizResult({ result }) {
  const { attempt, quiz, review } = result;
  return <div className="space-y-5"><div className={`rounded-2xl border p-6 ${attempt.passed ? 'border-success/30 bg-success/10' : 'border-warning/30 bg-warning/10'}`}><div className="flex items-center gap-3">{attempt.passed ? <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" /> : <XCircle className="h-7 w-7 text-warning" aria-hidden="true" />}<div><h2 className="text-xl font-bold">{attempt.passed ? 'Quiz passed' : 'Keep practicing'}</h2><p className="mt-1 text-sm text-navy/70">You scored {attempt.score}/{attempt.maxScore} ({attempt.percentage}%). Passing score: {quiz.passingScore}%.</p></div></div></div><div className="space-y-3">{review.map((item, index) => <div key={item.questionId} className="rounded-xl border border-line bg-white p-5"><div className="flex gap-3"><span className="font-bold text-primary">{index + 1}.</span><div><p className="font-semibold">{item.prompt}</p><p className={`mt-2 text-sm ${item.isCorrect ? 'text-success' : 'text-error'}`}>{item.isCorrect ? 'Correct' : 'Incorrect'}</p>{item.explanation && <p className="mt-2 text-sm text-navy/60">{item.explanation}</p>}</div></div></div>)}</div></div>;
}