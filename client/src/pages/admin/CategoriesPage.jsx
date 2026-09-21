import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Tag, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/adminService';

const BLANK = { name: '', slug: '', description: '', icon: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCategories();
      setCategories(response?.data?.categories ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
      };
      if (editing) {
        await updateCategory(editing.id, payload);
      } else {
        await createCategory(payload);
      }
      setForm(BLANK);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      icon: category.icon ?? '',
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(BLANK);
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    setError(null);
    try {
      await deleteCategory(category.id);
      await load();
    } catch (err) {
      setError(err);
    }
  };

  const inputClass =
    'rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm placeholder:text-navy/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-navy';

  return (
    <section className="container-page py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Admin</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Categories</h1>
        <p className="mt-1 text-navy/60">Organize the platforms courses into browsable categories.</p>
      </div>

      {error && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-navy sm:flex-row sm:items-center sm:justify-between">
          <span role="alert">{error.message}</span>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner className="border-primary/30 border-t-primary" />
            </div>
          ) : (
            <ul className="space-y-3">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Tag className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{category.name}</p>
                    <p className="truncate text-xs text-navy/50">
                      /{category.slug}
                      {category.description ? ` · ${category.description}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-navy/60">
                    {category._count.courses} course{category._count.courses === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="rounded-lg p-2 text-navy/50 hover:bg-surface hover:text-navy"
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(category)}
                    className="rounded-lg p-2 text-navy/50 hover:bg-error/10 hover:text-error disabled:opacity-40"
                    disabled={category._count.courses > 0}
                    title={category._count.courses > 0 ? 'Remove courses from this category first' : 'Delete category'}
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-navy/60">
                  No categories yet. Add your first one.
                </li>
              )}
            </ul>
          )}
        </div>

        <form onSubmit={submit} className="h-fit rounded-2xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-bold">
            {editing ? `Edit "${editing.name}"` : 'Add category'}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="cat-name" className={labelClass}>Name</label>
              <input
                id="cat-name"
                type="text"
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Machine Learning"
                className={`w-full ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="cat-slug" className={labelClass}>Slug (optional)</label>
              <input
                id="cat-slug"
                type="text"
                maxLength={80}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="machine-learning"
                className={`w-full ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="cat-description" className={labelClass}>Description</label>
              <input
                id="cat-description"
                type="text"
                maxLength={500}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description"
                className={`w-full ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="cat-icon" className={labelClass}>Icon (optional)</label>
              <input
                id="cat-icon"
                type="text"
                maxLength={30}
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="e.g. code, chart, book"
                className={`w-full ${inputClass}`}
              />
            </div>
            <div className="flex items-center gap-2 border-t border-line pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner /> : editing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editing ? 'Save changes' : 'Add category'}
              </Button>
              {editing && (
                <Button type="button" variant="ghost" onClick={cancelEdit}>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}