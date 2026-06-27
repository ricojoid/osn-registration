import { useState, useEffect } from 'react';
import { registrationsApi } from '../../api/axios';
import { useToast } from '../../components/shared/Toast';
import { formatDate, formatDateTime, getErrorMessage } from '../../utils/helpers';
import { DOCUMENT_LABELS } from '../../utils/constants';
import { 
  FileText, Inbox, Trophy, Clock, CheckCircle2, 
  XCircle, ChevronUp, Paperclip, File, Download 
} from 'lucide-react';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReg, setExpandedReg] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      const { data } = await registrationsApi.getMy();
      setRegistrations(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLetter = async (regId) => {
    try {
      const { data } = await registrationsApi.downloadLetter(regId);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Surat_Verifikasi.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Gagal mengunduh surat verifikasi.');
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Memuat data pendaftaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={32} className="text-primary" />
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Pendaftaran Saya</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Riwayat dan status pendaftaran lomba Anda</p>
          </div>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="glass-card empty-state animate-fade-in-up">
          <div className="empty-state-icon"><Inbox size={48} className="text-muted" /></div>
          <div className="empty-state-title">Belum ada pendaftaran</div>
          <div className="empty-state-text">
            Anda belum mendaftar pada lomba manapun. Kunjungi halaman "Daftar Lomba" untuk melihat lomba yang tersedia.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {registrations.map((reg, idx) => (
            <div
              key={reg.id}
              className="glass-card animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.05}s`, overflow: 'hidden' }}
            >
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Trophy size={18} className="text-primary" /> {reg.eventName}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Didaftarkan pada {formatDateTime(reg.registeredAt)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge badge-${reg.status.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {reg.status === 'Pending' && <Clock size={14} />}
                      {reg.status === 'Verified' && <CheckCircle2 size={14} />}
                      {reg.status === 'Rejected' && <XCircle size={14} />}
                      <span>{reg.status}</span>
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => setExpandedReg(expandedReg === reg.id ? null : reg.id)}
                    >
                      {expandedReg === reg.id ? <><ChevronUp size={14} /> Tutup</> : <><Paperclip size={14} /> Lihat Dokumen</>}
                    </button>
                  </div>
                </div>

                {/* Status Message */}
                {reg.status === 'Pending' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'var(--status-pending-bg)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--status-pending)',
                    border: '1px solid rgba(129, 140, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock size={16} style={{ flexShrink: 0 }} /> Berkas Anda sedang menunggu verifikasi oleh admin.
                  </div>
                )}
                {reg.status === 'Verified' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'var(--status-success-bg)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--status-success)',
                    border: '1px solid rgba(52, 211, 153, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> Pendaftaran Anda telah diverifikasi! Selamat bergabung.</span>
                    {reg.hasVerificationLetter && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleDownloadLetter(reg.id)}
                        style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <FileText size={14} /> Download Surat Verifikasi
                      </button>
                    )}
                  </div>
                )}
                {reg.status === 'Rejected' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'var(--status-error-bg)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--status-error)',
                    border: '1px solid rgba(251, 113, 133, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <XCircle size={16} style={{ flexShrink: 0 }} /> Pendaftaran Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.
                  </div>
                )}
              </div>

              {/* Expanded Documents */}
              {expandedReg === reg.id && reg.documents && (
                <div style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-primary)',
                  background: 'var(--bg-glass)',
                }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Dokumen yang diunggah
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                    {reg.documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          background: 'var(--bg-input)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-primary)',
                        }}
                      >
                        <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><File size={20} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {DOCUMENT_LABELS[doc.documentType] || doc.documentType}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {doc.fileName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
