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
      if (mode === 'email' || mode === 'parent') {
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
    <div className="min-h-screen flex items-center justify-center bg-brand-grayLight">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-brand-navy">School Management Login</h1>
        {error && <p className="text-brand-orange mb-4">{error}</p>}

        <div className="flex gap-2 mb-6">
          <button type="button" onClick={() => setMode('email')} className={`flex-1 py-2 rounded-xl ${mode === 'email' ? 'bg-brand-orange text-white' : 'bg-brand-grayLight text-brand-navy'}`}>Teacher / Staff</button>
          <button type="button" onClick={() => setMode('parent')} className={`flex-1 py-2 rounded-xl ${mode === 'parent' ? 'bg-brand-orange text-white' : 'bg-brand-grayLight text-brand-navy'}`}>Parent</button>
          <button type="button" onClick={() => setMode('student')} className={`flex-1 py-2 rounded-xl ${mode === 'student' ? 'bg-brand-orange text-white' : 'bg-brand-grayLight text-brand-navy'}`}>Student</button>
        </div>

        {mode === 'email' || mode === 'parent' ? (
          <>
            <div className="mb-4">
              <label className="block text-brand-navy/70 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-brand-navy/10 rounded-xl focus:outline-none focus:border-brand-orange"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-brand-navy/70 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-brand-navy/10 rounded-xl focus:outline-none focus:border-brand-orange"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-brand-navy/70 mb-2">Student ID / Admission Number</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-brand-navy/10 rounded-xl focus:outline-none focus:border-brand-orange"
                placeholder="e.g. STD-001"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-brand-navy/70 mb-2">PIN Code</label>
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-3 py-2 border border-brand-navy/10 rounded-xl focus:outline-none focus:border-brand-orange"
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="w-full bg-brand-orange text-white py-2 rounded-xl hover:bg-brand-orangeHover">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
