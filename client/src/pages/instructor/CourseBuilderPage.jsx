import { useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
  Eye,
  EyeOff,
  X,
  Check,
  Layers,
  ListChecks,
  FileText,
  Play,
  Link2,
  ClipboardCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  getCourse,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  createResource,
  deleteResource,
  publishCourse,
  archiveCourse,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../../services/instructorService';
import { LEVEL_STYLES } from '../../constants/courses';
import { formatDuration } from '../../utils/format';

const STATUS_STYLES = {
  DRAFT: 'bg-surface text-navy ring-1 ring-line',
  PUBLISHED: 'bg-success/10 text-success',
  ARCHIVED: 'bg-warning/10 text-warning',
};

export default function CourseBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourse(id);
      setCourse(response?.data?.course ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const run = async (operation) => {
    setError(null);
    try {
      await operation();
      await load();
    } catch (err) {
      setError(err);
    }
  };

  const togglePublished = () =>
    run(async () => {
      if (course.status === 'PUBLISHED') await archiveCourse(course.id);
      else await publishCourse(course.id);
    });

  const moveModule = (index, direction) => {
    const next = [...course.modules];
    const target = index + direction;
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    run(() => reorderModules(course.id, next.map((module) => module.id)));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <section className="container-page flex flex-col items-center py-24 text-center">
        <h1 className="mb-4 text-2xl font-extrabold">Course not found</h1>
        <Link to="/instructor/courses" className="text-primary">Back to My Courses</Link>
      </section>
    );
  }

  const lessonsCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <section className="container-page py-8">
      <Link
        to="/instructor/courses"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy/60 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        My Courses
      </Link>

      <div className="mb-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{course.title}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[course.status]}`}>
                {course.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy/60">
              <span>{course.category?.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_STYLES[course.level]}`}>
                {course.level}
              </span>
              <span>{formatDuration(course.durationMinutes)}</span>
              <span className="inline-flex items-center gap-1">
                <Layers className="h-4 w-4" /> {course.modules.length} modules
              </span>
              <span className="inline-flex items-center gap-1">
                <ListChecks className="h-4 w-4" /> {lessonsCount} lessons
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/instructor/courses/${course.id}/edit`}>
              <Button size="sm" variant="outline">
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit details
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4" aria-hidden="true" />
              Preview
            </Button>
            <Button
              size="sm"
              variant={course.status === 'PUBLISHED' ? 'ghost' : 'primary'}
              onClick={togglePublished}
              className={course.status === 'PUBLISHED' ? 'text-warning' : ''}
            >
              {course.status === 'PUBLISHED' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {course.status === 'PUBLISHED' ? 'Archive' : 'Publish'}
            </Button>
          </div>
        </div>
        {course.shortDescription && (
          <p className="mt-3 max-w-3xl text-sm text-navy/70">{course.shortDescription}</p>
        )}
        {course.status === 'DRAFT' && (
          <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-navy/60">
            This course is a draft. Publish it once it has at least one module with a lesson.
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-navy">
          {error.message}
        </div>
      )}

      <div className="space-y-6">
        {course.modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
            <Layers className="mx-auto mb-4 h-10 w-10 text-primary/50" />
            <h2 className="text-xl font-bold">Start with your first module</h2>
            <p className="mx-auto mt-2 max-w-md text-navy/60">
              Modules group related lessons. Add one to begin structuring your course.
            </p>
          </div>
        ) : (
          course.modules.map((module, index) => (
            <ModuleBlock
              key={module.id}
              module={module}
              index={index}
              total={course.modules.length}
              onMove={moveModule}
              setError={setError}
              reload={load}
            />
          ))
        )}

        <AddModuleForm courseId={course.id} onAdd={() => run(Promise.resolve)} />
      </div>

      {previewOpen && (
        <PreviewModal course={course} onClose={() => setPreviewOpen(false)} />
      )}
    </section>
  );
}

