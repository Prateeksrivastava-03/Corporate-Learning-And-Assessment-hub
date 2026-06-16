import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { Spinner } from './components/common/UI';

// Auth Pages
import { LoginPage, RegisterPage } from './pages/Auth';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminAssessments from './pages/admin/Assessments';
import { CertificatesPage as AdminCertificates, AnalyticsPage as AdminAnalytics } from './pages/admin/Analytics';

// Trainer Pages
import TrainerDashboard from './pages/trainer/Dashboard';
import TrainerStudents from './pages/trainer/Students';
import TrainerAnalytics from './pages/trainer/Analytics';
// Trainer reuses Admin course/assessment pages
import TrainerCourses from './pages/admin/Courses';
import TrainerAssessments from './pages/admin/Assessments';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeCourses from './pages/employee/Courses';
import EmployeeAssessments from './pages/employee/Assessments';
import { ProgressPage, CertificatesPage as EmployeeCertificates } from './pages/employee/Progress';

// ── Protected Route ──────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner text="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirects = { admin: '/admin/dashboard', trainer: '/trainer/dashboard', employee: '/employee/dashboard' };
    return <Navigate to={redirects[user.role] || '/login'} replace />;
  }
  return <Layout>{children}</Layout>;
}

// ── Root redirect based on role ───────────────────────────────────
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  const redirects = { admin: '/admin/dashboard', trainer: '/trainer/dashboard', employee: '/employee/dashboard' };
  return <Navigate to={redirects[user.role] || '/login'} replace />;
}

// ── App ──────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>} />
      <Route path="/admin/assessments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAssessments /></ProtectedRoute>} />
      <Route path="/admin/certificates" element={<ProtectedRoute allowedRoles={['admin']}><AdminCertificates /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

      {/* Trainer Routes */}
      <Route path="/trainer/dashboard" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/trainer/courses" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerCourses /></ProtectedRoute>} />
      <Route path="/trainer/assessments" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerAssessments /></ProtectedRoute>} />
      <Route path="/trainer/students" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerStudents /></ProtectedRoute>} />
      <Route path="/trainer/analytics" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerAnalytics /></ProtectedRoute>} />

      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/courses" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeCourses /></ProtectedRoute>} />
      <Route path="/employee/assessments" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAssessments /></ProtectedRoute>} />
      <Route path="/employee/progress" element={<ProtectedRoute allowedRoles={['employee']}><ProgressPage /></ProtectedRoute>} />
      <Route path="/employee/certificates" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeCertificates /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--navy-mid)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.875rem' },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--navy)' } },
            error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--navy)' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
