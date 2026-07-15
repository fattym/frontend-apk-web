import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Parents from './pages/Parents';
import Classes from './pages/Classes';
import LearningAreas from './pages/LearningAreas';
import Enrollments from './pages/Enrollments';
import ReferenceDocuments from './pages/ReferenceDocuments';
import SchemesOfWork from './pages/SchemesOfWork';
import ShopProducts from './pages/ShopProducts';
import ShopCategories from './pages/ShopCategories';
import ShopOrders from './pages/ShopOrders';
import Requirements from './pages/Requirements';
import ParentRequirements from './pages/ParentRequirements';
import Schools from './pages/Schools';
import Assessments from './pages/Assessments';
import TeacherAssignments from './pages/TeacherAssignments';
import LearnerGroups from './pages/LearnerGroups';
import Clubs from './pages/Clubs';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Fees from './pages/Fees';
import Library from './pages/Library';
import Messaging from './pages/Messaging';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'TEACHER') return <TeacherDashboard />;
  if (user?.role === 'STUDENT') return <StudentDashboard />;
  return <Dashboard />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    }>
      <Route index element={<RoleBasedDashboard />} />
      <Route path="students" element={<Students />} />
      <Route path="parents" element={<Parents />} />
      <Route path="teachers" element={<Teachers />} />
      <Route path="classes" element={<Classes />} />
      <Route path="learning-areas" element={<LearningAreas />} />
      <Route path="enrollments" element={<Enrollments />} />
      <Route path="reference-documents" element={<ReferenceDocuments />} />
      <Route path="schemes-of-work" element={<SchemesOfWork />} />
      <Route path="shop/products" element={<ShopProducts />} />
      <Route path="shop/categories" element={<ShopCategories />} />
      <Route path="shop/orders" element={<ShopOrders />} />
      <Route path="requirements" element={<Requirements />} />
      <Route path="parent/requirements" element={<ParentRequirements />} />
      <Route path="schools" element={<Schools />} />
      <Route path="assessments" element={<Assessments />} />
      <Route path="teacher-assignments" element={<TeacherAssignments />} />
      <Route path="learner-groups" element={<LearnerGroups />} />
      <Route path="clubs" element={<Clubs />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="exams" element={<Exams />} />
      <Route path="fees" element={<Fees />} />
      <Route path="library" element={<Library />} />
      <Route path="messaging" element={<Messaging />} />
    </Route>
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
