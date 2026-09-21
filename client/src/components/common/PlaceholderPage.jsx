import { Link } from 'react-router-dom';
import Button from '../common/Button';

export default function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  ctaLabel,
  ctaTo,
}) {
  return (
    <section className="container-page flex flex-col items-center justify-center py-24 text-center">
      {Icon && (
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
      )}
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
          {eyebrow}
        </p>
      )}
      <h1 className="mb-4 max-w-2xl text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <p className="mb-8 max-w-xl text-lg text-navy/60">{description}</p>
      {ctaLabel && ctaTo && (
        <Link to={ctaTo}>
          <Button size="lg">{ctaLabel}</Button>
        </Link>
      )}
    </section>
  );
}