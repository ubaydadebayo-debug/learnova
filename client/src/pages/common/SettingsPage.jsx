import { Bell, Globe2, KeyRound, RefreshCw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { changePassword, getProfile, updatePreferences } from '../../services/userService';

const inputClasses = 'w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-navy focus:border-primary focus:outline-2 focus:outline-primary';

const DEFAULT_PREFERENCES = { language: 'en', timezone: 'UTC', emailNotifications: true, pushNotifications: false };

export default function SettingsPage() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadPreferences = () => {
    setLoading(true);
    setLoadError(null);
    setMessage(null);
    getProfile()
      .then(({ data }) => setPreferences({ ...DEFAULT_PREFERENCES, ...(data.user.preferences ?? {}) }))
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const savePreferences = async (event) => {
    event.preventDefault();
    setMessage(null);
    try { await updatePreferences(preferences); setMessage({ type: 'success', text: 'Preferences saved.' }); } catch (error) { setMessage({ type: 'error', text: error.message }); }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) { setMessage({ type: 'error', text: 'New passwords do not match.' }); return; }
    setMessage(null);
    try { await changePassword(password); setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' }); setMessage({ type: 'success', text: 'Password changed successfully.' }); } catch (error) { setMessage({ type: 'error', text: error.message }); }
  };

  return (
    <section className="container-page py-8">
      <div className="mb-8"><p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Account</p><h1 className="text-3xl font-extrabold">Settings</h1><p className="mt-2 text-navy/60">Manage your learning preferences and account security.</p></div>
      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="border-primary/30 border-t-primary" /></div>
      ) : (
        <>
          {loadError && (
            <div className="mb-6 flex max-w-2xl items-center justify-between gap-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error" role="status">
              <span>{loadError}</span>
              <Button size="sm" variant="outline" onClick={loadPreferences}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button>
            </div>
          )}
          <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
            <form onSubmit={savePreferences} className="space-y-5 rounded-2xl border border-line bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Bell className="h-5 w-5 text-primary" aria-hidden="true" />Notifications</h2>
              <label className="flex items-center justify-between gap-4 text-sm"><span>Email notifications</span><input type="checkbox" checked={preferences.emailNotifications} onChange={(event) => setPreferences({ ...preferences, emailNotifications: event.target.checked })} /></label>
              <label className="flex items-center justify-between gap-4 text-sm"><span>Push notifications</span><input type="checkbox" checked={preferences.pushNotifications} onChange={(event) => setPreferences({ ...preferences, pushNotifications: event.target.checked })} /></label>
              <label className="block text-sm font-medium">Language<select className={`${inputClasses} mt-1`} value={preferences.language} onChange={(event) => setPreferences({ ...preferences, language: event.target.value })}><option value="en">English</option><option value="fr">French</option><option value="es">Spanish</option></select></label>
              <label className="block text-sm font-medium"><span className="flex items-center gap-2"><Globe2 className="h-4 w-4" aria-hidden="true" />Timezone</span><input className={`${inputClasses} mt-1`} value={preferences.timezone} onChange={(event) => setPreferences({ ...preferences, timezone: event.target.value })} maxLength={100} /></label>
              <Button type="submit"><Save className="h-4 w-4" aria-hidden="true" />Save preferences</Button>
            </form>
            <form onSubmit={savePassword} className="space-y-5 rounded-2xl border border-line bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />Change password</h2>
              {['currentPassword', 'newPassword', 'confirmPassword'].map((name) => <label key={name} className="block text-sm font-medium capitalize">{name === 'currentPassword' ? 'Current password' : name === 'newPassword' ? 'New password' : 'Confirm new password'}<input className={`${inputClasses} mt-1`} type="password" value={password[name]} onChange={(event) => setPassword({ ...password, [name]: event.target.value })} minLength={8} required /></label>)}
              <Button type="submit"><KeyRound className="h-4 w-4" aria-hidden="true" />Change password</Button>
            </form>
          </div>
        </>
      )}
    </section>
  );
}