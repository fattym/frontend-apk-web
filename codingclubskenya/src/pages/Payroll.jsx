import { useState } from 'react';
import api from '../services/api';
import useApiList from '../hooks/useApiList';
import Tabs from '../components/Tabs';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { key: 'profiles', label: 'Staff Profiles' },
  { key: 'leaves', label: 'Leave Requests' },
  { key: 'payslips', label: 'Payslips' },
  { key: 'settings', label: 'Payroll Settings' },
];

const PAY_PERIOD_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'WEEKLY', label: 'Weekly' },
];

const PAYROLL_CURRENCY = 'KES';

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const Payroll = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const { data: profiles, loading: profLoading, refresh: refreshProfiles } = useApiList('/api/payroll/staff-profiles/');
  const { data: leaves, loading: leaveLoading, refresh: refreshLeaves } = useApiList('/api/payroll/leave-requests/');
  const { data: payslips, loading: slipLoading, refresh: refreshPayslips } = useApiList('/api/payroll/payslips/');
  const { data: settings, loading: setLoad, refresh: refreshSettings } = useApiList('/api/payroll/settings/');
  const { data: users, loading: uLoading } = useApiList('/api/auth/users/?role=TEACHER');

  const [tab, setTab] = useState('profiles');
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({
    user: '', employee_id: '', designation: '', department: '',
    hire_date: new Date().toISOString().slice(0, 10), salary: '',
    bank_account: '', bank_name: '', bank_branch: '', is_active: true,
  });
  const [activeLeave, setActiveLeave] = useState(null);
  const [leaveForm, setLeaveForm] = useState({
    staff: '', leave_type: '', start_date: '', end_date: '', days: 0, reason: '', status: 'PENDING',
  });
  const [activePayslip, setActivePayslip] = useState(null);
  const [payslipForm, setPayslipForm] = useState({
    staff: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    gross_salary: '', basic_salary: '', allowances: '0', deductions: '0',
    net_salary: '', is_paid: false, payment_date: '',
  });
  const [activeSetting, setActiveSetting] = useState(null);
  const [settingForm, setSettingForm] = useState({
    pay_period: 'MONTHLY', payable_days: 30,
    default_allowances: '0', default_deductions: '0',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const teacherOptions = (users || []).filter((u) => u.role === 'TEACHER');

  const userName = (u) => `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || `User #${u?.id}`;

  function calcNet(gross, allowances, deductions) {
    const g = parseFloat(gross) || 0;
    const a = parseFloat(allowances) || 0;
    const d = parseFloat(deductions) || 0;
    return (g + a - d).toFixed(2);
  }

  function updateNet() {
    setPayslipForm((f) => ({ ...f, net_salary: calcNet(f.gross_salary, f.allowances, f.deductions) }));
  }

  const submitProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (active) {
        await api.put(`/api/payroll/staff-profiles/${active.id}/`, form);
      } else {
        await api.post('/api/payroll/staff-profiles/', form);
      }
      setActive(null);
      setForm({
        user: '', employee_id: '', designation: '', department: '',
        hire_date: new Date().toISOString().slice(0, 10), salary: '',
        bank_account: '', bank_name: '', bank_branch: '', is_active: true,
      });
      refreshProfiles();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...leaveForm, days: parseInt(leaveForm.days) };
    try {
      if (activeLeave) {
        await api.put(`/api/payroll/leave-requests/${activeLeave.id}/`, payload);
      } else {
        await api.post('/api/payroll/leave-requests/', payload);
      }
      setActiveLeave(null);
      setLeaveForm({ staff: '', leave_type: '', start_date: '', end_date: '', days: 0, reason: '', status: 'PENDING' });
      refreshLeaves();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const submitPayslip = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...payslipForm, month: parseInt(payslipForm.month), year: parseInt(payslipForm.year), net_salary: calcNet(payslipForm.gross_salary, payslipForm.allowances, payslipForm.deductions) };
    try {
      if (activePayslip) {
        await api.put(`/api/payroll/payslips/${activePayslip.id}/`, payload);
      } else {
        await api.post('/api/payroll/payslips/', payload);
      }
      setActivePayslip(null);
      setPayslipForm({
        staff: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        gross_salary: '', basic_salary: '', allowances: '0', deductions: '0',
        net_salary: '', is_paid: false, payment_date: '',
      });
      refreshPayslips();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const submitSetting = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...settingForm,
      default_allowances: parseFloat(settingForm.default_allowances) || 0,
      default_deductions: parseFloat(settingForm.default_deductions) || 0,
    };
    try {
      const existing = settings?.[0]?.id;
      if (existing) {
        await api.put(`/api/payroll/settings/${existing}/`, payload);
      } else {
        await api.post('/api/payroll/settings/', payload);
      }
      setActiveSetting(null);
      refreshSettings();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeProfile = async (id) => {
    if (!window.confirm('Delete this staff profile? This cannot be undone.')) return;
    try {
      await api.delete(`/api/payroll/staff-profiles/${id}/`);
      refreshProfiles();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const openProfileEditor = (p) => {
    setActive(p);
    setForm({
      user: p.user || '', employee_id: p.employee_id || '', designation: p.designation || '',
      department: p.department || '', hire_date: p.hire_date || new Date().toISOString().slice(0, 10),
      salary: p.salary || '', bank_account: p.bank_account || '', bank_name: p.bank_name || '',
      bank_branch: p.bank_branch || '', is_active: p.is_active !== undefined ? p.is_active : true,
    });
    setError('');
  };

  const STATUS_OPTIONS_LEAVE = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Payroll</h1>
        <span className="text-sm text-gray-500">{(profiles || []).length} staff profiles</span>
      </div>

      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'profiles' && (
        <>
          {isAdmin && (
            <form onSubmit={submitProfile} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-3">
                <h2 className="font-semibold mb-2">{active ? `Edit Profile #${active.id}` : 'Add Staff Profile'}</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <select className="w-full border rounded px-3 py-2" required value={form.user}
                  onChange={(e) => setForm({ ...form, user: parseInt(e.target.value) })}>
                  <option value="">Select teacher</option>
                  {teacherOptions.map((u) => <option key={u.id} value={u.id}>{userName(u)} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID</label>
                <input className="w-full border rounded px-3 py-2" required value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Designation</label>
                <input className="w-full border rounded px-3 py-2" required value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input className="w-full border rounded px-3 py-2" value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hire Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" required value={form.hire_date}
                  onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salary (KES)</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2" required value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bank Account</label>
                <input className="w-full border rounded px-3 py-2" value={form.bank_account}
                  onChange={(e) => setForm({ ...form, bank_account: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input className="w-full border rounded px-3 py-2" value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bank Branch</label>
                <input className="w-full border rounded px-3 py-2" value={form.bank_branch}
                  onChange={(e) => setForm({ ...form, bank_branch: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 md:col-span-1 mt-6">
                <input type="checkbox" id="is_active" checked={!!form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="is_active" className="text-sm">Active employee</label>
              </div>
              <div className="md:col-span-3 flex justify-end gap-3">
                {active && (
                  <button type="button" onClick={() => { setActive(null); setForm({ user: '', employee_id: '', designation: '', department: '', hire_date: new Date().toISOString().slice(0, 10), salary: '', bank_account: '', bank_name: '', bank_branch: '', is_active: true }); }}
                    className="px-4 py-2 border rounded">Cancel</button>
                )}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (active ? 'Save Changes' : 'Add Profile')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {profLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (profiles || []).map((p) => {
                const teacher = teacherOptions.find((t) => t.id === p.user);
                return (
                  <div key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{teacher ? userName(teacher) : `User #${p.user}`}</p>
                      <p className="text-sm text-gray-600">{p.employee_id} · {p.designation}</p>
                      {p.department && <p className="text-xs text-gray-500">{p.department}</p>}
                      <p className="text-xs text-gray-500">Salary: {p.salary} {PAYROLL_CURRENCY} · {p.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => openProfileEditor(p)} className="text-blue-600 text-sm hover:underline">Edit</button>
                        <button onClick={() => removeProfile(p.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {(!profLoading && (profiles || []).length === 0) && <p className="p-6 text-gray-500">No staff profiles found.</p>}
          </div>
        </>
      )}

      {tab === 'leaves' && (
        <>
          {isAdmin && (
            <form onSubmit={submitLeave} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <h2 className="font-semibold mb-2">{activeLeave ? `Edit Leave #${activeLeave.id}` : 'New Leave Request'}</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Staff Profile</label>
                <select className="w-full border rounded px-3 py-2" required value={leaveForm.staff}
                  onChange={(e) => {
                    const sp = (profiles || []).find((p) => p.id === parseInt(e.target.value));
                    setLeaveForm({ ...leaveForm, staff: parseInt(e.target.value), leave_type: sp?.default_leave_type || '' });
                  }}>
                  <option value="">Select staff</option>
                  {(profiles || []).map((p) => {
                    const teacher = teacherOptions.find((t) => t.id === p.user);
                    return <option key={p.id} value={p.id}>{teacher ? userName(teacher) : `Staff #${p.user}`}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <input className="w-full border rounded px-3 py-2" value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  placeholder="e.g. Annual, Sick, Maternity" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" required value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" required value={leaveForm.end_date}
                  onChange={(e) => {
                    const start = new Date(leaveForm.start_date);
                    const end = new Date(e.target.value);
                    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    setLeaveForm({ ...leaveForm, end_date: e.target.value, days: diffDays });
                  }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Days</label>
                <input type="number" className="w-full border rounded px-3 py-2" required value={leaveForm.days}
                  onChange={(e) => setLeaveForm({ ...leaveForm, days: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} required value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                {activeLeave && (
                  <button type="button" onClick={() => { setActiveLeave(null); setLeaveForm({ staff: '', leave_type: '', start_date: '', end_date: '', days: 0, reason: '', status: 'PENDING' }); }}
                    className="px-4 py-2 border rounded">Cancel</button>
                )}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (activeLeave ? 'Save Changes' : 'Submit')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {leaveLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (leaves || []).map((l) => {
                const profile = (profiles || []).find((p) => p.id === l.staff);
                const teacher = profile ? teacherOptions.find((t) => t.id === profile.user) : null;
                return (
                  <div key={l.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{teacher ? userName(teacher) : `Staff Profile #${l.staff}`}</p>
                      <p className="text-sm text-gray-600">{l.leave_type} · {new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()} ({l.days} days)</p>
                      <p className="text-xs text-gray-600 mt-1">{l.reason}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[l.status] || 'bg-gray-100'}`}>
                      {l.status}
                    </span>
                  </div>
                );
              })
            )}
            {(!leaveLoading && (leaves || []).length === 0) && <p className="p-6 text-gray-500">No leave requests found.</p>}
          </div>
        </>
      )}

      {tab === 'payslips' && (
        <>
          {isAdmin && (
            <form onSubmit={submitPayslip} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-3">
                <h2 className="font-semibold mb-2">{activePayslip ? `Edit Payslip #${activePayslip.id}` : 'Generate Payslip'}</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Staff Profile</label>
                <select className="w-full border rounded px-3 py-2" required value={payslipForm.staff}
                  onChange={(e) => setPayslipForm({ ...payslipForm, staff: parseInt(e.target.value) })}>
                  <option value="">Select staff</option>
                  {(profiles || []).map((p) => {
                    const teacher = teacherOptions.find((t) => t.id === p.user);
                    return <option key={p.id} value={p.id}>{teacher ? userName(teacher) : `#${p.user}`}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <select className="w-full border rounded px-3 py-2" required value={payslipForm.month}
                  onChange={(e) => setPayslipForm({ ...payslipForm, month: parseInt(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input type="number" className="w-full border rounded px-3 py-2" required value={payslipForm.year}
                  onChange={(e) => setPayslipForm({ ...payslipForm, year: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gross Salary ({PAYROLL_CURRENCY})</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2" required value={payslipForm.gross_salary}
                  onChange={(e) => { setPayslipForm({ ...payslipForm, gross_salary: e.target.value }); updateNet(); }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Basic Salary ({PAYROLL_CURRENCY})</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2" required value={payslipForm.basic_salary}
                  onChange={(e) => setPayslipForm({ ...payslipForm, basic_salary: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Allowances ({PAYROLL_CURRENCY})</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={payslipForm.allowances}
                  onChange={(e) => { setPayslipForm({ ...payslipForm, allowances: e.target.value }); updateNet(); }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deductions ({PAYROLL_CURRENCY})</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={payslipForm.deductions}
                  onChange={(e) => { setPayslipForm({ ...payslipForm, deductions: e.target.value }); updateNet(); }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Net Salary ({PAYROLL_CURRENCY})</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2 bg-gray-50" value={payslipForm.net_salary} readOnly />
              </div>
              <div className="flex items-center gap-2 md:col-span-1 mt-6">
                <input type="checkbox" id="is_paid" checked={!!payslipForm.is_paid}
                  onChange={(e) => setPayslipForm({ ...payslipForm, is_paid: e.target.checked })} />
                <label htmlFor="is_paid" className="text-sm">Paid</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={payslipForm.payment_date}
                  onChange={(e) => setPayslipForm({ ...payslipForm, payment_date: e.target.value })} />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3">
                {activePayslip && (
                  <button type="button" onClick={() => { setActivePayslip(null); setPayslipForm({ staff: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), gross_salary: '', basic_salary: '', allowances: '0', deductions: '0', net_salary: '', is_paid: false, payment_date: '' }); }}
                    className="px-4 py-2 border rounded">Cancel</button>
                )}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (activePayslip ? 'Save Changes' : 'Generate')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {slipLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (payslips || []).map((ps) => {
                const profile = (profiles || []).find((p) => p.id === ps.staff);
                const teacher = profile ? teacherOptions.find((t) => t.id === profile.user) : null;
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return (
                  <div key={ps.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{teacher ? userName(teacher) : `Staff #${ps.staff}`}</p>
                      <p className="text-sm text-gray-600">{months[ps.month - 1]} {ps.year} · {PAYROLL_CURRENCY} {ps.net_salary}</p>
                      <p className="text-xs text-gray-500">Gross: {ps.gross_salary} · Deductions: {ps.deductions} · {ps.is_paid ? 'Paid' : 'Pending'}
                        {ps.payment_date && ` on ${new Date(ps.payment_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setActivePayslip(ps);
                        setPayslipForm({
                          staff: ps.staff, month: ps.month, year: ps.year,
                          gross_salary: ps.gross_salary, basic_salary: ps.basic_salary,
                          allowances: ps.allowances, deductions: ps.deductions,
                          net_salary: ps.net_salary, is_paid: ps.is_paid,
                          payment_date: ps.payment_date ? ps.payment_date.slice(0, 10) : '',
                        });
                        setError('');
                      }} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
                  </div>
                );
              })
            )}
            {(!slipLoading && (payslips || []).length === 0) && <p className="p-6 text-gray-500">No payslips found.</p>}
          </div>
        </>
      )}

      {tab === 'settings' && (
        <>
          {isAdmin && (
            <form onSubmit={submitSetting} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <h2 className="font-semibold mb-2">Payroll Settings</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pay Period</label>
                <select className="w-full border rounded px-3 py-2" value={settingForm.pay_period}
                  onChange={(e) => setSettingForm({ ...settingForm, pay_period: e.target.value })}>
                  {PAY_PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payable Days</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={settingForm.payable_days}
                  onChange={(e) => setSettingForm({ ...settingForm, payable_days: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Allowances ({PAYROLL_CURRENCY})</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={settingForm.default_allowances}
                  onChange={(e) => setSettingForm({ ...settingForm, default_allowances: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Deductions ({PAYROLL_CURRENCY})</label>
                <input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={settingForm.default_deductions}
                  onChange={(e) => setSettingForm({ ...settingForm, default_deductions: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow p-4">
            {setLoad ? <p className="text-gray-500">Loading…</p> : (settings?.[0] ? (
              <div>
                <p><strong>Pay Period:</strong> {settings[0].pay_period}</p>
                <p><strong>Payable Days:</strong> {settings[0].payable_days}</p>
                <p><strong>Default Allowances:</strong> {settings[0].default_allowances} {PAYROLL_CURRENCY}</p>
                <p><strong>Default Deductions:</strong> {settings[0].default_deductions} {PAYROLL_CURRENCY}</p>
              </div>
            ) : <p className="text-gray-500">No payroll settings configured yet.</p>)}
          </div>
        </>
      )}
    </div>
  );
};

export default Payroll;
