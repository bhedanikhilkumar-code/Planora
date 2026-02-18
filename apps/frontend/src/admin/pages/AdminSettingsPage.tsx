import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function AdminSettingsPage() {
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  useEffect(() => {
    api.get('/admin/settings').then((r) => setRegistrationEnabled(r.data.registrationEnabled));
  }, []);

  const save = async () => {
    await api.patch('/admin/settings', { registrationEnabled });
    alert('Settings updated');
  };

  return (
    <div className="bg-white p-4 rounded max-w-md space-y-3">
      <h2 className="font-semibold">System Settings</h2>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={registrationEnabled} onChange={(e) => setRegistrationEnabled(e.target.checked)} />
        Registration Enabled
      </label>
      <button onClick={save}>Save</button>
    </div>
  );
}
