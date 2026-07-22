import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  School,
  BookOpen,
  ClipboardList,
  FileCheck,
  UserCheck,
  CalendarCheck,
  NotebookPen,
  Users,
  Dumbbell,
  MessageSquareWarning,
  CalendarDays,
  UserPlus,
  FileText,
  ShoppingBag,
  Tag,
  ShoppingCart,
  FileSearch,
  CreditCard,
  BookMarked,
  Mail,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
        ? 'bg-red-900/40 text-white shadow-sm'
        : 'text-red-100/80 hover:bg-red-900/30 hover:text-white'
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
            [homePath, 'Dashboard', LayoutDashboard],
            ['/course-flow', 'Course Flow', Workflow],
            ['/classes', 'My Classes', School],
            ['/courses', 'Course Studio', BookOpen],
            ['/schemes-of-work', 'Schemes of Work', ClipboardList],
            ['/assessments', 'Assessments', FileCheck],
            ['/teacher-assignments', 'Teacher Assignments', UserCheck],
            ['/attendance', 'Attendance', CalendarCheck],
            ['/homework', 'Homework', NotebookPen],
          ],
        },
        {
          title: 'Activities',
          items: [
            ['/learner-groups', 'Learner Groups', Users],
            ['/clubs', 'Clubs & Activities', Dumbbell],
            ['/complaints', 'Complaints', MessageSquareWarning],
            ['/events', 'Events', CalendarDays],
          ],
        },
      ]
    : role === 'STUDENT'
      ? [
          {
            title: 'Learner',
            items: [
              [homePath, 'Dashboard', LayoutDashboard],
              ['/my-courses', 'My Courses', BookOpen],
              ['/attendance', 'My Attendance', CalendarCheck],
              ['/assessments', 'My Assessments', FileCheck],
              ['/parent/requirements', 'Required Items', ClipboardList],
              ['/homework', 'Homework', NotebookPen],
              ['/complaints', 'My Complaints', MessageSquareWarning],
              ['/events', 'Events', CalendarDays],
            ],
          },
        ]
      : [
          {
            title: 'Academics',
            items: [
              [homePath, 'Dashboard', LayoutDashboard],
              ['/course-flow', 'Course Flow', Workflow],
              ['/students', 'Students', Users],
              ['/parents', 'Parents', Users],
              ['/teachers', 'Teachers', UserCheck],
              ['/classes', 'Classes', School],
              ['/learning-areas', 'Learning Areas', BookOpen],
              ['/enrollments', 'Enrollments', UserPlus],
              ['/reference-documents', 'Reference Docs', FileText],
              ['/schemes-of-work', 'Schemes of Work', ClipboardList],
              ['/assessments', 'Assessments', FileCheck],
            ],
          },
          {
            title: 'Operations',
            items: [
              ['/shop/products', 'Shop Products', ShoppingBag],
              ['/shop/categories', 'Shop Categories', Tag],
              ['/shop/orders', 'Shop Orders', ShoppingCart],
              ['/requirements', 'Required Items', ClipboardList],
              ['/schools', 'Schools', School],
              ['/attendance', 'Attendance', CalendarCheck],
              ['/exams', 'Exams', FileSearch],
              ['/fees', 'Fees', CreditCard],
              ['/library', 'Library', BookMarked],
              ['/messaging', 'Messages', Mail],
              ['/complaints', 'Complaints', MessageSquareWarning],
              ['/events', 'Events', CalendarDays],
              ['/reports', 'Reports', BarChart3],
            ],
          },
        ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className={`flex flex-col bg-[#1A0503] text-white transition-all duration-300 ease-in-out ${collapsed ? 'w-full lg:w-16' : 'w-full lg:w-80 xl:w-96'} lg:min-h-screen`}>
        <div className="border-b border-red-900/40 px-4 py-5 lg:px-6 lg:py-6">
          <div className="flex items-center justify-between gap-2">
            {!collapsed && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-red-300">School Suite</p>
                <h1 className="mt-2 text-2xl font-semibold">EduGuide Schools</h1>
                <p className="mt-2 text-sm text-red-200/70 hidden xl:block">
                  CBC learning, attendance, schemes, and classroom flow in one place.
                </p>
              </div>
            )}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="rounded-lg border border-red-900/40 p-1.5 text-red-200 hover:bg-red-900/40 hover:text-white"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
          {!collapsed && (
            <span className="mt-3 inline-block rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs text-red-200">
              {role || 'USER'}
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4 lg:px-4 lg:py-5">
          {navGroups.map((group) => (
            <section key={group.title}>
              {!collapsed && (
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-red-400/80">
                  {group.title}
                </p>
              )}
               <div className="space-y-1">
                 {group.items.map(([to, label, Icon]) => (
                   <NavLink
                     key={to}
                     to={to}
                     className={navLinkClass}
                     end={to === homePath}
                     title={collapsed ? label : undefined}
                   >
                     {collapsed ? (
                       <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-900/50 text-white">
                         <Icon className="h-4 w-4" />
                       </span>
                     ) : (
                       <span className="flex items-center gap-3">
                         <Icon className="h-4 w-4 shrink-0" />
                         <span>{label}</span>
                       </span>
                     )}
                   </NavLink>
                 ))}
               </div>
            </section>
          ))}
        </nav>

        <div className="border-t border-red-900/40 px-3 py-4 lg:px-6 lg:py-5">
          {!collapsed && (
            <>
              <p className="text-sm font-medium text-white">{user?.first_name || user?.email}</p>
              <p className="text-xs text-red-200/70">{user?.email}</p>
            </>
          )}
          <button
            onClick={handleLogout}
            className={`mt-3 w-full rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-red-100 ${collapsed ? 'flex items-center justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            {collapsed ? <LogOut className="h-4 w-4" /> : 'Logout'}
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
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-800">CBC ready</span>
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
