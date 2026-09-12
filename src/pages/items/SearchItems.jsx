import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import itemService from '../../services/itemService';
import recyclingPointService from '../../services/recyclingPointService';
import MapView from '../../components/common/map/MapView';

const categoryConfig = [
  { id: '', name: 'Todas', icon: 'search', accent: '#888780' },
  { id: 'plastico', name: 'Plástico', icon: 'recycle', accent: '#1D9E75' },
  { id: 'papel', name: 'Papel', icon: 'file-text', accent: '#378ADD' },
  { id: 'vidrio', name: 'Vidrio', icon: 'glass', accent: '#7F77DD' },
  { id: 'metal', name: 'Metal', icon: 'tool', accent: '#888780' },
  { id: 'textil', name: 'Textil', icon: 'shirt', accent: '#D85A30' },
  { id: 'electronico', name: 'Electrónico', icon: 'device-laptop', accent: '#D4537E' }
];

const stateConfig = [
  { id: '', name: 'Cualquier estado', color: 'gray' },
  { id: 'sin_procesar', name: 'Sin procesar', color: 'gray' },
  { id: 'en_proceso', name: 'En proceso', color: 'amber' },
  { id: 'fardado', name: 'Fardado', color: 'blue' },
  { id: 'validado', name: 'Validado', color: 'green' }
];

const stateStyles = {
  gray:  { bg: 'var(--color-background-secondary)', text: 'var(--color-text-secondary)', dot: '#888780' },
  amber: { bg: '#FAEEDA', text: '#854F0B', dot: '#EF9F27' },
  blue:  { bg: '#E6F1FB', text: '#185FA5', dot: '#378ADD' },
  green: { bg: '#EAF3DE', text: '#3B6D11', dot: '#639922' }
};

