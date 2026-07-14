import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, assessRes, rcRes] = await Promise.all([
          api.get('/api/attendance/attendance-records/'),
          api.get('/api/assessment/assessments/'),
          api.get('/api/exams/report-cards/'),
        ]);
        setAttendance(attRes.data.results || attRes.data);
        setAssessments(assessRes.data.results || assessRes.data);
        setReportCards(rcRes.data.results || rcRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendance.filter(a => a.status === 'ABSENT').length;
  const meCount = assessments.filter(a => a.level_achieved === 'ME').length;
  const eeCount = assessments.filter(a => a.level_achieved === 'EE').length;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.first_name} {user?.last_name}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Present Days</h3>
          <p className="text-3xl font-bold text-green-600">{presentCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Absent Days</h3>
          <p className="text-3xl font-bold text-red-600">{absentCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Meeting Expectations</h3>
          <p className="text-3xl font-bold text-blue-600">{meCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Exceeding Expectations</h3>
          <p className="text-3xl font-bold text-purple-600">{eeCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Attendance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.slice(0, 10).map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4">{a.date}</td>
                    <td className="px-6 py-4">{a.stream?.name || a.stream}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${a.status === 'PRESENT' ? 'bg-green-100 text-green-800' : a.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No attendance records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Competency Assessments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assessments.slice(0, 10).map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4 max-w-xs truncate">{a.outcome?.description || a.outcome}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${a.level_achieved === 'EE' ? 'bg-blue-100 text-blue-800' : a.level_achieved === 'ME' ? 'bg-green-100 text-green-800' : a.level_achieved === 'AE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {a.level_achieved}
                      </span>
                    </td>
                    <td className="px-6 py-4">{a.term?.name || a.term}</td>
                  </tr>
                ))}
                {assessments.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No assessments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
