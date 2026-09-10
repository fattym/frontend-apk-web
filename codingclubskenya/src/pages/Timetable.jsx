import { useState, useEffect } from 'react';
import Tabs from '../components/Tabs';
import useApiList from '../hooks/useApiList';

const Timetable = () => {
  const [tab, setTab] = useState('view');
  const [config, setConfig] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    school_start_time: '08:00:00',
    school_end_time: '16:00:00',
    lecture_duration_minutes: 45,
    working_days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    breaks: [],
    academic_year: '2024-2025',
  });

  const { data: timetableSlots, refresh: refreshSlots } = useApiList('/api/academics/timetable-slot/');
  const { data: timetableConfigs, refresh: refreshConfig } = useApiList('/api/academics/timetable-config/');

  useEffect(() => {
    if (timetableConfigs.length > 0) {
      setConfig(timetableConfigs[0]);
      setFormData({
        school_start_time: timetableConfigs[0].school_start_time || '08:00:00',
        school_end_time: timetableConfigs[0].school_end_time || '16:00:00',
        lecture_duration_minutes: timetableConfigs[0].lecture_duration_minutes || 45,
        working_days: timetableConfigs[0].working_days || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        breaks: timetableConfigs[0].breaks || [],
        academic_year: timetableConfigs[0].academic_year || '2024-2025',
      });
    }
    if (timetableSlots) {
      setSlots(timetableSlots);
    }
  }, [timetableConfigs, timetableSlots]);

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('access_token');
      const method = config ? 'PUT' : 'POST';
      const url = config ? `/api/academics/timetable-config/${config.id}/` : '/api/academics/timetable-config/';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save configuration');
      setMessage('Configuration saved successfully!');
      refreshConfig();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/academics/timetable/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate timetable');
      setMessage(data.message || 'Timetable generated successfully!');
      refreshSlots();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Timetable Management</h1>
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <Tabs
        tabs={[
          { key: 'view', label: 'View Timetable' },
          { key: 'config', label: 'Timetable Config' },
          { key: 'generate', label: 'Generate Timetable' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'config' && (
        <div className="bg-white rounded shadow p-6 mt-4">
          <h2 className="text-xl font-bold mb-4">School Timetable Configuration</h2>
          <form onSubmit={handleConfigSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">School Start Time</label>
                <input type="time" className="w-full border rounded px-3 py-2" value={formData.school_start_time} onChange={(e) => setFormData({ ...formData, school_start_time: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School End Time</label>
                <input type="time" className="w-full border rounded px-3 py-2" value={formData.school_end_time} onChange={(e) => setFormData({ ...formData, school_end_time: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lecture Duration (minutes)</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={formData.lecture_duration_minutes} onChange={(e) => setFormData({ ...formData, lecture_duration_minutes: parseInt(e.target.value) })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Academic Year</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={formData.academic_year} onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })} required />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Working Days</label>
              <div className="flex gap-2 flex-wrap">
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => (
                  <label key={day} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.working_days.includes(day)} onChange={(e) => {
                      const newDays = e.target.checked ? [...formData.working_days, day] : formData.working_days.filter((d) => d !== day);
                      setFormData({ ...formData, working_days: newDays });
                    }} />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>
      )}

      {tab === 'generate' && (
        <div className="bg-white rounded shadow p-6 mt-4">
          <h2 className="text-xl font-bold mb-4">Generate Timetable</h2>
          <p className="text-gray-600 mb-4">Auto-generate a timetable for all classes based on the configuration and teacher assignments. This will replace existing timetable slots.</p>
          <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate Timetable'}
          </button>
        </div>
      )}

      {tab === 'view' && (
        <div className="bg-white rounded shadow overflow-hidden mt-4">
          <h2 className="text-xl font-bold p-4 border-b">Current Timetable Slots</h2>
          {slots.length === 0 ? (
            <div className="p-6 text-gray-500">No timetable slots found. Configure and generate a timetable first.</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="px-6 py-4">{slot.day_of_week}</td>
                    <td className="px-6 py-4">{slot.stream?.name || slot.stream}</td>
                    <td className="px-6 py-4">{slot.start_time} - {slot.end_time}</td>
                    <td className="px-6 py-4">
                      {slot.is_break ? (
                        <span className="text-gray-500">{slot.break_name || 'Break'}</span>
                      ) : (
                        slot.subject?.name || slot.subject || '-'
                      )}
                    </td>
                    <td className="px-6 py-4">{slot.teacher?.email || slot.teacher || '-'}</td>
                    <td className="px-6 py-4">{slot.room || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Timetable;