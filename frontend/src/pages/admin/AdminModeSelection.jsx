import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Globe, Building2, ArrowRight, LogOut, Medal } from 'lucide-react';

export default function AdminModeSelection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mode-selection-page">
      <div className="mode-selection-container">
        {/* Header */}
        <div className="mode-selection-header">
          <div className="mode-selection-welcome">
            Selamat datang kembali, <strong>{user?.fullName}</strong>
          </div>
          <h1>
            <Medal size={40} style={{ color: 'var(--primary-500)' }} />
            OSN Portal
          </h1>
          <p>Pilih mode dashboard yang ingin Anda kelola</p>
        </div>

        {/* Mode Cards */}
        <div className="mode-selection-grid">
          {/* OSN Nasional */}
          <div
            className="mode-card animate-fade-in-up stagger-1"
            id="mode-nasional"
            onClick={() => navigate('/admin/nasional')}
          >
            <div className="mode-card-icon">
              <Globe size={36} />
            </div>
            <div className="mode-card-title">OSN Nasional</div>
            <div className="mode-card-desc">
              Kelola lomba di tingkat nasional. Atur perlombaan berdasarkan daerah di seluruh Indonesia.
            </div>
            <div className="mode-card-arrow">
              <ArrowRight size={20} />
            </div>
          </div>

          {/* OSN Daerah */}
          <div
            className="mode-card animate-fade-in-up stagger-2"
            id="mode-daerah"
            onClick={() => navigate('/admin/daerah')}
          >
            <div className="mode-card-icon">
              <Building2 size={36} />
            </div>
            <div className="mode-card-title">OSN Daerah</div>
            <div className="mode-card-desc">
              Kelola lomba, pendaftaran, dan verifikasi berkas di tingkat daerah.
            </div>
            <div className="mode-card-arrow">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mode-selection-footer">
          <button
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
