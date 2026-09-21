import { useEffect, useState } from 'react';
import { getHealth } from '../../services/api';

export default function ApiStatus() {
  const [status, setStatus] = useState({ loading: true, ok: false, message: 'Checking API…' });

  useEffect(() => {
    let active = true;
    getHealth()
      .then((body) => {
        if (!active) return;
        setStatus((prev) => ({
          ...prev,
          loading: false,
          ok: body?.success === true,
          message: body?.message || 'API reachable',
        }));
      })
      .catch((error) => {
        if (!active) return;
        setStatus({ loading: false, ok: false, message: error.message });
      });
    return () => {
      active = false;
    };
  }, []);

  const dotClass = status.loading
    ? 'bg-warning'
    : status.ok
      ? 'bg-success'
      : 'bg-error';

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-navy/70">
      <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
      {status.loading ? status.message : status.ok ? 'Backend connected' : 'Backend offline'}
      {!status.loading && status.ok && (
        <span className="hidden text-navy/40 sm:inline">— API healthy</span>
      )}
    </div>
  );
}