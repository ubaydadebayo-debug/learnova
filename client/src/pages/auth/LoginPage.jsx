import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { dashboardPathFor } from '../../utils/roles';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login({ email: form.email, password: form.password });
      navigate(dashboardPathFor(user.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-primary focus:outline-2 focus:outline-primary';

  return (
    <section className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-2 text-navy/60">Log in to continue your learning journey.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-line bg-white p-8"
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className={inputClasses}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Spinner /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            {submitting ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/60">
          New to Learnova?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}