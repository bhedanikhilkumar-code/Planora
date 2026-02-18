export default function SettingsPage() {
  return <div className="p-6 space-y-2"><h2>Settings</h2><label>Timezone <input defaultValue="UTC"/></label><label>Week Starts <select defaultValue="Monday"><option>Monday</option><option>Sunday</option></select></label><label>Time Format <select><option>24h</option><option>12h</option></select></label></div>;
}
