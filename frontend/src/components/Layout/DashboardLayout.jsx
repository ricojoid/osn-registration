import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import NotificationsDropdown from '../shared/NotificationsDropdown';
import { BarChart, Trophy, ClipboardCheck, Home, FileText, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: <BarChart size={20} />, end: true },
    { to: '/admin/events', label: 'Kelola Lomba', icon: <Trophy size={20} /> },
    { to: '/admin/verify', label: 'Verifikasi Berkas', icon: <ClipboardCheck size={20} /> },
  ];

  const pendaftarLinks = [
    { to: '/pendaftar', label: 'Dashboard', icon: <Home size={20} />, end: true },
    { to: '/pendaftar/events', label: 'Daftar Lomba', icon: <Trophy size={20} /> },
    { to: '/pendaftar/my-registrations', label: 'Pendaftaran Saya', icon: <FileText size={20} /> },
  ];

  const links = isAdmin ? adminLinks : pendaftarLinks;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            OSN Portal
            <span>Olimpiade Sains Nasional</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {getInitials(user?.fullName)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          paddingBottom: '16px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-color)' 
        }}>
          <NotificationsDropdown />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
