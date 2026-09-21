import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listCategories } from '../../services/categoryService';
import { createCourse, updateCourse, getCourse } from '../../services/instructorService';
import { LEVEL_OPTIONS } from '../../constants/courses';

const BLANK = {
  title: '',
  categoryId: '',
  level: 'BEGINNER',
  shortDescription: '',
  description: '',
  outcomes: '',
  thumbnailUrl: '',
  durationMinutes: '',
};

export default function CourseFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [loaded, setLoaded] = useState(!editing);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, course] = await Promise.all([
          listCategories(),
          editing ? getCourse(id) : Promise.resolve(null),
        ]);
        if (!mounted) return;
        setCategories(cats?.data?.categories ?? []);
        if (course?.data?.course) {
          const c = course.data.course;
          setForm({
            title: c.title ?? '',
            categoryId: c.categoryId ?? '',
            level: c.level ?? 'BEGINNER',
            shortDescription: c.shortDescription ?? '',
            description: c.description ?? '',
            outcomes: (c.outcomes ?? []).join('\n'),
            thumbnailUrl: c.thumbnailUrl ?? '',
            durationMinutes: c.durationMinutes ?? '',
          });
        }
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        if (mounted) {
          setLoading(false);
          setLoaded(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, editing]);

  const leveledOptions = useMemo(
    () => LEVEL_OPTIONS.filter((option) => option.value !== 'all'),
    []
  );

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        categoryId: form.categoryId,
        level: form.level,
        shortDescription: form.shortDescription.trim() || null,
        description: form.description.trim() || null,
        outcomes: form.outcomes
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
      };

      if (editing) {
        await updateCourse(id, payload);
        navigate(`/instructor/courses/${id}/builder`, { replace: true });
      } else {
        const response = await createCourse(payload);
        navigate(`/instructor/courses/${response.data.course.id}/builder`, { replace: true });
      }
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-navy';

  if (!loaded) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <section className="container-page py-8">
      <Link
        to={editing ? `/instructor/courses/${id}/builder` : '/instructor/courses'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy/60 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {editing ? 'Back to course builder' : 'My Courses'}
      </Link>

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Course Management</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
          {editing ? 'Edit course details' : 'Create a new course'}
        </h1>
        <p className="mt-1 text-navy/60">
          {editing
            ? 'Update the course overview. Modules and lessons live in the builder.'
            : 'Set up the course overview, then use the builder to add content.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-navy">
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div>
            <label htmlFor="title" className={labelClass}>Course title</label>
            <input
              id="title"
              type="text"
              required
              maxLength={200}
              className={inputClass}
              value={form.title}
              onChange={setField('title')}
              placeholder="e.g. Hands-on React for Teams"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={labelClass}>Category</label>
              <select
                id="category"
                required
                className={inputClass}
                value={form.categoryId}
                onChange={setField('categoryId')}
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="level" className={labelClass}>Level</label>
              <select
                id="level"
                className={inputClass}
                value={form.level}
                onChange={setField('level')}
              >
                {leveledOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="shortDescription" className={labelClass}>Short description</label>
            <textarea
              id="shortDescription"
              rows={2}
              maxLength={300}
              className={inputClass}
              value={form.shortDescription}
              onChange={setField('shortDescription')}
              placeholder="One or two sentences shown on course cards."
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>Full description</label>
            <textarea
              id="description"
              rows={6}
              maxLength={8000}
              className={inputClass}
              value={form.description}
              onChange={setField('description')}
              placeholder="Everything a student should know about the course, content and outcomes."
            />
          </div>

          <div>
            <label htmlFor="outcomes" className={labelClass}>Learning outcomes</label>
            <textarea
              id="outcomes"
              rows={4}
              className={inputClass}
              value={form.outcomes}
              onChange={setField('outcomes')}
              placeholder={'What will students be able to do?\nOne outcome per line.'}
            />
            <p className="mt-1 text-xs text-navy/50">One outcome per line. Shown as bullet points on the course page.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="thumbnailUrl" className={labelClass}>Thumbnail URL</label>
              <input
                id="thumbnailUrl"
                type="url"
                className={inputClass}
                value={form.thumbnailUrl}
                onChange={setField('thumbnailUrl')}
                placeholder="https://…"
              />
            </div>
            <div>
              <label htmlFor="durationMinutes" className={labelClass}>Estimated duration (minutes)</label>
              <input
                id="durationMinutes"
                type="number"
                min={0}
                className={inputClass}
                value={form.durationMinutes}
                onChange={setField('durationMinutes')}
                placeholder="e.g. 540"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-line pt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              navigate(editing ? `/instructor/courses/${id}/builder` : '/instructor/courses')
            }
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {editing ? 'Save changes' : 'Create course'}
          </Button>
        </div>
      </form>
    </section>
  );
}