import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi, registrationsApi } from '../../api/axios';
import { useToast } from '../../components/shared/Toast';
import { formatDate, isRegistrationOpen, isValidPdf, formatFileSize, getErrorMessage } from '../../utils/helpers';
import { DOCUMENT_LABELS } from '../../utils/constants';
import { 
  IdCard, Users, Activity, FileText, Trophy, 
  Calendar, MapPin, Clock, Ban, File, Upload, Send 
} from 'lucide-react';

export default function RegistrationForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState({
    kartuPelajar: null,
    kartuKeluarga: null,
    suratKeteranganSehat: null,
  });

  const documentFields = [
    { key: 'kartuPelajar', label: DOCUMENT_LABELS.KartuPelajar, icon: <IdCard size={18} /> },
    { key: 'kartuKeluarga', label: DOCUMENT_LABELS.KartuKeluarga, icon: <Users size={18} /> },
    { key: 'suratKeteranganSehat', label: DOCUMENT_LABELS.SuratKeteranganSehat, icon: <Activity size={18} /> },
  ];

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const { data } = await eventsApi.getById(eventId);
      setEvent(data);
    } catch (err) {
      toast.error('Event tidak ditemukan.');
      navigate('/pendaftar/events');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (key, file) => {
    if (file && !isValidPdf(file)) {
      toast.error(`File ${DOCUMENT_LABELS[key] || key} harus berformat PDF (.pdf).`);
      return;
    }
    setFiles({ ...files, [key]: file });
  };

  const handleRemoveFile = (key) => {
    setFiles({ ...files, [key]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all files
    for (const field of documentFields) {
      if (!files[field.key]) {
        toast.error(`Dokumen ${field.label} wajib diunggah.`);
        return;
      }
      if (!isValidPdf(files[field.key])) {
        toast.error(`File ${field.label} harus berformat PDF (.pdf).`);
        return;
      }
    }

    // Check deadline
    if (!isRegistrationOpen(event.eventStartDate)) {
      toast.error('Pendaftaran sudah ditutup (kurang dari H-7 sebelum lomba).');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('eventId', eventId);
      formData.append('kartuPelajar', files.kartuPelajar);
      formData.append('kartuKeluarga', files.kartuKeluarga);
      formData.append('suratKeteranganSehat', files.suratKeteranganSehat);

      await registrationsApi.create(formData);
      toast.success('Pendaftaran berhasil! Menunggu verifikasi admin.');
      navigate('/pendaftar/my-registrations');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
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

  if (!event) return null;

  const canRegister = isRegistrationOpen(event.eventStartDate) && event.status === 'Open';

  return (
    <div className="page-content">
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={32} className="text-primary" />
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Pendaftaran Lomba</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Lengkapi formulir pendaftaran untuk bergabung</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/pendaftar/events')}>
          ← Kembali
        </button>
      </div>

      {/* Event Info Card */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={24} className="text-primary" /> {event.name}
        </h2>
        {event.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px', lineHeight: 1.6 }}>
            {event.description}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              <Calendar size={14} /> Tanggal Mulai
            </div>
            <div style={{ fontWeight: 600 }}>{formatDate(event.eventStartDate)}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              <Calendar size={14} /> Tanggal Selesai
            </div>
            <div style={{ fontWeight: 600 }}>{formatDate(event.eventEndDate)}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              <MapPin size={14} /> Lokasi
            </div>
            <div style={{ fontWeight: 600 }}>{event.location || '-'}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              <Clock size={14} /> Batas Pendaftaran
            </div>
            <div style={{ fontWeight: 600, color: canRegister ? 'var(--status-success)' : 'var(--status-error)' }}>
              {formatDate(event.registrationDeadline)}
            </div>
          </div>
        </div>
      </div>

      {!canRegister ? (
        <div className="glass-card animate-fade-in-up" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Ban size={48} className="text-danger" />
          </div>
          <h3 style={{ marginBottom: '8px', color: 'var(--status-error)' }}>
            Pendaftaran Ditutup
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
            Pendaftaran untuk lomba ini sudah ditutup karena kurang dari 7 hari sebelum lomba dimulai.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Upload Section */}
          <div className="glass-card animate-fade-in-up" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <File size={18} className="text-primary" /> Unggah Dokumen Persyaratan
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Semua dokumen wajib dalam format PDF (.pdf)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {documentFields.map((field) => (
                <div key={field.key}>
                  <label className="form-label">
                    {field.icon} {field.label} *
                  </label>
                  {files[field.key] ? (
                    <div className="file-upload-preview">
                      <span className="file-upload-preview-icon" style={{ display: 'flex', alignItems: 'center' }}><File size={20} /></span>
                      <span className="file-upload-preview-name">
                        {files[field.key].name}
                        <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                          ({formatFileSize(files[field.key].size)})
                        </span>
                      </span>
                      <button
                        type="button"
                        className="file-upload-preview-remove"
                        onClick={() => handleRemoveFile(field.key)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="file-upload-zone">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => handleFileChange(field.key, e.target.files[0])}
                        id={`upload-${field.key}`}
                      />
                      <div className="file-upload-icon" style={{ display: 'flex', justifyContent: 'center' }}><Upload size={32} /></div>
                      <div className="file-upload-text">
                        Klik atau seret file PDF di sini
                      </div>
                      <div className="file-upload-hint">Hanya file PDF yang diterima</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/pendaftar/events')}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  Mendaftar...
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Daftar Lomba
                </div>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
