import { Link } from 'react-router-dom';
import { Clock, Star, Users } from 'lucide-react';
import { LEVEL_STYLES } from '../../constants/courses';
import { formatDuration, formatStudents, formatRating } from '../../utils/format';
import CategoryIcon from '../common/CategoryIcon';

export default function CourseCard({ course }) {
  const students = course._count?.enrollments ?? 0;
  const levelStyle = LEVEL_STYLES[course.level] || LEVEL_STYLES.BEGINNER;
  const hasArtwork = course.thumbnailUrl;

  return (
    <Link
      to={`/course/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/10 to-surface">
        {hasArtwork ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CategoryIcon name={course.category?.icon} className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${levelStyle}`}
        >
          {course.level === 'BEGINNER' ? 'Beginner' : course.level === 'ADVANCED' ? 'Advanced' : 'Intermediate'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-navy/50">
          <span>{course.category?.name}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">
            {course.instructor?.firstName} {course.instructor?.lastName}
          </span>
        </div>

        <h3 className="mb-2 text-base font-bold leading-snug text-navy transition-colors group-hover:text-primary">
          {course.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-navy/60">
          {course.shortDescription || 'No description available yet.'}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm text-navy/60">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 text-warning" aria-hidden="true" />
            <span className="font-medium">{formatRating(course.ratingAverage)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden="true" />
            {formatStudents(students)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatDuration(course.durationMinutes)}
          </span>
        </div>
      </div>
    </Link>
  );
}