const SearchItems = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ query: '', category: '', processingState: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [recyclingPoints, setRecyclingPoints] = useState([]);
  const [showRecyclingPoints, setShowRecyclingPoints] = useState(true);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const search = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.query) params.query = filters.query;
      if (filters.category) params.category = filters.category;
      if (filters.processingState) params.processingState = filters.processingState;

      const data = await itemService.getItems(params, forceRefresh);
      setItems(Array.isArray(data) ? data : (data?.items || []));
    } catch (error) {
      console.error(error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    let isCurrent = true;
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const data = await itemService.getItems();
        if (isCurrent) {
          setItems(Array.isArray(data) ? data : (data?.items || []));
        }
      } catch (_ERROR) {
        void _ERROR;
        if (isCurrent) setItems([]);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };
    fetchInitial();
    return () => { isCurrent = false; };
  }, []);

  const handleSearch = (e) => { 
    e.preventDefault(); 
    search(true); 
  };

  const getStateStyle = (stateId) => {
    const s = stateConfig.find(s => s.id === stateId);
    return stateStyles[s?.color || 'gray'];
  };

  const getCategoryConfig = (catId) => categoryConfig.find(c => c.id === catId) || categoryConfig[0];

  useEffect(() => {
    let isCurrent = true;
    recyclingPointService.getRecyclingPoints({ status: 'activo' })
      .then(data => {
        if (isCurrent && Array.isArray(data)) setRecyclingPoints(data);
      })
      .catch(() => {});
    return () => { isCurrent = false; };
  }, []);

  const categoryColors = {
    plastico: '#1D9E75',
    papel: '#378ADD',
    vidrio: '#7F77DD',
    metal: '#888780',
    textil: '#D85A30',
    electronico: '#D4537E',
    otro: '#16A085'
  };

  const itemMapMarkers = items
    .filter(it => {
      const lat = it.location?.coordinates ? it.location.coordinates[1] : it.location?.lat;
      const lng = it.location?.coordinates ? it.location.coordinates[0] : it.location?.lng;
      return lat && lng && !isNaN(lat) && !isNaN(lng);
    })
    .map(it => {
      const lat = it.location?.coordinates ? it.location.coordinates[1] : it.location?.lat;
      const lng = it.location?.coordinates ? it.location.coordinates[0] : it.location?.lng;
      const cat = getCategoryConfig(it.category);
      return {
        id: `item-${it._id}`,
        coordinates: [lng, lat],
        color: categoryColors[it.category] || '#16A085',
        title: it.title,
        badge: cat.name,
        description: it.address || 'Material reciclable',
        popupContent: `
          <div style="font-family: inherit; width: 220px; padding: 4px;">
            ${it.images && it.images[0] ? `<img src="${it.images[0]}" alt="${it.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
            <div style="display: flex; gap: 4px; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 12px; background: #e1f5ee; color: #0f6e56;">${cat.name}</span>
            </div>
            <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #111827; line-height: 1.3;">${it.title}</h4>
            <p style="margin: 0 0 8px; font-size: 11px; color: #6b7280; line-height: 1.3;">${it.address || 'Sin dirección específica'}</p>
            <a href="/items/${it._id}" style="display: block; text-align: center; font-size: 11px; font-weight: 600; padding: 6px 12px; background: #0f6e56; color: white; border-radius: 6px; text-decoration: none;">Ver publicación</a>
          </div>
        `
      };
    });

  const pointMapMarkers = showRecyclingPoints ? recyclingPoints
    .filter(pt => {
      const lat = pt.location?.coordinates ? pt.location.coordinates[1] : pt.location?.lat;
      const lng = pt.location?.coordinates ? pt.location.coordinates[0] : pt.location?.lng;
      return lat && lng && !isNaN(lat) && !isNaN(lng);
    })
    .map(pt => {
      const lat = pt.location?.coordinates ? pt.location.coordinates[1] : pt.location?.lat;
      const lng = pt.location?.coordinates ? pt.location.coordinates[0] : pt.location?.lng;
      return {
        id: `point-${pt._id}`,
        coordinates: [lng, lat],
        color: pt.pinColor || '#10B981',
        title: pt.name,
        badge: 'Punto Limpio / Acopio',
        description: pt.address,
        popupContent: `
          <div style="font-family: inherit; width: 220px; padding: 4px;">
            <div style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 12px; background: #ecfdf5; color: #047857; margin-bottom: 6px;">
              ♻️ Punto Limpio Oficial
            </div>
            <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #111827;">${pt.name}</h4>
            <p style="margin: 0 0 4px; font-size: 11px; color: #4b5563;"><strong>Dirección:</strong> ${pt.address}</p>
            ${pt.schedule ? `<p style="margin: 0 0 4px; font-size: 11px; color: #4b5563;"><strong>Horario:</strong> ${pt.schedule}</p>` : ''}
            ${pt.contactPhone ? `<p style="margin: 0 0 8px; font-size: 11px; color: #4b5563;"><strong>Tel:</strong> ${pt.contactPhone}</p>` : ''}
            <a href="https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${lat}%2C${lng}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; font-size: 11px; font-weight: 600; padding: 6px 12px; background: #047857; color: white; border-radius: 6px; text-decoration: none;">Cómo llegar</a>
          </div>
        `
      };
    }) : [];

  const combinedMarkers = [...itemMapMarkers, ...pointMapMarkers];

  return (
    <Layout>
      <style>{`
        .si-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 500; color: var(--color-text-secondary);
          background: none; border: none; cursor: pointer; padding: 0;
          transition: color 0.15s; margin-bottom: 24px;
        }
        .si-back-btn:hover { color: var(--color-text-primary); }
        .si-hero {
          background: #0F6E56; border-radius: 16px;
          padding: 40px 48px; margin-bottom: 32px; position: relative; overflow: hidden;
        }
        .si-hero::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: rgba(255,255,255,0.05); pointer-events: none;
        }
        .si-hero::after {
          content: ''; position: absolute; bottom: -80px; right: 80px;
          width: 160px; height: 160px; border-radius: 50%;
          background: rgba(255,255,255,0.04); pointer-events: none;
        }
        .si-hero-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: #9FE1CB; margin-bottom: 10px;
        }
        .si-hero h1 {
          font-size: 28px; font-weight: 600; color: #fff; margin: 0 0 8px;
          line-height: 1.2;
        }
        .si-hero p {
          font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; max-width: 480px;
        }
        .si-form-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: 16px; padding: 28px 32px; margin-bottom: 32px;
        }
        .si-fields { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 720px) { .si-fields { grid-template-columns: 1fr; } }
        .si-field label {
          display: block; font-size: 12px; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--color-text-secondary); margin-bottom: 8px;
        }
        .si-field input, .si-field select {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px; font-size: 14px;
          border: 1.5px solid #C4C4BC;
          border-radius: 8px; background: var(--color-background-primary);
          color: var(--color-text-primary); outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none; -webkit-appearance: none;
        }
        .si-field input::placeholder { color: var(--color-text-tertiary); }
        .si-field input:focus, .si-field select:focus {
          border-color: #1D9E75;
          box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
        }
        .si-search-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 24px; font-size: 14px; font-weight: 500;
          background: #0F6E56; color: #fff; border: none; border-radius: 8px;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
        }
        .si-search-btn:hover { background: #085041; }
        .si-search-btn:active { transform: scale(0.98); }
        .si-results-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .si-results-title {
          font-size: 18px; font-weight: 500; color: var(--color-text-primary);
          display: flex; align-items: center; gap: 10px;
        }
        .si-count-badge {
          font-size: 12px; font-weight: 500; padding: 3px 10px;
          background: #E1F5EE; color: #0F6E56; border-radius: 20px;
        }
        .si-spinner {
          width: 16px; height: 16px; border: 2px solid #1D9E75;
          border-top-color: transparent; border-radius: 50%;
          animation: spin 0.7s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .si-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
        }
        .si-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: 14px; overflow: hidden; cursor: pointer;
          transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
          display: flex; flex-direction: column;
        }
        .si-card:hover {
          border-color: #1D9E75;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15,110,86,0.08);
        }
        .si-card-img {
          height: 180px; overflow: hidden; position: relative; flex-shrink: 0;
          background: var(--color-background-secondary);
          display: flex; align-items: center; justify-content: center;
        }
        .si-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .si-card:hover .si-card-img img { transform: scale(1.05); }
        .si-photo-count {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(0,0,0,0.6); color: #fff;
          font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 20px;
        }
        .si-cat-icon-placeholder {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--color-background-tertiary);
          display: flex; align-items: center; justify-content: center;
        }
        .si-card-body { padding: 16px 18px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .si-card-title {
          font-size: 15px; font-weight: 500; color: var(--color-text-primary);
          line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          transition: color 0.15s;
        }
        .si-card:hover .si-card-title { color: #0F6E56; }
        .si-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .si-cat-tag {
          font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 20px;
          background: #E1F5EE; color: #0F6E56;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .si-state-tag {
          font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 20px;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .si-state-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .si-card-footer {
          display: flex; align-items: center; gap: 8px;
          padding-top: 10px; border-top: 0.5px solid var(--color-border-tertiary);
          margin-top: auto;
        }
        .si-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: #0F6E56; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; flex-shrink: 0;
        }
        .si-owner-name { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
        .si-empty {
          text-align: center; padding: 80px 24px;
          background: var(--color-background-secondary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: 16px;
        }
        .si-empty-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: var(--color-background-tertiary);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .si-empty h2 { font-size: 16px; font-weight: 500; color: var(--color-text-primary); margin: 0 0 6px; }
        .si-empty p { font-size: 14px; color: var(--color-text-secondary); margin: 0 0 20px; }
        .si-reset-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; font-size: 14px; font-weight: 500;
          border: 0.5px solid var(--color-border-secondary);
          background: var(--color-background-primary);
          color: var(--color-text-primary); border-radius: 8px;
          cursor: pointer; transition: background 0.15s;
        }
        .si-reset-btn:hover { background: var(--color-background-secondary); }
        .si-select-wrapper { position: relative; }
        .si-select-wrapper::after {
          content: ''; position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent; border-right: 4px solid transparent;
          border-top: 5px solid var(--color-text-secondary);
          pointer-events: none;
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>

        <div className="si-hero">
          <p className="si-hero-eyebrow">Marketplace de reciclables</p>
          <h1>Buscar Materiales</h1>
          <p>Encontrá materiales reciclables y servicios de procesamiento cerca tuyo</p>
        </div>

        <form onSubmit={handleSearch} className="si-form-card">
          <div className="si-fields">
            <div className="si-field">
              <label htmlFor="search-query">Palabra clave</label>
              <input
                id="search-query"
                type="text"
                name="query"
                placeholder="botellas, cartón..."
                aria-label="Buscar por palabra clave"
                value={filters.query}
                onChange={handleFilterChange}
              />
            </div>

            <div className="si-field">
              <label htmlFor="search-category">Categoría</label>
              <div className="si-select-wrapper">
                <select
                  id="search-category"
                  name="category"
                  aria-label="Filtrar por categoría"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  {categoryConfig.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="si-field">
              <label htmlFor="search-state">Estado</label>
              <div className="si-select-wrapper">
                <select
                  id="search-state"
                  name="processingState"
                  aria-label="Filtrar por estado de procesamiento"
                  value={filters.processingState}
                  onChange={handleFilterChange}
                >
                  {stateConfig.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="si-search-btn">
            <i className="ti ti-search" style={{ fontSize: 16 }} aria-hidden="true" />
            Buscar materiales
          </button>
        </form>

        <div>
          <div className="si-results-header">
            <div className="si-results-title">
              {loading ? (
                <>
                  <span className="si-spinner" />
                  Buscando…
                </>
              ) : (
                <>
                  Resultados
                  <span className="si-count-badge">{items.length}</span>
                </>
              )}
            </div>

            {/* Alternador de Vista: Cuadrícula vs Mapa Interactivo */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 13px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: viewMode === 'grid' ? '#0F6E56' : '#D1D5DB',
                  background: viewMode === 'grid' ? '#0F6E56' : '#FFFFFF',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#374151',
                  transition: 'all 0.15s'
                }}
              >
                <span>⊞</span> Cuadrícula
              </button>

              <button
                type="button"
                onClick={() => setViewMode('map')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 13px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: viewMode === 'map' ? '#0F6E56' : '#D1D5DB',
                  background: viewMode === 'map' ? '#0F6E56' : '#FFFFFF',
                  color: viewMode === 'map' ? '#FFFFFF' : '#374151',
                  transition: 'all 0.15s'
                }}
              >
                <span>🗺️</span> Mapa ({combinedMarkers.length})
              </button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '16px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                    {itemMapMarkers.length} materiales con ubicación en mapa
                  </span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#047857', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showRecyclingPoints}
                      onChange={(e) => setShowRecyclingPoints(e.target.checked)}
                      style={{ accentColor: '#0F6E56' }}
                    />
                    Mostrar {recyclingPoints.length} Puntos Limpios de Acopio
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#6B7280', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' }}></span> Plástico
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#378ADD' }}></span> Papel
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7F77DD' }}></span> Vidrio
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', border: '1px solid #047857' }}></span> Punto Limpio
                  </span>
                </div>
              </div>

              <MapView
                center={[-58.3816, -34.6037]}
                zoom={11}
                markers={combinedMarkers}
                fitBoundsMarkers={combinedMarkers.length > 1}
                height="540px"
                showControls={true}
                showStyleSelector={true}
              />
              <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#6B7280' }}>
                Tip: Hacé clic sobre cualquier marcador para ver la fotografía del material, datos de contacto o trazar la ruta de retiro.
              </p>
            </div>
          ) : (
            items.length === 0 && !loading ? (
              <div className="si-empty">
                <div className="si-empty-icon">
                  <i className="ti ti-search-off" style={{ fontSize: 28, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                </div>
                <h2>No se encontraron materiales</h2>
                <p>Ajustá los filtros o probá con otros términos</p>
                <button
                  className="si-reset-btn"
                  onClick={() => { setFilters({ query: '', category: '', processingState: '' }); search(); }}
                >
                  <i className="ti ti-refresh" style={{ fontSize: 15 }} aria-hidden="true" />
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="si-grid">
                {items.map(item => {
                  const stateStyle = getStateStyle(item.processingState);
                  const cat = getCategoryConfig(item.category);
                  const stateName = stateConfig.find(s => s.id === item.processingState)?.name || item.processingState;

                  return (
                    <div key={item._id} className="si-card" onClick={() => navigate(`/items/${item._id}`)}>
                      <div className="si-card-img">
                        {item.images && item.images.length > 0 ? (
                          <>
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                if (e.target.nextSibling && e.target.nextSibling.classList.contains('si-photo-count')) {
                                  e.target.nextSibling.style.display = 'none';
                                }
                                if (e.target.parentElement) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'si-cat-icon-placeholder';
                                  placeholder.innerHTML = `<i class="ti ti-${cat.icon}" style="font-size: 26px; color: ${cat.accent};" aria-hidden="true"></i>`;
                                  e.target.parentElement.appendChild(placeholder);
                                }
                              }}
                            />
                            {item.images.length > 1 && (
                              <span className="si-photo-count">+{item.images.length - 1}</span>
                            )}
                          </>
                        ) : (
                          <div className="si-cat-icon-placeholder">
                            <i className={`ti ti-${cat.icon}`} style={{ fontSize: 26, color: cat.accent }} aria-hidden="true" />
                          </div>
                        )}
                      </div>

                      <div className="si-card-body">
                        <h2 className="si-card-title">{item.title}</h2>

                        <div className="si-tags">
                          <span className="si-cat-tag">
                            <i className={`ti ti-${cat.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
                            {cat.name}
                          </span>
                        </div>

                        <div>
                          <span
                            className="si-state-tag"
                            style={{ background: stateStyle.bg, color: stateStyle.text }}
                          >
                            <span className="si-state-dot" style={{ background: stateStyle.dot }} />
                            {stateName}
                          </span>
                        </div>

                        <div className="si-card-footer">
                          <div className="si-avatar">
                            {(item.ownerId?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="si-owner-name">{item.ownerId?.name || 'Usuario'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchItems;