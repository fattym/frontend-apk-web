import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
      isActive
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  const role = user?.role;
  const homePath = role === 'TEACHER'
    ? '/teacher-dashboard'
    : role === 'STUDENT'
      ? '/student-dashboard'
      : '/school-dashboard';

  const navGroups = role === 'TEACHER'
    ? [
        {
          title: 'Teaching',
          items: [
            [homePath, 'Dashboard'],
            ['/course-flow', 'Course Flow'],
            ['/classes', 'My Classes'],
            ['/courses', 'Course Studio'],
            ['/schemes-of-work', 'Schemes of Work'],
            ['/assessments', 'Assessments'],
            ['/teacher-assignments', 'Teacher Assignments'],
            ['/attendance', 'Attendance'],
            ['/homework', 'Homework'],
          ],
        },
        {
          title: 'Activities',
          items: [
            ['/learner-groups', 'Learner Groups'],
            ['/clubs', 'Clubs & Activities'],
            ['/complaints', 'Complaints'],
            ['/events', 'Events'],
          ],
        },
      ]
    : role === 'STUDENT'
      ? [
          {
            title: 'Learner',
            items: [
              [homePath, 'Dashboard'],
              ['/my-courses', 'My Courses'],
              ['/attendance', 'My Attendance'],
              ['/assessments', 'My Assessments'],
              ['/parent/requirements', 'Required Items'],
              ['/homework', 'Homework'],
              ['/complaints', 'My Complaints'],
              ['/events', 'Events'],
            ],
          },
        ]
      : [
          {
            title: 'Academics',
            items: [
              [homePath, 'Dashboard'],
              ['/course-flow', 'Course Flow'],
              ['/students', 'Students'],
              ['/parents', 'Parents'],
              ['/teachers', 'Teachers'],
              ['/classes', 'Classes'],
              ['/learning-areas', 'Learning Areas'],
              ['/enrollments', 'Enrollments'],
              ['/reference-documents', 'Reference Docs'],
              ['/schemes-of-work', 'Schemes of Work'],
              ['/assessments', 'Assessments'],
            ],
          },
          {
            title: 'Operations',
            items: [
              ['/shop/products', 'Shop Products'],
              ['/shop/categories', 'Shop Categories'],
              ['/shop/orders', 'Shop Orders'],
              ['/requirements', 'Required Items'],
              ['/schools', 'Schools'],
              ['/attendance', 'Attendance'],
              ['/exams', 'Exams'],
              ['/fees', 'Fees'],
              ['/library', 'Library'],
              ['/messaging', 'Messages'],
              ['/complaints', 'Complaints'],
              ['/events', 'Events'],
              ['/reports', 'Reports'],
            ],
          },
        ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className={`flex flex-col bg-slate-950 text-white transition-all duration-300 ease-in-out ${collapsed ? 'w-full lg:w-16' : 'w-full lg:w-80 xl:w-96'} lg:min-h-screen`}>
        <div className="border-b border-white/10 px-4 py-5 lg:px-6 lg:py-6">
          <div className="flex items-center justify-between gap-2">
            {!collapsed && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-teal-300">School Suite</p>
                <h1 className="mt-2 text-2xl font-semibold">EduGuide Schools</h1>
                <p className="mt-2 text-sm text-slate-300 hidden xl:block">
                  CBC learning, attendance, schemes, and classroom flow in one place.
                </p>
              </div>
            )}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0L10 5.94l.72-.72a.75.75 0 1 1 1.06 1.06l-1.5 1.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4.22 9.22a.75.75 0 0 1 1.06 0L6 9.94l.72-.72a.75.75 0 1 1 1.06 1.06l-1.5 1.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10.22 13.22a.75.75 0 0 1 1.06 0L12 13.94l.72-.72a.75.75 0 1 1 1.06 1.06l-1.5-1.5a.75.75 0 0 1-1.06 0l-1.5 1.5a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {!collapsed && (
            <span className="mt-3 inline-block rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs text-teal-200">
              {role || 'USER'}
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4 lg:px-4 lg:py-5">
          {navGroups.map((group) => (
            <section key={group.title}>
              {!collapsed && (
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={navLinkClass}
                    end={to === homePath}
                    title={collapsed ? label : undefined}
                  >
                    {collapsed ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold text-white">
                        {label.charAt(0)}
                      </span>
                    ) : (
                      <span>{label}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4 lg:px-6 lg:py-5">
          {!collapsed && (
            <>
              <p className="text-sm font-medium text-white">{user?.first_name || user?.email}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </>
          )}
          <button
            onClick={handleLogout}
            className={`mt-3 w-full rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-teal-50 ${collapsed ? 'flex items-center justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            {collapsed ? '↪' : 'Logout'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Current session</p>
              <p className="text-sm font-medium text-slate-800">
                {user?.first_name || user?.email} · {role?.toLowerCase() || 'guest'}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">CBC ready</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Multi-tenant</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto pb-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
