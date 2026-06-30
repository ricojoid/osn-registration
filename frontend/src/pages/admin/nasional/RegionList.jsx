import { useNavigate } from 'react-router-dom';
import { Trophy, MapPin, ChevronRight } from 'lucide-react';

const REGIONS = [
  { id: 'jawa-barat', name: 'Jawa Barat', capital: 'Bandung' },
  { id: 'jawa-tengah', name: 'Jawa Tengah', capital: 'Semarang' },
  { id: 'jawa-timur', name: 'Jawa Timur', capital: 'Surabaya' },
  { id: 'banten', name: 'Banten', capital: 'Serang' },
  { id: 'jakarta', name: 'Jakarta', capital: 'DKI Jakarta' },
];

export default function RegionList() {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={32} className="text-primary" />
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Kelola Lomba</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Pilih daerah untuk mengelola perlombaan</p>
          </div>
        </div>
      </div>

      <div className="region-grid">
        {REGIONS.map((region, index) => (
          <div
            key={region.id}
            className={`region-card animate-fade-in-up stagger-${index + 1}`}
            id={`region-${region.id}`}
            onClick={() => navigate(`/admin/nasional/events/${region.id}`)}
          >
            <div className="region-card-icon">
              <MapPin size={24} />
            </div>
            <div className="region-card-info">
              <div className="region-card-name">{region.name}</div>
              <div className="region-card-subtitle">Ibukota: {region.capital}</div>
            </div>
            <div className="region-card-arrow">
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
