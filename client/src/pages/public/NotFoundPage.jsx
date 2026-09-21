import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

export default function NotFoundPage() {
  return (
    <section className="container-page flex flex-col items-center justify-center py-24 text-center">
      <p className="font-heading text-7xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">We couldn't find what you're looking for</h1>
      <p className="mt-3 mb-8 max-w-md text-lg text-navy/60">
        The page may have moved or never existed. Let's get you back on track.
      </p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </section>
  );
}