import { CheckCircle2, Search, ShieldCheck, UserCheck, UserCog, UserRound, UserX, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listUsers, updateUserStatus } from '../../services/adminService';

const STATUS_STYLES = {
  ACTIVE: 'bg-success/10 text-success',
  PENDING: 'bg-warning/10 text-warning',
  SUSPENDED: 'bg-error/10 text-error',
};

export default function AdminUsersPage({ lockedRole = '' }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(lockedRole || 'all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const effectiveRole = lockedRole || role;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listUsers({ search: search.trim(), role: effectiveRole, status, page: pagination.page, limit: 12 });
      setUsers(response.data.users ?? []);
      setPagination(response.data.pagination ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [search, effectiveRole, status, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const changeStatus = async (user, nextStatus) => {
    if (user.status === nextStatus) return;
    setBusy(user.id);
    setError(null);
    try {
      await updateUserStatus(user.id, nextStatus);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setRole(lockedRole || 'all');
    setStatus('all');
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const heading = lockedRole === 'INSTRUCTOR' ? 'Instructors' : lockedRole === 'STUDENT' ? 'Students' : 'User management';
  const subtitle = lockedRole === 'INSTRUCTOR'
    ? 'Review instructor accounts and approve access to publish courses.'
    : lockedRole === 'STUDENT'
      ? 'Manage active student accounts across the platform.'
      : 'Approve instructors and manage account access.';

  return <section className="container-page py-8">
    <div className="mb-8"><p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Admin</p><h1 className="text-3xl font-extrabold">{heading}</h1><p className="mt-2 text-navy/60">{subtitle}</p></div>
    <div className="mb-6 grid gap-3 rounded-2xl border border-line bg-white p-4 lg:grid-cols-[1fr_auto_auto]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" aria-hidden="true" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} placeholder="Search name or email" className="w-full rounded-lg border border-line py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>{!lockedRole && <select value={role} onChange={(event) => { setRole(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"><option value="all">All roles</option><option value="STUDENT">Students</option><option value="INSTRUCTOR">Instructors</option><option value="ADMIN">Admins</option></select>}<select value={status} onChange={(event) => { setStatus(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"><option value="all">All statuses</option><option value="PENDING">Pending</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select></div>
    {error && <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-navy"><span>{error.message}</span><button type="button" onClick={resetFilters} className="font-semibold text-error">Reset filters</button></div>}
    {loading ? <div className="flex justify-center py-20"><Spinner className="border-primary/30 border-t-primary" /></div> : users.length === 0 ? <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center"><UserRound className="mx-auto h-10 w-10 text-primary/50" aria-hidden="true" /><h2 className="mt-4 text-xl font-bold">No users found</h2><p className="mt-2 text-navy/60">Try adjusting the search or filters.</p></div> : <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-line bg-surface/50 text-xs uppercase tracking-wide text-navy/50"><tr><th className="px-4 py-3 font-semibold">User</th><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Activity</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-line">{users.map((user) => <UserRow key={user.id} user={user} busy={busy === user.id} onChangeStatus={changeStatus} />)}</tbody></table><div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-sm text-navy/60"><span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} users</span>{pagination.totalPages > 1 && <div className="flex gap-2"><Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</Button><Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</Button></div>}</div></div>}
  </section>;
}

function UserRow({ user, busy, onChangeStatus }) {
  const isAdmin = user.role === 'ADMIN';
  const roleIcon = user.role === 'ADMIN' ? ShieldCheck : user.role === 'INSTRUCTOR' ? UserCog : UserRound;
  const RoleIcon = roleIcon;
  return <tr className="hover:bg-surface/40"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><RoleIcon className="h-4 w-4" aria-hidden="true" /></span><div><p className="font-semibold">{user.firstName} {user.lastName}</p><p className="text-xs text-navy/50">{user.email}</p></div></div></td><td className="px-4 py-4"><span className="text-xs font-semibold uppercase tracking-wide text-navy/60">{user.role}</span></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[user.status]}`}>{user.status}</span></td><td className="px-4 py-4 text-xs text-navy/60">{user.role === 'INSTRUCTOR' ? `${user._count.coursesCreated} courses` : user.role === 'STUDENT' ? `${user._count.enrollments} enrollments` : 'Platform access'}</td><td className="px-4 py-4"><div className="flex justify-end gap-2">{user.status === 'PENDING' && user.role === 'INSTRUCTOR' && <Button size="sm" disabled={busy} onClick={() => onChangeStatus(user, 'ACTIVE')}><UserCheck className="h-4 w-4" aria-hidden="true" />Approve</Button>}{user.status === 'SUSPENDED' && !isAdmin && <Button size="sm" variant="outline" disabled={busy} onClick={() => onChangeStatus(user, 'ACTIVE')}><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Reactivate</Button>}{user.status === 'ACTIVE' && !isAdmin && <Button size="sm" variant="outline" disabled={busy} onClick={() => onChangeStatus(user, 'SUSPENDED')}><UserX className="h-4 w-4" aria-hidden="true" />Suspend</Button>}{isAdmin && <span className="inline-flex items-center gap-1 text-xs text-navy/40"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Protected</span>}{busy && <Spinner className="border-primary/30 border-t-primary" />}</div></td></tr>;
}