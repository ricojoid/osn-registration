import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { eventsApi, registrationsApi } from '../../../api/axios';
import { 
  Trophy, Users, Clock, CheckCircle2, 
  ClipboardList, Inbox, XCircle, Globe, MapPin 
} from 'lucide-react';

const REGIONS = [
  { id: 'jawa-barat', name: 'Jawa Barat' },
  { id: 'jawa-tengah', name: 'Jawa Tengah' },
  { id: 'jawa-timur', name: 'Jawa Timur' },
  { id: 'banten', name: 'Banten' },
  { id: 'jakarta', name: 'Jakarta' },
];

export default function NasionalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    pendingVerification: 0,
    verifiedRegistrations: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [eventsRes, regsRes] = await Promise.all([
        eventsApi.getAll(),
        registrationsApi.getAll(),
      ]);

      const events = eventsRes.data;
      const registrations = regsRes.data;

      setStats({
        totalEvents: events.length,
        totalRegistrations: registrations.length,
        pendingVerification: registrations.filter((r) => r.status === 'Pending').length,
        verifiedRegistrations: registrations.filter((r) => r.status === 'Verified').length,
      });

      setRecentRegistrations(registrations.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Globe size={32} style={{ color: 'var(--primary-500)' }} />
            Dashboard Nasional
          </h1>
          <p className="page-subtitle">
            Selamat datang kembali, {user?.fullName} — Overview seluruh daerah
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="glass-card stat-card animate-fade-in-up stagger-1">
          <div className="stat-icon"><Trophy size={28} /></div>
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-label">Total Lomba</div>
        </div>
        <div className="glass-card stat-card animate-fade-in-up stagger-2">
          <div className="stat-icon"><Users size={28} /></div>
          <div className="stat-value">{stats.totalRegistrations}</div>
          <div className="stat-label">Total Pendaftaran</div>
        </div>
        <div className="glass-card stat-card animate-fade-in-up stagger-3">
          <div className="stat-icon"><Clock size={28} /></div>
          <div className="stat-value">{stats.pendingVerification}</div>
          <div className="stat-label">Menunggu Verifikasi</div>
        </div>
        <div className="glass-card stat-card animate-fade-in-up stagger-4">
          <div className="stat-icon"><CheckCircle2 size={28} /></div>
          <div className="stat-value">{stats.verifiedRegistrations}</div>
          <div className="stat-label">Terverifikasi</div>
        </div>
      </div>

      {/* Region Overview */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} className="text-primary" /> Daerah yang Dikelola
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {REGIONS.map((region) => (
            <span
              key={region.id}
              className="badge badge-open"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <MapPin size={14} /> {region.name}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={20} className="text-primary" /> Pendaftaran Terbaru
        </h2>
        {recentRegistrations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Inbox size={48} className="text-muted" /></div>
            <div className="empty-state-title">Belum ada pendaftaran</div>
            <div className="empty-state-text">Pendaftaran akan muncul di sini setelah ada peserta yang mendaftar.</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pendaftar</th>
                  <th>Lomba</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {reg.userFullName}
                    </td>
                    <td>{reg.eventName}</td>
                    <td>{new Date(reg.registeredAt).toLocaleDateString('id-ID')}</td>
                    <td>
                      <span className={`badge badge-${reg.status.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {reg.status === 'Pending' && <Clock size={14} />}
                        {reg.status === 'Verified' && <CheckCircle2 size={14} />}
                        {reg.status === 'Rejected' && <XCircle size={14} />}
                        <span>{reg.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
