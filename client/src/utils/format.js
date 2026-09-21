export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || minutes <= 0) return 'Self-paced';
  const hours = minutes / 60;
  if (hours >= 1) {
    const rounded = Math.round(hours * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}h total`;
  }
  return `${minutes}m`;
}

export function formatStudents(count) {
  if (!count || count <= 0) return '0 students';
  if (count === 1) return '1 student';
  return `${count} students`;
}

export function formatRating(rating) {
  if (rating === null || rating === undefined || rating <= 0) return 'New';
  return rating.toFixed(1);
}

export function classifyLevel(level) {
  return String(level || '').toLowerCase();
}