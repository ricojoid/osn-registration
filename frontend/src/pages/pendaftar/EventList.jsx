import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../../api/axios';
import { useToast } from '../../components/shared/Toast';
import { formatDate, getDaysRemaining, isRegistrationOpen, getErrorMessage } from '../../utils/helpers';
import { Trophy, Calendar, MapPin, Clock, Users, FileText, Download, Edit, AlertCircle } from 'lucide-react';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data } = await eventsApi.getAll();
      setEvents(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLetter = async (eventId, status) => {
    try {
      const { data } = await eventsApi.downloadCancellationLetter(eventId);
      const fileName = status === 'Cancelled' ? 'Surat_Pembatalan.pdf' : 'Surat_Penundaan.pdf';
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Gagal mengunduh surat.');
    }
  };

  const handleDownloadRescheduleLetter = async (eventId) => {
    try {
      const { data } = await eventsApi.downloadRescheduleLetter(eventId);
      const fileName = 'Surat_Penjadwalan_Ulang.pdf';
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Gagal mengunduh surat penjadwalan ulang.');
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Memuat daftar lomba...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={32} className="text-primary" />
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Daftar Lomba OSN</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Temukan dan daftar lomba Olimpiade Sains Nasional</p>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="glass-card empty-state animate-fade-in-up">
          <div className="empty-state-icon"><Trophy size={48} className="text-muted" /></div>
          <div className="empty-state-title">Belum ada lomba tersedia</div>
          <div className="empty-state-text">Silakan cek kembali nanti untuk lomba terbaru.</div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
          }}
        >
          {events.map((event, idx) => {
            const canRegister = isRegistrationOpen(event.eventStartDate) && event.status === 'Open';
            const daysLeft = getDaysRemaining(event.registrationDeadline);

            return (
              <div
                key={event.id}
                className="glass-card animate-fade-in-up"
                style={{
                  padding: '24px',
                  animationDelay: `${idx * 0.05}s`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                    {event.name}
                  </h3>
                  <span className={`badge badge-${event.status.toLowerCase()}`}>
                    {event.status}
                  </span>
                </div>

                {/* Description */}
                {event.description && (
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {event.description}
                  </p>
                )}

                {/* Info Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px',
                    flex: 1,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      <Calendar size={12} /> Mulai
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatDate(event.eventStartDate)}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      <Calendar size={12} /> Selesai
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatDate(event.eventEndDate)}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      <MapPin size={12} /> Lokasi
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {event.location || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      <Clock size={12} /> Batas Daftar
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: canRegister
                        ? daysLeft <= 3 ? 'var(--status-warning)' : 'var(--status-success)'
                        : 'var(--status-error)',
                    }}>
                      {canRegister ? `${daysLeft} hari lagi` : 'Ditutup'}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderTop: '1px solid var(--border-primary)',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Users size={14} /> {event.totalRegistrations} pendaftar
                  </span>

                  {(event.status === 'Cancelled' || event.status === 'Postponed') ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {event.hasCancellationLetter && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDownloadLetter(event.id, event.status)}
                        >
                          <FileText size={14} /> Unduh Surat
                        </button>
                      )}
                    </div>
                  ) : canRegister ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {event.hasRescheduleLetter && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDownloadRescheduleLetter(event.id)}
                        >
                          <Download size={14} /> Jadwal Baru
                        </button>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => navigate(`/pendaftar/register/${event.id}`)}
                      >
                        <Edit size={14} /> Daftar Sekarang
                      </button>
                    </div>
                  ) : (
                    <span
                      className="badge badge-closed"
                      style={{ fontSize: '12px' }}
                    >
                      Pendaftaran Ditutup
                    </span>
                  )}
                </div>

                {/* Professional Cancellation/Postponement Indicator */}
                {(event.status === 'Cancelled' || event.status === 'Postponed') && event.cancellationReason && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '12px',
                    background: 'var(--bg-card-hover)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    marginTop: '8px',
                  }}>
                    <AlertCircle size={16} className={event.status === 'Cancelled' ? 'text-danger' : 'text-warning'} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {event.status === 'Cancelled' ? 'Dibatalkan' : 'Ditunda'}:
                      </strong> {event.cancellationReason}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
