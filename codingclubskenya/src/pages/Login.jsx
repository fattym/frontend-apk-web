import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const { login, studentLogin, user, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to={getDashboardRoute(user.role)} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let loggedInUser = null;
      if (mode === 'email') {
        loggedInUser = await login(email, password);
      } else {
        loggedInUser = await studentLogin(studentId, pinCode);
      }
      navigate(getDashboardRoute(loggedInUser?.role));
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">School Management Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex gap-2 mb-6">
          <button type="button" onClick={() => setMode('email')} className={`flex-1 py-2 rounded ${mode === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Teacher / Staff</button>
          <button type="button" onClick={() => setMode('student')} className={`flex-1 py-2 rounded ${mode === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Student</button>
        </div>

        {mode === 'email' ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Student ID / Admission Number</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g. STD-001"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">PIN Code</label>
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
