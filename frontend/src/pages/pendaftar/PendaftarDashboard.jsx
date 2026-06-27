import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsApi, registrationsApi } from '../../api/axios';
import { 
  Trophy, FileText, CheckCircle2, Clock, 
  Search, Paperclip, XCircle, GraduationCap 
} from 'lucide-react';

export default function PendaftarDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    availableEvents: 0,
    myRegistrations: 0,
    verified: 0,
    pending: 0,
  });
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [eventsRes, regsRes] = await Promise.all([
        eventsApi.getAll(),
        registrationsApi.getMy(),
      ]);

      const events = eventsRes.data;
      const registrations = regsRes.data;

      setStats({
        availableEvents: events.filter((e) => e.status === 'Open').length,
        myRegistrations: registrations.length,
        verified: registrations.filter((r) => r.status === 'Verified').length,
        pending: registrations.filter((r) => r.status === 'Pending').length,
      });

      setMyRegistrations(registrations.slice(0, 5));
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
          <h1 className="page-title">Dashboard Pendaftar</h1>
          <p className="page-subtitle">
            Halo, {user?.fullName}! Temukan lomba OSN yang tersedia <GraduationCap className="inline text-primary" size={20} />
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="glass-card stat-card animate-fade-in-up stagger-1">
          <div className="stat-icon"><Trophy size={28} /></div>
          <div className="stat-value">{stats.availableEvents}</div>
          <div className="stat-label">Lomba Tersedia</div>
        </div>
        <div className="glass-card stat-card animate-fade-in-up stagger-2">
          <div className="stat-icon"><FileText size={28} /></div>
          <div className="stat-value">{stats.myRegistrations}</div>
          <div className="stat-label">Pendaftaran Saya</div>
        </div>
        <div className="glass-card stat-card animate-fade-in-up stagger-3">
          <div className="stat-icon"><CheckCircle2 size={28} /></div>
          <div className="stat-value">{stats.verified}</div>
          <div className="stat-label">Terverifikasi</div>
        </div>
        <div className="glass-card stat-card animate-fade-in-up stagger-4">
          <div className="stat-icon"><Clock size={28} /></div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Menunggu Verifikasi</div>
        </div>
      </div>

      {/* My Registrations */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} className="text-primary" /> Pendaftaran Terbaru Saya
        </h2>
        {myRegistrations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={48} className="text-muted" /></div>
            <div className="empty-state-title">Belum ada pendaftaran</div>
            <div className="empty-state-text">
              Anda belum mendaftar di lomba manapun. Kunjungi halaman "Daftar Lomba" untuk melihat lomba yang tersedia.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lomba</th>
                  <th>Tanggal Daftar</th>
                  <th>Dokumen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {reg.eventName}
                    </td>
                    <td>{new Date(reg.registeredAt).toLocaleDateString('id-ID')}</td>
                    <td style={{ color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Paperclip size={14} /> {reg.documents?.length || 0} File
                    </td>
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
