import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`;

  const role = user?.role;

  const adminLinks = (
    <>
      <NavLink to="/" className={navLinkClass} end>Dashboard</NavLink>
      <NavLink to="/students" className={navLinkClass}>Students</NavLink>
      <NavLink to="/parents" className={navLinkClass}>Parents</NavLink>
      <NavLink to="/teachers" className={navLinkClass}>Teachers</NavLink>
      <NavLink to="/classes" className={navLinkClass}>Classes</NavLink>
      <NavLink to="/learning-areas" className={navLinkClass}>Learning Areas</NavLink>
      <NavLink to="/enrollments" className={navLinkClass}>Enrollments</NavLink>
      <NavLink to="/reference-documents" className={navLinkClass}>Reference Docs</NavLink>
      <NavLink to="/schemes-of-work" className={navLinkClass}>Schemes of Work</NavLink>
      <NavLink to="/assessments" className={navLinkClass}>Assessments</NavLink>
      <NavLink to="/shop/products" className={navLinkClass}>Shop Products</NavLink>
      <NavLink to="/shop/categories" className={navLinkClass}>Shop Categories</NavLink>
      <NavLink to="/shop/orders" className={navLinkClass}>Shop Orders</NavLink>
      <NavLink to="/requirements" className={navLinkClass}>Required Items</NavLink>
      <NavLink to="/schools" className={navLinkClass}>Schools</NavLink>
      <NavLink to="/attendance" className={navLinkClass}>Attendance</NavLink>
      <NavLink to="/exams" className={navLinkClass}>Exams</NavLink>
      <NavLink to="/fees" className={navLinkClass}>Fees</NavLink>
      <NavLink to="/library" className={navLinkClass}>Library</NavLink>
      <NavLink to="/messaging" className={navLinkClass}>Messages</NavLink>
    </>
  );

  const teacherLinks = (
    <>
      <NavLink to="/" className={navLinkClass} end>Dashboard</NavLink>
      <NavLink to="/classes" className={navLinkClass}>My Classes</NavLink>
      <NavLink to="/assessments" className={navLinkClass}>Assessments</NavLink>
      <NavLink to="/teacher-assignments" className={navLinkClass}>Teacher Assignments</NavLink>
      <NavLink to="/learner-groups" className={navLinkClass}>Learner Groups</NavLink>
      <NavLink to="/clubs" className={navLinkClass}>Clubs &amp; Activities</NavLink>
      <NavLink to="/attendance" className={navLinkClass}>Attendance</NavLink>
    </>
  );

  const studentLinks = (
    <>
      <NavLink to="/" className={navLinkClass} end>Dashboard</NavLink>
      <NavLink to="/attendance" className={navLinkClass}>My Attendance</NavLink>
      <NavLink to="/assessments" className={navLinkClass}>My Assessments</NavLink>
      <NavLink to="/parent/requirements" className={navLinkClass}>Required Items</NavLink>
    </>
  );

  const getNavLinks = () => {
    if (role === 'TEACHER') return teacherLinks;
    if (role === 'STUDENT') return studentLinks;
    return adminLinks;
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          EduGuide Schools
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {getNavLinks()}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
