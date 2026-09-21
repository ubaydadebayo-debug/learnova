import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, BookOpen, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { listCourses } from '../../services/courseService';
import { listCategories } from '../../services/categoryService';
import CourseCard from '../../components/courses/CourseCard';
import Button from '../../components/common/Button';
import {
  LEVEL_OPTIONS,
  DURATION_OPTIONS,
  RATING_OPTIONS,
  SORT_OPTIONS,
} from '../../constants/courses';

const PAGE_LIMIT = 6;

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white" aria-hidden="true">
      <div className="aspect-[16/9] animate-pulse bg-surface" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface" />
        <div className="h-3 w-full animate-pulse rounded bg-surface" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const get = (key) => searchParams.get(key) || '';
    const level = get('level');
    const duration = get('duration');
    const rating = get('rating');
    const durationOption = DURATION_OPTIONS.find((o) => o.value === duration);
    const ratingOption = RATING_OPTIONS.find((o) => o.value === rating);

    return {
      search: get('search'),
      category: get('category'),
      level: LEVEL_OPTIONS.some((o) => o.value === level) ? level : '',
      instructor: '',
      minDuration: durationOption?.minDuration,
      maxDuration: durationOption?.maxDuration,
      minRating: ratingOption?.minRating,
      sort: SORT_OPTIONS.some((o) => o.value === get('sort')) ? get('sort') : 'newest',
      page: Math.max(1, parseInt(get('page'), 10) || 1),
    };
  }, [searchParams]);

  const categories = useFetch(listCategories, []);

  const courses = useFetch(
    () =>
      listCourses({
        search: params.search,
        category: params.category,
        level: params.level,
        minDuration: params.minDuration,
        maxDuration: params.maxDuration,
        minRating: params.minRating,
        sort: params.sort,
        page: params.page,
        limit: PAGE_LIMIT,
      }),
    [params.search, params.category, params.level, params.minDuration, params.maxDuration, params.minRating, params.sort, params.page]
  );

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setParam('search', String(formData.get('search') || '').trim());
  };

  const hasFilters =
    params.search || params.category || params.level || params.minDuration !== undefined || params.minRating !== undefined;

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const pagination = courses.data?.pagination;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [params.page]);

  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
          Courses
        </p>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Explore our courses</h1>
        <p className="mt-2 max-w-xl text-navy/60">
          Find the right course for your goals. Search, filter, and start learning today.
        </p>
      </header>

      <div className="mb-8 grid gap-4 rounded-2xl border border-line bg-white p-4 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40"
              aria-hidden="true"
            />
            <input
              id="course-search"
              name="search"
              type="search"
              defaultValue={params.search}
              placeholder="Search courses…"
              className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-navy placeholder:text-navy/40 focus:border-primary focus:outline-2 focus:outline-primary"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>

        <div>
          <label htmlFor="category" className="mb-1 block text-xs font-medium text-navy/50">
            Category
          </label>
          <select
            id="category"
            value={params.category}
            onChange={(e) => setParam('category', e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy focus:border-primary focus:outline-2 focus:outline-primary lg:w-40"
          >
            <option value="">All categories</option>
            {categories.data?.categories?.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="level" className="mb-1 block text-xs font-medium text-navy/50">
            Level
          </label>
          <select
            id="level"
            value={params.level}
            onChange={(e) => setParam('level', e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy focus:border-primary focus:outline-2 focus:outline-primary lg:w-36"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="mb-1 block text-xs font-medium text-navy/50">
            Length
          </label>
          <select
            id="duration"
            value={searchParams.get('duration') || 'all'}
            onChange={(e) => setParam('duration', e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy focus:border-primary focus:outline-2 focus:outline-primary lg:w-40"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <div>
            <label htmlFor="rating" className="mb-1 block text-xs font-medium text-navy/50">
              Rating
            </label>
            <select
              id="rating"
              value={searchParams.get('rating') || 'all'}
              onChange={(e) => setParam('rating', e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy focus:border-primary focus:outline-2 focus:outline-primary lg:w-32"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="mb-1 block text-xs font-medium text-navy/50">
              Sort
            </label>
            <select
              id="sort"
              value={params.sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy focus:border-primary focus:outline-2 focus:outline-primary lg:w-36"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Clear all filters
        </button>
      )}

      {courses.error && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="text-lg font-semibold text-navy">Something went wrong.</p>
          <p className="max-w-md text-sm text-navy/60">{courses.error.message}</p>
          <Button variant="outline" onClick={courses.refetch}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      )}

      {courses.loading && !courses.data && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading courses">
          {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!courses.loading && !courses.error && courses.data?.courses?.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold">No courses match your filters</h2>
          <p className="max-w-md text-sm text-navy/60">
            Try changing your search or clearing filters to see more courses.
          </p>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {!courses.loading && !courses.error && courses.data?.courses?.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.data.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-2"
              aria-label="Course pagination"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={params.page <= 1}
                onClick={() => setParam('page', String(params.page - 1))}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Button>
              <span className="px-3 text-sm font-medium text-navy/60">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={params.page >= pagination.totalPages}
                onClick={() => setParam('page', String(params.page + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}