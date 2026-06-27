import { useState, useEffect } from 'react';
import { eventsApi, registrationsApi, documentsApi } from '../../api/axios';
import { useToast } from '../../components/shared/Toast';
import { formatDate, formatDateTime, getErrorMessage } from '../../utils/helpers';
import { DOCUMENT_LABELS } from '../../utils/constants';
import { 
  ClipboardList, Inbox, Clock, CheckCircle2, XCircle, 
  ChevronUp, Paperclip, Check, Ban, File, Download 
} from 'lucide-react';

export default function VerificationPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regsLoading, setRegsLoading] = useState(false);
  const [expandedReg, setExpandedReg] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data } = await eventsApi.getAll();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0].id);
        loadRegistrations(data[0].id);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async (eventId) => {
    setRegsLoading(true);
    try {
      const { data } = await registrationsApi.getByEvent(eventId);
      setRegistrations(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRegsLoading(false);
    }
  };

  const handleEventChange = (e) => {
    const eventId = parseInt(e.target.value);
    setSelectedEvent(eventId);
    setExpandedReg(null);
    loadRegistrations(eventId);
  };

  const handleVerify = async (regId, status) => {
    try {
      await registrationsApi.verify(regId, { status });
      toast.success(`Pendaftaran berhasil di-${status === 'Verified' ? 'verifikasi' : 'tolak'}.`);
      loadRegistrations(selectedEvent);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const { data } = await documentsApi.download(docId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Gagal mengunduh file.');
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ClipboardList size={32} className="text-primary" />
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Verifikasi Berkas</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Tinjau dan verifikasi berkas pendaftar</p>
          </div>
        </div>
      </div>

      {/* Event Selector */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '20px', marginBottom: '24px' }}>
        <label className="form-label" htmlFor="verify-event-select">Pilih Lomba</label>
        <select
          id="verify-event-select"
          className="form-select"
          value={selectedEvent || ''}
          onChange={handleEventChange}
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name} — {formatDate(event.eventStartDate)}
            </option>
          ))}
        </select>
      </div>

      {/* Registrations Table */}
      {regsLoading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Memuat pendaftaran...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="glass-card empty-state animate-fade-in-up">
          <div className="empty-state-icon"><Inbox size={48} className="text-muted" /></div>
          <div className="empty-state-title">Belum ada pendaftar</div>
          <div className="empty-state-text">Belum ada peserta yang mendaftar pada lomba ini.</div>
        </div>
      ) : (
        <div className="glass-card animate-fade-in-up" style={{ overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Pendaftar</th>
                  <th>Email</th>
                  <th>Tanggal Daftar</th>
                  <th>Status</th>
                  <th>Berkas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, idx) => (
                  <tr key={reg.id}>
                    <td>{idx + 1}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {reg.userFullName}
                    </td>
                    <td>{reg.userEmail}</td>
                    <td>{formatDateTime(reg.registeredAt)}</td>
                    <td>
                      <span className={`badge badge-${reg.status.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {reg.status === 'Pending' && <Clock size={14} />}
                        {reg.status === 'Verified' && <CheckCircle2 size={14} />}
                        {reg.status === 'Rejected' && <XCircle size={14} />}
                        <span>{reg.status}</span>
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() =>
                          setExpandedReg(expandedReg === reg.id ? null : reg.id)
                        }
                      >
                        {expandedReg === reg.id ? <><ChevronUp size={14} /> Tutup</> : <><Paperclip size={14} /> {reg.documents?.length || 0} File</>}
                      </button>
                    </td>
                    <td>
                      {reg.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleVerify(reg.id, 'Verified')}
                          >
                            <Check size={14} /> Verify
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleVerify(reg.id, 'Rejected')}
                          >
                            <Ban size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Document View */}
          {expandedReg && (
            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-primary)',
                background: 'var(--bg-glass)',
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <File size={16} /> Dokumen Pendaftar
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {registrations
                  .find((r) => r.id === expandedReg)
                  ?.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      <span style={{ fontSize: '24px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><File size={24} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {DOCUMENT_LABELS[doc.documentType] || doc.documentType}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {doc.fileName}
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleDownload(doc.id, doc.fileName)}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
