import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileCheck,
  ShoppingBag,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  { icon: LayoutDashboard, label: 'Role-based dashboards' },
  { icon: Users, label: 'Student, teacher & parent portals' },
  { icon: School, label: 'Multi-classroom & stream management' },
  { icon: BookOpen, label: 'CBC learning areas & schemes of work' },
  { icon: ClipboardList, label: 'Course flow & topics' },
  { icon: CalendarCheck, label: 'Attendance tracking' },
  { icon: FileCheck, label: 'Assessment & grading' },
  { icon: ShoppingBag, label: 'School shop & fees' },
  { icon: BarChart3, label: 'Reports & analytics' },
];

const PublicHome = () => {
  const { user, loading, getDashboardRoute } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (user) return <Navigate to={getDashboardRoute(user.role)} replace />;
  return <Homepage />;
};

const Homepage = () => (
  <div className="min-h-screen flex flex-col">
    <header className="bg-[#1A0503] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <School className="h-7 w-7 text-red-300" />
          <span className="text-xl font-semibold">EduGuide Schools</span>
        </div>
        <Link
          to="/login"
          className="rounded-xl bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-red-100"
        >
          Login
        </Link>
      </div>
    </header>

    <main className="flex-1">
      <section className="bg-gradient-to-b from-[#1A0503] to-[#3A1008] text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simplify Your School's Workflow
          </h1>
          <p className="mt-6 text-lg text-red-200/80">
            EduGuide Schools unifies classroom flow, attendance, schemes of
            work, assessments, fees, and communications in one CBC-ready platform.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-8 py-3 text-base font-semibold text-white transition hover:bg-red-800"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Everything you need
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            Built for teachers, parents, students, and school administrators.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 text-center shadow"
              >
                <div className="rounded-lg bg-red-50 p-3">
                  <f.icon className="h-6 w-6 text-red-700" />
                </div>
                <span className="text-sm font-medium text-slate-700">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>

    <footer className="bg-[#1A0503] text-red-200/60 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm">
        &copy; {new Date().getFullYear()} EduGuide Schools. All rights reserved.
      </div>
    </footer>
  </div>
);

export default PublicHome;
