import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/shared/Toast';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import NasionalDashboardLayout from './components/Layout/NasionalDashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin pages
import AdminModeSelection from './pages/admin/AdminModeSelection';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventManagement from './pages/admin/EventManagement';
import VerificationPage from './pages/admin/VerificationPage';

// Admin Nasional pages
import NasionalDashboard from './pages/admin/nasional/NasionalDashboard';
import RegionList from './pages/admin/nasional/RegionList';
import RegionEventManagement from './pages/admin/nasional/RegionEventManagement';

// Pendaftar pages
import PendaftarDashboard from './pages/pendaftar/PendaftarDashboard';
import EventList from './pages/pendaftar/EventList';
import RegistrationForm from './pages/pendaftar/RegistrationForm';
import MyRegistrations from './pages/pendaftar/MyRegistrations';

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Memuat aplikasi...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'Admin' ? '/admin' : '/pendaftar'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'Admin' ? '/admin' : '/pendaftar'} replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        {/* Mode Selection */}
        <Route path="/admin" element={<AdminModeSelection />} />

        {/* Nasional Mode */}
        <Route element={<NasionalDashboardLayout />}>
          <Route path="/admin/nasional" element={<NasionalDashboard />} />
          <Route path="/admin/nasional/events" element={<RegionList />} />
          <Route path="/admin/nasional/events/:regionId" element={<RegionEventManagement />} />
          <Route path="/admin/nasional/verify" element={<VerificationPage />} />
        </Route>

        {/* Daerah Mode */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin/daerah" element={<AdminDashboard />} />
          <Route path="/admin/daerah/events" element={<EventManagement />} />
          <Route path="/admin/daerah/verify" element={<VerificationPage />} />
        </Route>
      </Route>

      {/* Pendaftar routes */}
      <Route element={<ProtectedRoute allowedRoles={['Pendaftar']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/pendaftar" element={<PendaftarDashboard />} />
          <Route path="/pendaftar/events" element={<EventList />} />
          <Route path="/pendaftar/register/:eventId" element={<RegistrationForm />} />
          <Route path="/pendaftar/my-registrations" element={<MyRegistrations />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