function AddModuleForm({ courseId, onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createModule(courseId, { title: title.trim(), description: description.trim() || null });
      setTitle('');
      setDescription('');
      onAdd();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-dashed border-line bg-white/60 p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy/60">Add module</h2>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          required
          placeholder="Module title (e.g. Foundations)"
          className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm placeholder:text-navy/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          placeholder="Optional description"
          className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm placeholder:text-navy/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit" size="md" disabled={saving}>
          {saving ? <Spinner /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          Add module
        </Button>
      </div>
    </form>
  );
}

function ModuleBlock({ module, index, total, onMove, setError, reload }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveEdits = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setError(null);
    try {
      await updateModule(module.id, { title: title.trim(), description: description.trim() || null });
      setEditing(false);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const removeModule = async () => {
    setError(null);
    try {
      await deleteModule(module.id);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-line p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={saveEdits} className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                required
                className="w-full rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                placeholder="Optional description"
                className="w-full rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="secondary">
                  <Check className="h-4 w-4" aria-hidden="true" /> Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="font-bold">{module.title}</h2>
              {module.description && <p className="mt-0.5 text-sm text-navy/60">{module.description}</p>}
              <p className="mt-1 text-xs text-navy/60">
                {(module.lessons ?? []).length} lessons · {(module.quizzes ?? []).length} quizzes · {(module.assignments ?? []).length} assignments
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="rounded-lg p-1.5 text-navy/50 hover:bg-surface hover:text-navy disabled:opacity-30"
            aria-label="Move module up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            className="rounded-lg p-1.5 text-navy/50 hover:bg-surface hover:text-navy disabled:opacity-30"
            aria-label="Move module down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          {!editing && (
            <button
              type="button"
              onClick={() => {
                setTitle(module.title);
                setDescription(module.description ?? '');
                setEditing(true);
              }}
              className="rounded-lg p-1.5 text-navy/50 hover:bg-surface hover:text-navy"
              aria-label="Edit module"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {confirmDelete ? (
            <span className="flex items-center gap-1 pl-1">
              <Button size="sm" variant="ghost" className="text-error" onClick={removeModule}>
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-1.5 text-navy/50 hover:bg-error/10 hover:text-error"
              aria-label="Delete module"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {module.lessons.length === 0 ? (
          <p className="mb-4 text-sm text-navy/40">No lessons in this module yet.</p>
        ) : (
          <ul className="space-y-2">
            {module.lessons.map((lesson, lessonIndex) => (
              <LessonRow key={lesson.id} lesson={lesson} moduleId={module.id} lessonIndex={lessonIndex} lessons={module.lessons} setError={setError} reload={reload} />
            ))}
          </ul>
        )}
        <AddLessonForm moduleId={module.id} reload={reload} setError={setError} />

        <div className="mt-6 border-t border-line pt-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy/60">
            <ClipboardCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
            Quizzes
          </div>
          {module.quizzes.length === 0 ? (
            <p className="mb-3 text-sm text-navy/40">No quizzes in this module yet.</p>
          ) : (
            <ul className="space-y-3">
              {module.quizzes.map((quiz) => (
                <QuizBlock key={quiz.id} quiz={quiz} setError={setError} reload={reload} />
              ))}
            </ul>
          )}
          <AddQuizForm moduleId={module.id} reload={reload} setError={setError} />
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy/60">
            <FileText className="h-4 w-4 text-success" aria-hidden="true" />
            Assignments
          </div>
          {module.assignments.length === 0 ? (
            <p className="mb-3 text-sm text-navy/40">No assignments in this module yet.</p>
          ) : (
            <ul className="space-y-3">
              {module.assignments.map((assignment) => (
                <AssignmentBlock key={assignment.id} assignment={assignment} setError={setError} reload={reload} />
              ))}
            </ul>
          )}
          <AddAssignmentForm moduleId={module.id} reload={reload} setError={setError} />
        </div>
      </div>
    </div>
  );
}

function LessonRow({ lesson, moduleId, lessonIndex, lessons, setError, reload }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingResource, setAddingResource] = useState(false);
  const [form, setForm] = useState({
    title: lesson.title,
    content: lesson.content ?? '',
    videoUrl: lesson.videoUrl ?? '',
    durationMinutes: lesson.durationMinutes ?? '',
  });

  const reorder = async (direction) => {
    const next = [...lessons];
    const target = lessonIndex + direction;
    const [moved] = next.splice(lessonIndex, 1);
    next.splice(target, 0, moved);
    setError(null);
    try {
      await reorderLessons(moduleId, next.map((item) => item.id));
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const saveEdits = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setError(null);
    try {
      await updateLesson(lesson.id, {
        title: form.title.trim(),
        content: form.content,
        videoUrl: form.videoUrl.trim() || null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
      });
      setEditing(false);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const removeLesson = async () => {
    setError(null);
    try {
      await deleteLesson(lesson.id);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <li className="rounded-xl border border-line bg-surface/40 p-3">
      <div className="flex items-center gap-3">
        {lesson.videoUrl ? (
          <Play className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-navy/40" />
        )}
        {editing ? (
          <form onSubmit={saveEdits} className="flex-1 space-y-2">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
              required
              className={inputClass}
            />
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_120px]">
              <input
                type="text"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="Video URL (optional)"
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                placeholder="Minutes (optional)"
                className={inputClass}
              />
              <Button type="submit" size="sm" variant="secondary">
                <Check className="h-4 w-4" aria-hidden="true" /> Save
              </Button>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              placeholder="Lesson content (markdown/text)"
              className={inputClass}
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{lesson.title}</p>
              {lesson.durationMinutes ? (
                <p className="text-xs text-navy/50">{formatDuration(lesson.durationMinutes)}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => reorder(-1)}
              disabled={lessonIndex === 0}
              className="rounded p-1 text-navy/50 hover:bg-white hover:text-navy disabled:opacity-30"
              aria-label="Move lesson up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => reorder(1)}
              disabled={lessonIndex === lessons.length - 1}
              className="rounded p-1 text-navy/50 hover:bg-white hover:text-navy disabled:opacity-30"
              aria-label="Move lesson down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setForm({
                  title: lesson.title,
                  content: lesson.content ?? '',
                  videoUrl: lesson.videoUrl ?? '',
                  durationMinutes: lesson.durationMinutes ?? '',
                });
                setEditing(true);
              }}
              className="rounded p-1 text-navy/50 hover:bg-white hover:text-navy"
              aria-label="Edit lesson"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {lesson.resources.length > 0 || addingResource ? (
              <button
                type="button"
                onClick={() => setAddingResource((v) => !v)}
                className="rounded p-1 text-navy/50 hover:bg-white hover:text-navy"
                aria-label="Manage resources"
              >
                <Link2 className="h-4 w-4" />
              </button>
            ) : null}
            {confirmDelete ? (
              <span className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="text-error" onClick={removeLesson}>
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded p-1 text-navy/50 hover:bg-error/10 hover:text-error"
                aria-label="Delete lesson"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      {(lesson.resources.length > 0 || addingResource) && (
        <div className="mt-3 border-t border-line pt-3">
          {lesson.resources.length > 0 && (
            <ul className="mb-2 space-y-1">
              {lesson.resources.map((resource) => (
                <li key={resource.id} className="flex items-center gap-2 text-sm">
                  <Link2 className="h-3.5 w-3.5 text-navy/40" />
                  <a href={resource.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-navy hover:text-primary">
                    {resource.title}
                  </a>
                  <span className="text-xs text-navy/40">{resource.type}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      setError(null);
                      try {
                        await deleteResource(resource.id);
                        await reload();
                      } catch (err) {
                        setError(err);
                      }
                    }}
                    className="ml-auto rounded p-1 text-navy/40 hover:bg-error/10 hover:text-error"
                    aria-label={`Delete ${resource.title}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <AddResourceForm lessonId={lesson.id} reload={reload} setError={setError} />
        </div>
      )}
    </li>
  );
}

function AddLessonForm({ moduleId, reload, setError }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', videoUrl: '', durationMinutes: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createLesson(moduleId, {
        title: form.title.trim(),
        videoUrl: form.videoUrl.trim() || null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
      });
      setForm({ title: '', videoUrl: '', durationMinutes: '' });
      setOpen(false);
      await reload();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="mt-3">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add lesson
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2 rounded-xl border border-line bg-white p-3">
      <input
        type="text"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        maxLength={200}
        placeholder="Lesson title"
        className="w-full rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          placeholder="Video URL (optional)"
          className="w-full rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="number"
          min={0}
          value={form.durationMinutes}
          onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
          placeholder="Minutes (optional)"
          className="w-full rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Spinner /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          Add lesson
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddResourceForm({ lessonId, reload, setError }) {
  const [form, setForm] = useState({ title: '', type: 'LINK', url: '', size: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createResource(lessonId, {
        title: form.title.trim(),
        type: form.type,
        url: form.url.trim(),
        size: form.size ? Number(form.size) : null,
      });
      setForm({ title: '', type: 'LINK', url: '', size: '' });
      await reload();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        maxLength={150}
        required
        placeholder="Resource title"
        className="min-w-[140px] flex-1 rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {['LINK', 'PDF', 'DOC', 'DOCX', 'IMAGE', 'VIDEO', 'OTHER'].map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <input
        type="url"
        value={form.url}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
        required
        placeholder="https://…"
        className="min-w-[160px] flex-1 rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={saving}>
        {saving ? <Spinner /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        Add
      </Button>
    </form>
  );
}

function QuizBlock({ quiz, setError, reload }) {
  const [editing, setEditing] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const removeQuiz = async () => {
    setError(null);
    try {
      await deleteQuiz(quiz.id);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <li className="rounded-xl border border-line bg-surface/40 p-3">
      {editing ? (
        <QuizEditor
          initial={{
            title: quiz.title,
            description: quiz.description ?? '',
            passingScore: quiz.passingScore,
            timeLimitMinutes: quiz.timeLimitMinutes ?? '',
            maxAttempts: quiz.maxAttempts ?? '',
            allowRetake: quiz.allowRetake,
          }}
          submitLabel="Save quiz"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await updateQuiz(quiz.id, {
              ...data,
              timeLimitMinutes: data.timeLimitMinutes ? Number(data.timeLimitMinutes) : null,
              maxAttempts: data.maxAttempts ? Number(data.maxAttempts) : null,
            });
            setEditing(false);
            await reload();
          }}
        />
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{quiz.title}</p>
              <p className="text-xs text-navy/50">
                {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'} · Passing {quiz.passingScore}%
                {quiz.timeLimitMinutes ? ` · ${quiz.timeLimitMinutes} min` : ''}
                {quiz.maxAttempts ? ` · max ${quiz.maxAttempts}` : ''}
                {!quiz.allowRetake ? ' · no retake' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded p-1 text-navy/50 hover:bg-white hover:text-navy"
              aria-label="Edit quiz"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {confirmDelete ? (
              <span className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="text-error" onClick={removeQuiz}>
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded p-1 text-navy/50 hover:bg-error/10 hover:text-error"
                aria-label="Delete quiz"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {quiz.questions.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-line pt-3">
              {quiz.questions.map((question, index) => (
                <QuestionBlock key={question.id} question={question} index={index} setError={setError} reload={reload} />
              ))}
            </ul>
          )}

          {addingQuestion ? (
            <QuestionEditor
              initial={{ type: 'MULTIPLE_CHOICE', prompt: '', points: 1, explanation: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }}
              submitLabel="Add question"
              onCancel={() => setAddingQuestion(false)}
              onSubmit={async (data) => {
                await createQuestion(quiz.id, {
                  ...data,
                  points: Number(data.points) || 1,
                  options: data.options.map((option, index) => ({ ...option, position: index })),
                });
                setAddingQuestion(false);
                await reload();
              }}
            />
          ) : (
            <Button size="sm" variant="outline" onClick={() => setAddingQuestion(true)} className="mt-3">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add question
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

function QuestionBlock({ question, index, setError, reload }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const removeQuestion = async () => {
    setError(null);
    try {
      await deleteQuestion(question.id);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const correctOptions = question.options.filter((option) => option.isCorrect).length;
  const typeLabel = question.type === 'TRUE_FALSE' ? 'True/False' : 'Multiple choice';

  if (editing) {
    return (
      <li className="rounded-lg border border-line bg-white p-3">
        <QuestionEditor
          initial={{
            type: question.type,
            prompt: question.prompt,
            points: question.points,
            explanation: question.explanation ?? '',
            options: question.options.map((option) => ({ text: option.text, isCorrect: option.isCorrect })),
          }}
          submitLabel="Save question"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await updateQuestion(question.id, {
              ...data,
              points: Number(data.points) || question.points,
            });
            setEditing(false);
            await reload();
          }}
        />
      </li>
    );
  }

  return (
    <li className="rounded-lg bg-white p-3 ring-1 ring-line">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-sm font-bold text-primary">{index + 1}.</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{question.prompt}</p>
          <p className="text-xs text-navy/50">
            {typeLabel} · {question.points} point{question.points === 1 ? '' : 's'} · {correctOptions} correct
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded p-1 text-navy/50 hover:bg-surface hover:text-navy"
          aria-label="Edit question"
        >
          <Pencil className="h-4 w-4" />
        </button>
        {confirmDelete ? (
          <span className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="text-error" onClick={removeQuestion}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded p-1 text-navy/50 hover:bg-error/10 hover:text-error"
            aria-label="Delete question"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
}

const quizFieldClass = 'w-full rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function QuizEditor({ initial, submitLabel, onCancel, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ ...form, title: form.title.trim() });
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        type="text"
        required
        maxLength={150}
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Quiz title"
        className={quizFieldClass}
      />
      <textarea
        rows={2}
        maxLength={2000}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description (optional)"
        className={quizFieldClass}
      />
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-navy/60">Passing score (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={form.passingScore}
            onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
            className={quizFieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-navy/60">Time limit (min)</span>
          <input
            type="number"
            min={1}
            value={form.timeLimitMinutes}
            onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })}
            placeholder="None"
            className={quizFieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-navy/60">Max attempts</span>
          <input
            type="number"
            min={1}
            value={form.maxAttempts}
            onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
            placeholder="Unlimited"
            className={quizFieldClass}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-navy/70">
        <input
          type="checkbox"
          checked={form.allowRetake}
          onChange={(e) => setForm({ ...form, allowRetake: e.target.checked })}
          className="h-4 w-4 accent-primary"
        />
        Allow retakes
      </label>
      {error && <p className="rounded-lg bg-error/10 p-2 text-sm text-error">{error.message}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Spinner /> : <Check className="h-4 w-4" aria-hidden="true" />}
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddQuizForm({ moduleId, reload, setError }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="mt-3">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add quiz
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-line bg-white p-3">
      <QuizEditor
        initial={{ title: '', description: '', passingScore: 60, timeLimitMinutes: '', maxAttempts: '', allowRetake: true }}
        submitLabel="Add quiz"
        onCancel={() => setOpen(false)}
        onSubmit={async (data) => {
          await createQuiz(moduleId, {
            ...data,
            timeLimitMinutes: data.timeLimitMinutes ? Number(data.timeLimitMinutes) : null,
            maxAttempts: data.maxAttempts ? Number(data.maxAttempts) : null,
          });
          setOpen(false);
          await reload();
        }}
      />
    </div>
  );
}

const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : '');

function AssignmentBlock({ assignment, setError, reload }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const removeAssignment = async () => {
    setError(null);
    try {
      await deleteAssignment(assignment.id);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <li className="rounded-xl border border-line bg-surface/40 p-3">
      {editing ? (
        <AssignmentEditor
          initial={{
            title: assignment.title,
            instructions: assignment.instructions ?? '',
            points: assignment.points,
            dueDate: toDateInput(assignment.dueDate),
          }}
          submitLabel="Save assignment"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await updateAssignment(assignment.id, {
              title: data.title,
              instructions: data.instructions,
              points: Number(data.points) || assignment.points,
              dueDate: data.dueDate || null,
            });
            setEditing(false);
            await reload();
          }}
        />
      ) : (
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{assignment.title}</p>
            <p className="text-xs text-navy/50">
              {assignment.points} points
              {assignment.dueDate ? ` · Due ${new Date(assignment.dueDate).toLocaleDateString()}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded p-1 text-navy/50 hover:bg-white hover:text-navy"
            aria-label="Edit assignment"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {confirmDelete ? (
            <span className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="text-error" onClick={removeAssignment}>
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded p-1 text-navy/50 hover:bg-error/10 hover:text-error"
              aria-label="Delete assignment"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function AssignmentEditor({ initial, submitLabel, onCancel, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ ...form, title: form.title.trim() });
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-[1fr_140px_180px]">
        <input
          type="text"
          required
          maxLength={150}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Assignment title"
          className={quizFieldClass}
        />
        <input
          type="number"
          min={1}
          max={100000}
          value={form.points}
          onChange={(e) => setForm({ ...form, points: e.target.value })}
          placeholder="Points"
          className={quizFieldClass}
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          className={quizFieldClass}
        />
      </div>
      <textarea
        rows={3}
        maxLength={20000}
        value={form.instructions}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        placeholder="Instructions for your students"
        className={quizFieldClass}
      />
      {error && <p className="rounded-lg bg-error/10 p-2 text-sm text-error">{error.message}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Spinner /> : <Check className="h-4 w-4" aria-hidden="true" />}
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddAssignmentForm({ moduleId, reload, setError }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="mt-3">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add assignment
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-line bg-white p-3">
      <AssignmentEditor
        initial={{ title: '', instructions: '', points: 100, dueDate: '' }}
        submitLabel="Add assignment"
        onCancel={() => setOpen(false)}
        onSubmit={async (data) => {
          await createAssignment(moduleId, {
            title: data.title,
            instructions: data.instructions,
            points: Number(data.points) || 100,
            dueDate: data.dueDate || null,
          });
          setOpen(false);
          await reload();
        }}
      />
    </div>
  );
}

function QuestionEditor({ initial, submitLabel, onCancel, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const groupName = useId();

  const setType = (type) => {
    if (type === 'TRUE_FALSE') {
      setForm((current) => ({
        ...current,
        type,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: false },
        ],
      }));
    } else {
      setForm((current) => ({
        ...current,
        type,
        options: current.options.length >= 2 ? current.options : [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
      }));
    }
  };

  const setOption = (index, patch) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, i) => {
        if (i === index) return { ...option, ...patch };
        return patch.isCorrect === true ? { ...option, isCorrect: false } : option;
      }),
    }));
  };

  const addOption = () => {
    setForm((current) => ({ ...current, options: [...current.options, { text: '', isCorrect: false }] }));
  };

  const removeOption = (index) => {
    setForm((current) => ({
      ...current,
      options: current.options.filter((_, i) => i !== index),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.prompt.trim()) return;
    if (form.options.length < 2 || form.options.some((option) => !option.text.trim())) {
      setError({ message: 'Add at least two options with text and mark one correct' });
      return;
    }
    if (!form.options.some((option) => option.isCorrect)) {
      setError({ message: 'Mark at least one option as correct' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        prompt: form.prompt.trim(),
        options: form.options.map((option) => ({ text: option.text.trim(), isCorrect: option.isCorrect })),
      });
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const isTrueFalse = form.type === 'TRUE_FALSE';

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
        <input
          type="text"
          required
          maxLength={1000}
          value={form.prompt}
          onChange={(e) => setForm({ ...form, prompt: e.target.value })}
          placeholder="Question prompt"
          className={quizFieldClass}
        />
        <input
          type="number"
          min={0}
          max={100}
          value={form.points}
          onChange={(e) => setForm({ ...form, points: e.target.value })}
          placeholder="Points"
          className={quizFieldClass}
        />
        <select value={form.type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="MULTIPLE_CHOICE">Multiple choice</option>
          <option value="TRUE_FALSE">True/False</option>
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Options</p>
        {form.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-navy/70">
              <input
                type="radio"
                name={groupName}
                checked={option.isCorrect}
                onChange={() => setOption(index, { isCorrect: true })}
                className="h-4 w-4 accent-success"
                required
              />
              <span className="text-xs">Correct</span>
            </label>
            <input
              type="text"
              maxLength={500}
              value={option.text}
              onChange={(e) => setOption(index, { text: e.target.value })}
              placeholder={`Option ${index + 1}`}
              disabled={isTrueFalse}
              className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface"
            />
            {!isTrueFalse && form.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="rounded p-1 text-navy/40 hover:bg-error/10 hover:text-error"
                aria-label="Remove option"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {!isTrueFalse && (
          <Button type="button" size="sm" variant="ghost" onClick={addOption}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add option
          </Button>
        )}
      </div>

      <textarea
        rows={2}
        maxLength={2000}
        value={form.explanation}
        onChange={(e) => setForm({ ...form, explanation: e.target.value })}
        placeholder="Explanation shown after the quiz (optional)"
        className={quizFieldClass}
      />

      {error && <p className="rounded-lg bg-error/10 p-2 text-sm text-error">{error.message}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Spinner /> : <Check className="h-4 w-4" aria-hidden="true" />}
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PreviewModal({ course, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Course preview" className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Course preview</p>
            <h2 className="mt-1 text-xl font-extrabold">{course.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-navy/50 hover:bg-surface hover:text-navy" aria-label="Close preview">
            <X className="h-5 w-5" />
          </button>
        </div>

        {course.status === 'PUBLISHED' && (
          <Link
            to={`/course/${course.slug}`}
            className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/15"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Open public course page
          </Link>
        )}

        {course.description && <p className="mb-5 text-sm text-navy/70">{course.description}</p>}

        {course.modules.map((module, index) => (
          <div key={module.id} className="mb-4">
            <h3 className="mb-2 font-bold">
              <span className="text-primary">{index + 1}.</span> {module.title}
            </h3>
            <ul className="ml-5 space-y-1 border-l border-line pl-4">
              {(module.lessons ?? []).map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-2 text-sm text-navy/70">
                  {lesson.videoUrl ? <Play className="h-3.5 w-3.5 text-primary" /> : <FileText className="h-3.5 w-3.5 text-navy/40" />}
                  {lesson.title}
                  {lesson.durationMinutes ? <span className="ml-auto text-xs text-navy/40">{lesson.durationMinutes}m</span> : null}
                </li>
              ))}
              {(module.lessons ?? []).length === 0 && <li className="text-sm text-navy/40">No lessons yet.</li>}
              {(module.quizzes ?? []).map((quiz) => (
                <li key={quiz.id} className="flex items-center gap-2 text-sm text-navy/70">
                  <ClipboardCheck className="h-3.5 w-3.5 text-secondary" />
                  {quiz.title}
                  {quiz.questions?.length ? <span className="ml-auto text-xs text-navy/40">{quiz.questions.length} questions</span> : null}
                </li>
              ))}
              {(module.assignments ?? []).map((assignment) => (
                <li key={assignment.id} className="flex items-center gap-2 text-sm text-navy/70">
                  <FileText className="h-3.5 w-3.5 text-success" />
                  {assignment.title}
                  <span className="ml-auto text-xs text-navy/40">{assignment.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}