import { BookOpen, ClipboardCheck, GraduationCap, ListChecks, Award, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { getInstructorAnalytics, getCourseAnalytics, listCourseStudents } from '../../services/instructorService';

export default function InstructorAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getInstructorAnalytics()
      .then((response) => {
        const data = response?.data ?? null;
        setAnalytics(data);
        if (data?.courses?.length > 0) {
          setSelectedCourseId((current) => current ?? data.courses[0].id);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    let active = true;
    setDetailLoading(true);
    Promise.all([getCourseAnalytics(selectedCourseId), listCourseStudents(selectedCourseId)])
      .then(([analyticsResponse, studentsResponse]) => {
        if (!active) return;
        setCourseDetail({
          analytics: analyticsResponse?.data?.course ?? null,
          students: studentsResponse?.data?.students ?? [],
        });
      })
      .catch(() => {
        if (active) setCourseDetail(null);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => { active = false; };
  }, [selectedCourseId]);

  if (loading) {
    return <section className="container-page flex justify-center py-24"><Spinner className="border-primary/30 border-t-primary" /></section>;
  }

  if (error) {
    return (
      <section className="container-page flex flex-col items-center gap-4 rounded-2xl py-16 text-center">
        <p className="text-error">{error.message}</p>
        <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button>
      </section>
    );
  }

  const metrics = analytics?.metrics ?? {};

  return (
    <section className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Instructor</p>
          <h1 className="text-3xl font-extrabold">Analytics</h1>
          <p className="mt-2 text-navy/60">Understand how learners engage with your courses.</p>
        </div>
        <Link to="/instructor/students">
          <Button variant="outline"><Users className="h-4 w-4" aria-hidden="true" />View students</Button>
        </Link>
      </div>

      {(analytics?.courses ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <TrendingUp className="mx-auto h-10 w-10 text-primary/50" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">No analytics yet</h2>
          <p className="mt-2 text-navy/60">Once students enroll and complete lessons, insights will appear here.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={BookOpen} label="Courses" value={metrics.totalCourses ?? 0} detail={`${metrics.published ?? 0} published`} />
            <MetricCard icon={Users} label="Students" value={metrics.students ?? 0} detail={`${metrics.activeEnrollments ?? 0} active`} />
            <MetricCard icon={GraduationCap} label="Completion rate" value={`${metrics.completionRate ?? 0}%`} detail={`${metrics.completedEnrollments ?? 0} completed`} />
            <MetricCard icon={Award} label="Certificates" value={metrics.certificates ?? 0} detail={`${metrics.averageRating ?? '—'} avg rating`} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Course statistics</h2>
              <div className="space-y-3">
                {(analytics?.courses ?? []).map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${course.id === selectedCourseId ? 'border-primary/40 bg-primary/5' : 'border-line bg-surface hover:border-primary/30'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{course.title}</p>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[course.status] ?? 'bg-surface text-navy ring-1 ring-line'}`}>{course.status}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div><p className="text-navy/50">Students</p><p className="font-bold">{course.stats?.students ?? 0}</p></div>
                      <div><p className="text-navy/50">Progress</p><p className="font-bold">{course.stats?.progressRate ?? 0}%</p></div>
                      <div><p className="text-navy/50">Completed</p><p className="font-bold">{course.stats?.enrollments?.COMPLETED ?? 0}</p></div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Course breakdown</h2>
              {detailLoading ? (
                <div className="flex justify-center py-16"><Spinner className="border-primary/30 border-t-primary" /></div>
              ) : courseDetail?.analytics ? (
                <Breakdown analytics={courseDetail.analytics} />
              ) : (
                <p className="py-8 text-center text-navy/60">Select a course to see its breakdown.</p>
              )}
            </section>
          </div>

          {courseDetail?.students?.length > 0 && (
            <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-line p-6">
                <h2 className="text-xl font-bold">Enrolled students</h2>
                <Link to="/instructor/students" className="text-sm font-semibold text-primary">View all</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface/70 text-xs uppercase tracking-wide text-navy/50">
                      <th className="px-6 py-3 font-semibold">Student</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Progress</th>
                      <th className="hidden px-6 py-3 text-right font-semibold md:table-cell">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {courseDetail.students.slice(0, 8).map((entry) => (
                      <tr key={entry.enrollmentId} className="hover:bg-surface/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="h-4 w-4" aria-hidden="true" /></span>
                            <div>
                              <p className="font-semibold">{entry.student.firstName} {entry.student.lastName}</p>
                              <p className="text-xs text-navy/50">{entry.student.email}</p>
                            </div>
                          </div>
                        </td>
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
            </section>
          )}
        </>
      )}
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <p className="mt-4 text-sm text-navy/60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-navy/50">{detail}</p>
    </div>
  );
}

function Breakdown({ analytics }) {
  const quizzes = analytics.stats?.quizzes ?? {};
  const assignments = analytics.stats?.assignments ?? {};
  const enrollments = analytics.stats?.enrollments ?? {};
  const lessons = analytics.stats?.lessons ?? {};

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Enrolled" value={enrollments.total ?? 0} />
        <MiniStat label="Active" value={enrollments.ACTIVE ?? 0} />
        <MiniStat label="Completed" value={enrollments.COMPLETED ?? 0} />
        <MiniStat label="Completion" value={`${analytics.stats?.completionRate ?? 0}%`} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold"><ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />Quiz performance</span></div>
        <StatRow label="Submitted attempts" value={String(quizzes.attempts ?? 0)} />
        <StatRow label="Passed" value={String(quizzes.passed ?? 0)} />
        <StatRow label="Average score" value={quizzes.averagePercentage === null || quizzes.averagePercentage === undefined ? '—' : `${quizzes.averagePercentage}%`} />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ClipboardCheck className="h-4 w-4 text-primary" aria-hidden="true" />Assignment overview</div>
        <StatRow label="Submissions" value={String(assignments.total ?? 0)} />
        <StatRow label="Pending review" value={String(assignments.pending ?? 0)} />
        <StatRow label="Graded" value={String(assignments.graded ?? 0)} />
        <StatRow label="Average grade" value={assignments.averageGrade === null || assignments.averageGrade === undefined ? '—' : `${assignments.averageGrade} pts`} />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />Content engagement</div>
        <StatRow label="Lessons completed" value={`${lessons.completed ?? 0} / ${lessons.total ?? 0}`} />
        <StatRow label="Certificates issued" value={String(analytics.stats?.certificates ?? 0)} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3 text-center">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-navy/50">{label}</p>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0">
      <span className="text-navy/60">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const statusStyles = {
  DRAFT: 'bg-surface text-navy ring-1 ring-line',
  PUBLISHED: 'bg-success/10 text-success',
  ARCHIVED: 'bg-warning/10 text-warning',
};