import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsApi } from '../../../api/axios';
import { useToast } from '../../../components/shared/Toast';
import { formatDate, getErrorMessage } from '../../../utils/helpers';
import { 
  Trophy, CheckCircle2, XCircle, PauseCircle, Plus, Edit, 
  Ban, RefreshCw, FileText, Download, Save, Info, AlertCircle,
  MapPin, ChevronRight, Calendar as CalendarIcon
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const REGION_MAP = {
  'jawa-barat': 'Jawa Barat',
  'jawa-tengah': 'Jawa Tengah',
  'jawa-timur': 'Jawa Timur',
  'banten': 'Banten',
  'jakarta': 'Jakarta',
};

export default function RegionEventManagement() {
  const { regionId } = useParams();
  const regionName = REGION_MAP[regionId] || regionId;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    eventStartDate: null,
    eventEndDate: null,
    location: '',
  });

  // Cancel/Postpone modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelForm, setCancelForm] = useState({ type: 'Cancelled', reason: '' });
  const [cancelLoading, setCancelLoading] = useState(false);

  // Modal Reschedule State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ eventStartDate: null, eventEndDate: null });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, [regionId]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data } = await eventsApi.getAll();
      // Filter events by region/location
      const filtered = data.filter(
        (e) => e.location && e.location.toLowerCase().includes(regionName.toLowerCase())
      );
      setEvents(filtered);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', eventStartDate: null, eventEndDate: null, location: '' });
    setEditingEvent(null);
  };

  const openCreateModal = () => {
    resetForm();
    // Pre-fill the location with region name
    setForm((prev) => ({ ...prev, location: regionName }));
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setForm({
      name: event.name,
      description: event.description,
      eventStartDate: event.eventStartDate ? new Date(event.eventStartDate) : null,
      eventEndDate: event.eventEndDate ? new Date(event.eventEndDate) : null,
      location: event.location,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.eventStartDate || !form.eventEndDate) {
      toast.warning('Harap isi semua field yang wajib.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        ...form,
        eventStartDate: form.eventStartDate ? form.eventStartDate.toISOString() : null,
        eventEndDate: form.eventEndDate ? form.eventEndDate.toISOString() : null,
      };

      if (editingEvent) {
        await eventsApi.update(editingEvent.id, payload);
        toast.success('Lomba berhasil diperbarui!');
      } else {
        await eventsApi.create(payload);
        toast.success('Lomba berhasil ditambahkan!');
      }

      setShowModal(false);
      resetForm();
      loadEvents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  // Open cancel/postpone modal
  const openCancelModal = (event) => {
    setCancelTarget(event);
    setCancelForm({ type: 'Cancelled', reason: '' });
    setShowCancelModal(true);
  };

  // Submit cancel/postpone
  const handleCancelSubmit = async () => {
    if (!cancelForm.reason.trim()) {
      toast.warning('Alasan wajib diisi.');
      return;
    }

    setCancelLoading(true);
    try {
      await eventsApi.cancelEvent(cancelTarget.id, cancelForm);
      const label = cancelForm.type === 'Cancelled' ? 'dibatalkan' : 'ditunda';
      toast.success(`Lomba "${cancelTarget.name}" berhasil ${label}.`);
      setShowCancelModal(false);
      setCancelTarget(null);
      loadEvents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (event) => {
    setRescheduleTarget(event);
    setRescheduleForm({
      eventStartDate: event.eventStartDate ? new Date(event.eventStartDate) : null,
      eventEndDate: event.eventEndDate ? new Date(event.eventEndDate) : null
    });
    setShowRescheduleModal(true);
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async () => {
    if (!rescheduleForm.eventStartDate || !rescheduleForm.eventEndDate) {
      toast.warning('Tanggal mulai dan selesai wajib diisi.');
      return;
    }

    setRescheduleLoading(true);
    try {
      const payload = {
        eventStartDate: rescheduleForm.eventStartDate.toISOString(),
        eventEndDate: rescheduleForm.eventEndDate.toISOString()
      };
      await eventsApi.reschedule(rescheduleTarget.id, payload);
      toast.success(`Lomba "${rescheduleTarget.name}" berhasil dijadwalkan ulang.`);
      setShowRescheduleModal(false);
      setRescheduleTarget(null);
      loadEvents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Download cancellation letter
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

  // Download reschedule letter
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <CheckCircle2 size={14} />;
      case 'Closed': return <XCircle size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      case 'Postponed': return <PauseCircle size={14} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Memuat data lomba...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <div className="breadcrumb animate-fade-in">
        <Link to="/admin/nasional/events">Kelola Lomba</Link>
        <span className="breadcrumb-sep"><ChevronRight size={14} /></span>
        <span>{regionName}</span>
      </div>

      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin size={32} className="text-primary" />
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Lomba — {regionName}</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Kelola perlombaan di daerah {regionName}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Tambah Lomba
        </button>
      </div>

      {events.length === 0 ? (
        <div className="glass-card empty-state animate-fade-in-up">
          <div className="empty-state-icon"><Trophy size={48} className="text-muted" /></div>
          <div className="empty-state-title">Belum ada lomba di {regionName}</div>
          <div className="empty-state-text">Klik tombol "Tambah Lomba" untuk membuat perlombaan baru di daerah ini.</div>
        </div>
      ) : (
        <div className="glass-card table-container animate-fade-in-up">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Lomba</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Batas Daftar (H-7)</th>
                <th>Lokasi</th>
                <th>Pendaftar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {event.name}
                  </td>
                  <td>{formatDate(event.eventStartDate)}</td>
                  <td>{formatDate(event.eventEndDate)}</td>
                  <td>{formatDate(event.registrationDeadline)}</td>
                  <td>{event.location || '-'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                    {event.totalRegistrations}
                  </td>
                  <td>
                    <span className={`badge badge-${event.status.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {getStatusIcon(event.status)} {event.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(event.status === 'Open' || event.status === 'Closed') && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(event)}
                            title="Edit Lomba"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => openCancelModal(event)}
                            title="Batalkan/Tunda Lomba"
                          >
                            <Ban size={14} />
                          </button>
                        </>
                      )}
                      {event.status === 'Postponed' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openRescheduleModal(event)}
                          title="Reschedule Lomba"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                      {event.hasCancellationLetter && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDownloadLetter(event.id, event.status)}
                          title="Download surat pembatalan/penundaan"
                        >
                          <FileText size={14} />
                        </button>
                      )}
                      {event.hasRescheduleLetter && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDownloadRescheduleLetter(event.id)}
                          title="Download surat penjadwalan ulang"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingEvent ? <><Edit size={24} /> Edit Lomba</> : <><Plus size={24} /> Tambah Lomba — {regionName}</>}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="region-event-name">Nama Lomba *</label>
                <input
                  id="region-event-name"
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="Contoh: OSN Matematika"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="region-event-desc">Deskripsi</label>
                <textarea
                  id="region-event-desc"
                  className="form-input"
                  name="description"
                  placeholder="Deskripsi lomba..."
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="region-event-start">Tanggal Mulai *</label>
                  <div className="date-picker-wrapper">
                    <DatePicker
                      id="region-event-start"
                      selected={form.eventStartDate}
                      onChange={(date) => setForm({ ...form, eventStartDate: date })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="Pilih Tanggal & Waktu"
                      className="form-input"
                      wrapperClassName="w-100"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="region-event-end">Tanggal Selesai *</label>
                  <div className="date-picker-wrapper">
                    <DatePicker
                      id="region-event-end"
                      selected={form.eventEndDate}
                      onChange={(date) => setForm({ ...form, eventEndDate: date })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="Pilih Tanggal & Waktu"
                      className="form-input"
                      wrapperClassName="w-100"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="region-event-location">Lokasi</label>
                <input
                  id="region-event-location"
                  className="form-input"
                  type="text"
                  name="location"
                  placeholder={`Lokasi di ${regionName}`}
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Menyimpan...' : editingEvent ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel/Postpone Modal */}
      {showCancelModal && cancelTarget && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ban size={24} /> Batalkan / Tunda Lomba
              </h2>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>
                ✕
              </button>
            </div>

            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              border: '1px solid var(--border-primary)',
            }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Lomba yang akan diproses:</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} className="text-primary" /> {cancelTarget.name}
              </div>
            </div>

            {/* Type Selection */}
            <div className="form-group">
              <label className="form-label">Tipe Aksi *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCancelForm({ ...cancelForm, type: 'Cancelled' })}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${cancelForm.type === 'Cancelled' ? 'var(--status-error)' : 'var(--border-primary)'}`,
                    background: cancelForm.type === 'Cancelled' ? 'var(--status-error-bg)' : 'var(--bg-input)',
                    color: cancelForm.type === 'Cancelled' ? 'var(--status-error)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}><XCircle size={24} /></div>
                  Cancel Lomba
                  <div style={{ fontSize: '11px', fontWeight: 400, marginTop: '4px', opacity: 0.8 }}>
                    Lomba dibatalkan sepenuhnya
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCancelForm({ ...cancelForm, type: 'Postponed' })}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${cancelForm.type === 'Postponed' ? 'var(--status-warning)' : 'var(--border-primary)'}`,
                    background: cancelForm.type === 'Postponed' ? 'var(--status-warning-bg)' : 'var(--bg-input)',
                    color: cancelForm.type === 'Postponed' ? 'var(--status-warning)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}><PauseCircle size={24} /></div>
                  Postpone Lomba
                  <div style={{ fontSize: '11px', fontWeight: 400, marginTop: '4px', opacity: 0.8 }}>
                    Lomba ditunda sementara
                  </div>
                </button>
              </div>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label className="form-label" htmlFor="region-cancel-reason">
                Alasan {cancelForm.type === 'Cancelled' ? 'Pembatalan' : 'Penundaan'} *
              </label>
              <textarea
                id="region-cancel-reason"
                className="form-input"
                placeholder={`Jelaskan alasan ${cancelForm.type === 'Cancelled' ? 'pembatalan' : 'penundaan'} lomba ini...`}
                rows={4}
                value={cancelForm.reason}
                onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Info notice */}
            <div style={{
              padding: '10px 14px',
              background: 'var(--status-pending-bg)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--status-pending)',
              border: '1px solid rgba(129, 140, 248, 0.15)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileText size={16} /> Surat pernyataan resmi akan otomatis diterbitkan dan dapat diunduh oleh seluruh peserta.
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className={`btn ${cancelForm.type === 'Cancelled' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleCancelSubmit}
                disabled={cancelLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {cancelLoading
                  ? 'Memproses...'
                  : cancelForm.type === 'Cancelled'
                    ? <><XCircle size={16} /> Konfirmasi Pembatalan</>
                    : <><PauseCircle size={16} /> Konfirmasi Penundaan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reschedule */}
      {showRescheduleModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-fade-in-up" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw size={24} /> Penjadwalan Ulang Lomba</h3>
              <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Lomba Terpilih:</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={18} className="text-primary" /> {rescheduleTarget?.name}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Jadwal Mulai Baru *</label>
                  <div className="date-picker-wrapper">
                    <DatePicker
                      selected={rescheduleForm.eventStartDate}
                      onChange={(date) => setRescheduleForm({ ...rescheduleForm, eventStartDate: date })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="Pilih Tanggal & Waktu"
                      className="form-input"
                      wrapperClassName="w-100"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Jadwal Selesai Baru *</label>
                  <div className="date-picker-wrapper">
                    <DatePicker
                      selected={rescheduleForm.eventEndDate}
                      onChange={(date) => setRescheduleForm({ ...rescheduleForm, eventEndDate: date })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="Pilih Tanggal & Waktu"
                      className="form-input"
                      wrapperClassName="w-100"
                    />
                  </div>
                </div>
              </div>

              <div style={{
                padding: '10px 14px',
                background: 'var(--status-pending-bg)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--status-pending)',
                border: '1px solid rgba(129, 140, 248, 0.15)',
                marginBottom: '8px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>Semua peserta yang telah mendaftar akan menerima notifikasi otomatis terkait perubahan jadwal ini, dan surat penjadwalan ulang akan dibuat.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRescheduleModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRescheduleSubmit}
                disabled={rescheduleLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {rescheduleLoading ? 'Menyimpan...' : <><Save size={16} /> Simpan Jadwal</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
