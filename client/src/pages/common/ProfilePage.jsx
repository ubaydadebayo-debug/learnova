import { RefreshCw, Save, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { getProfile, updateProfile } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const inputClasses = 'w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-navy focus:border-primary focus:outline-2 focus:outline-primary';

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', title: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const loadProfile = () => {
    setLoading(true);
    setLoadError(null);
    getProfile().then(({ data }) => setForm({
      firstName: data.user.firstName ?? '',
      lastName: data.user.lastName ?? '',
      title: data.user.title ?? '',
      bio: data.user.bio ?? '',
    })).catch((error) => setLoadError(error.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(form);
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner className="border-primary/30 border-t-primary" /></div>;

  return (
    <section className="container-page py-8">
      <div className="mb-8 flex items-center gap-3">
        <UserRound className="h-7 w-7 text-primary" aria-hidden="true" />
        <div><p className="text-sm font-semibold uppercase tracking-wider text-secondary">Account</p><h1 className="text-3xl font-extrabold">Profile</h1></div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-line bg-white p-6">
        {loadError && <div className="flex items-center justify-between gap-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error" role="status"><span>{loadError}</span><Button type="button" size="sm" variant="outline" onClick={loadProfile}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></div>}
        <div className="grid gap-4 sm:grid-cols-2">
          {['firstName', 'lastName'].map((name) => (
            <label key={name} className="text-sm font-medium capitalize text-navy">
              {name === 'firstName' ? 'First name' : 'Last name'}
              <input className={`${inputClasses} mt-1`} name={name} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required maxLength={50} />
            </label>
          ))}
        </div>
        <label className="block text-sm font-medium text-navy">Professional title<input className={`${inputClasses} mt-1`} name="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={120} placeholder="e.g. Product designer" /></label>
        <label className="block text-sm font-medium text-navy">Bio<textarea className={`${inputClasses} mt-1 min-h-32 resize-y`} name="bio" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} maxLength={2000} placeholder="Tell learners a little about you" /></label>
        {message && <p className={`rounded-lg px-4 py-3 text-sm ${message.type === 'error' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`} role="status">{message.text}</p>}
        <Button type="submit" disabled={saving}><Save className="h-4 w-4" aria-hidden="true" />{saving ? 'Saving...' : 'Save profile'}</Button>
      </form>
    </section>
  );
}