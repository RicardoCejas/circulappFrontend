import {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback
} from 'react';

import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import API from '../../services/Api';
import itemService from '../../services/itemService';
import MapView from '../../components/common/map/MapView';

const categories = [
  { id: 'plastico',    name: 'Plástico',       icon: 'recycle' },
  { id: 'papel',       name: 'Papel y Cartón',  icon: 'file-text' },
  { id: 'vidrio',      name: 'Vidrio',          icon: 'glass' },
  { id: 'metal',       name: 'Metal',           icon: 'tool' },
  { id: 'textil',      name: 'Textil',          icon: 'shirt' },
  { id: 'electronico', name: 'Electrónico',     icon: 'device-laptop' },
  { id: 'otro',        name: 'Otro',            icon: 'box' }
];

const PublishItem = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', category: 'plastico',
    address: '', lat: null, lng: null
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados para modal amigable de teléfono requerido
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneModalError, setPhoneModalError] = useState('');

  useEffect(() => {
    if (user && !user.phone) {
      setShowPhoneModal(true);
    }
  }, [user]);

  const handleSavePhone = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      return setPhoneModalError('Por favor ingresa tu número de contacto.');
    }
    setSavingPhone(true);
    setPhoneModalError('');
    try {
      const res = await API.put('/users/profile', {
        name: user.name,
        email: user.email,
        phone: phoneInput.trim(),
        location: user.location || '',
        bio: user.bio || ''
      });
      updateUser(res.data);
      setShowPhoneModal(false);
    } catch (err) {
      setPhoneModalError(err.response?.data?.msg || 'Error al guardar el teléfono. Intenta nuevamente.');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const [mapCenter, setMapCenter] = useState([-58.3816, -34.6037]);
  const [mapZoom, setMapZoom] = useState(13);

  // Limpieza de ObjectURLs al desmontar o cambiar fotos
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        try { URL.revokeObjectURL(url); } catch (_ERROR) { void _ERROR; }
      });
    };
  }, [previewUrls]);

  const geocodeAddress = useCallback(async (address) => {
    try {
      const res = await API.get('/location/geocode', { params: { address } });
      if (res.data && res.data.lat && res.data.lng) {
        return {
          lat: parseFloat(res.data.lat),
          lng: parseFloat(res.data.lng),
          formattedAddress: res.data.formattedAddress || address
        };
      }
      return null;
    } catch (_ERROR) {
      void _ERROR;
      // Fallback secundario seguro
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          return { lat: parseFloat(lat), lng: parseFloat(lon), formattedAddress: display_name };
        }
      } catch (_E) { void _E; }
      return null;
    }
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await API.get('/location/reverse-geocode', { params: { lat, lng } });
      if (res.data && res.data.formattedAddress) {
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          formattedAddress: res.data.formattedAddress
        };
      }
      return null;
    } catch (_ERROR) {
      void _ERROR;
      // Fallback secundario seguro
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`);
        const data = await res.json();
        if (data && data.display_name) return { lat: parseFloat(lat), lng: parseFloat(lng), formattedAddress: data.display_name };
      } catch (_E) { void _E; }
      return null;
    }
  }, []);

  const handleAddressChange = (e) => {
    const address = e.target.value;
    setFormData(prev => ({ ...prev, address }));
    if (error && error.includes('dirección')) setError('');
  };

  const handleSearchAddress = async () => {
    if (!formData.address || formData.address.trim().length < 3) {
      return setError('Por favor ingresa una dirección para buscar en el mapa.');
    }
    setIsGeocoding(true);
    setError('');
    const result = await geocodeAddress(formData.address);
    if (result) {
      setFormData(prev => ({ 
        ...prev, 
        lat: result.lat, 
        lng: result.lng, 
        address: result.formattedAddress 
      }));
      setMapCenter([result.lng, result.lat]);
      setMapZoom(16);
    } else {
      setError('No se pudieron obtener coordenadas válidas para esta dirección. Intenta agregar ciudad o provincia.');
    }
    setIsGeocoding(false);
  };

  const getLocation = async () => {
    if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización.'); return; }
    setError('');
    setIsGeocoding(true);
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
      );
      const { latitude, longitude } = position.coords;
      const result = await reverseGeocode(latitude, longitude);
      const resolvedAddress = result?.formattedAddress || `Ubicación GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setFormData(prev => ({ ...prev, lat: latitude, lng: longitude, address: resolvedAddress }));
      setMapCenter([longitude, latitude]);
      setMapZoom(17);
    } catch (err) {
      setError(err.code === 1 ? 'Permiso de ubicación GPS denegado.' : 'No se pudo obtener tu ubicación GPS.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapPinSelect = useCallback(async (coords) => {
    setIsGeocoding(true);
    setError('');
    setFormData(prev => ({
      ...prev,
      lat: coords.lat,
      lng: coords.lng
    }));
    setMapCenter([coords.lng, coords.lat]);
    const rev = await reverseGeocode(coords.lat, coords.lng);
    const newAddress = rev?.formattedAddress || `Ubicación: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    setFormData(prev => ({
      ...prev,
      address: newAddress
    }));
    setIsGeocoding(false);
  }, [reverseGeocode]);

  const handleImageChange = (e) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (selectedFiles.length + images.length > 5) {
      setError('Máximo 5 imágenes permitidas en total.');
      return;
    }

    const validFiles = [];
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(`El archivo "${file.name}" no es una imagen válida. Solo se admiten JPG, PNG y WEBP.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setError(`La imagen "${file.name}" supera el tamaño máximo permitido de 5 MB.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setError('');
      setImages(prev => [...prev, ...validFiles]);
      setPreviewUrls(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeImage = (index) => {
    if (previewUrls[index]) {
      try { URL.revokeObjectURL(previewUrls[index]); } catch (_ERROR) { void _ERROR; }
    }
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setError('El título es obligatorio.');
    if (!user.phone) { alert('Debes completar tu número de teléfono en el perfil para publicar.'); navigate('/profile'); return; }

    let finalLat = formData.lat;
    let finalLng = formData.lng;
    let finalAddress = formData.address;

    // Si el usuario escribió una dirección pero no apretó buscar, intentar geocodificarla automáticamente
    if ((!finalLat || !finalLng) && formData.address?.trim()) {
      setIsGeocoding(true);
      const geocoded = await geocodeAddress(formData.address);
      setIsGeocoding(false);
      if (geocoded) {
        finalLat = geocoded.lat;
        finalLng = geocoded.lng;
        finalAddress = geocoded.formattedAddress;
        setFormData(prev => ({ ...prev, lat: finalLat, lng: finalLng, address: finalAddress }));
      } else {
        return setError('No se pudo validar la ubicación técnica de la dirección ingresada. Por favor utiliza el botón "Buscar Mapa" o "GPS".');
      }
    }

    if (!finalLat || !finalLng) {
      return setError('Debes validar la ubicación técnica mediante el botón "Buscar Mapa" o "GPS".');
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('category', formData.category);
    fd.append('address', finalAddress);
    fd.append('lat', finalLat);
    fd.append('lng', finalLng);
    images.forEach(file => fd.append('images', file));

    try {
      await itemService.createItem(fd);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al publicar: ' + (err.response?.data?.msg || 'Inténtalo más tarde.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <style>{`
        .pi-wrap { max-width: 680px; margin: 0 auto; padding: 0 16px; }

        .pi-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 500; color: var(--color-text-secondary);
          background: none; border: none; cursor: pointer; padding: 0;
          transition: color 0.15s; margin-bottom: 14px;
        }
        .pi-back-btn:hover { color: var(--color-text-primary); }

        .pi-hero {
          background: #0F6E56; border-radius: 16px;
          padding: 24px 32px; margin-bottom: 12px; position: relative; overflow: hidden;
        }
        .pi-hero::before {
          content: ''; position: absolute; top: -50px; right: -50px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.05); pointer-events: none;
        }
        .pi-hero-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: #9FE1CB; margin-bottom: 10px;
        }
        .pi-hero h1 { font-size: 26px; font-weight: 600; color: #fff; margin: 0 0 6px; line-height: 1.2; }
        .pi-hero p { font-size: 14px; color: rgba(255,255,255,0.65); margin: 0; }

        .pi-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: 16px; padding: 24px 28px; margin-bottom: 10px;
        }

        .pi-section-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--color-text-tertiary);
          margin-bottom: 14px; padding-bottom: 10px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }

        .pi-field { margin-bottom: 14px; }
        .pi-field:last-child { margin-bottom: 0; }

        .pi-label {
          display: block; font-size: 13px; font-weight: 500;
          color: var(--color-text-primary); margin-bottom: 7px;
        }
        .pi-label span {
          color: #1D9E75; margin-left: 2px;
        }
        .pi-hint {
          font-size: 12px; color: var(--color-text-tertiary);
          margin-top: 5px;
        }

        .pi-input, .pi-select, .pi-textarea {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px; font-size: 14px;
          border: 1.5px solid #C4C4BC;
          border-radius: 8px;
          background: var(--color-background-primary);
          color: var(--color-text-primary); outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .pi-input::placeholder, .pi-textarea::placeholder {
          color: #9CA3AF;
          opacity: 0.85;
        }
        .pi-input:focus, .pi-select:focus, .pi-textarea:focus {
          border-color: #1D9E75;
          box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
        }
        .pi-textarea { resize: vertical; min-height: 90px; line-height: 1.5; }

        .pi-select-wrap { position: relative; }
        .pi-select-wrap::after {
          content: ''; position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent; border-right: 4px solid transparent;
          border-top: 5px solid var(--color-text-secondary);
          pointer-events: none;
        }
        .pi-select { appearance: none; -webkit-appearance: none; cursor: pointer; }

        .pi-cat-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 8px;
        }
        .pi-cat-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 12px 8px; border-radius: 10px; cursor: pointer;
          border: 1.5px solid #C4C4BC;
          background: var(--color-background-primary);
          transition: border-color 0.15s, background 0.15s;
          font-size: 12px; font-weight: 500; color: var(--color-text-secondary);
          text-align: center; line-height: 1.3;
        }
        .pi-cat-btn i { font-size: 20px; }
        .pi-cat-btn:hover { border-color: #1D9E75; color: var(--color-text-primary); }
        .pi-cat-btn.active {
          border-color: #1D9E75; background: #E1F5EE; color: #0F6E56;
        }

        .pi-address-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .pi-address-row .pi-input { flex: 1 1 180px; min-width: 0; }
        .pi-gps-btn {
          flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 14px; font-size: 13px; font-weight: 500;
          border: 1.5px solid #C4C4BC; border-radius: 8px;
          background: var(--color-background-primary);
          color: var(--color-text-secondary); cursor: pointer;
          transition: border-color 0.15s, color 0.15s; white-space: nowrap;
        }
        .pi-gps-btn:hover { border-color: #1D9E75; color: #0F6E56; }

        .pi-location-chip {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 7px; padding: 6px 12px; border-radius: 20px;
          background: #E1F5EE; color: #0F6E56; font-size: 12px; font-weight: 500;
          max-width: 100%; word-break: break-word; line-height: 1.4;
        }

        .pi-geocoding {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 7px; font-size: 12px; color: var(--color-text-secondary);
        }
        .pi-geocoding-dot {
          width: 14px; height: 14px; border: 2px solid #1D9E75;
          border-top-color: transparent; border-radius: 50%;
          animation: pi-spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes pi-spin { to { transform: rotate(360deg); } }

        .pi-dropzone {
          border: 1.5px dashed #C4C4BC; border-radius: 10px;
          padding: 24px; text-align: center; cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          background: var(--color-background-secondary);
        }
        .pi-dropzone:hover { border-color: #1D9E75; background: #E1F5EE; }
        .pi-dropzone-icon { font-size: 28px; color: var(--color-text-tertiary); margin-bottom: 8px; }
        .pi-dropzone p { font-size: 13px; color: var(--color-text-secondary); margin: 0; }
        .pi-dropzone span { font-size: 12px; color: var(--color-text-tertiary); }

        .pi-image-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
        .pi-image-thumb {
          position: relative; width: 76px; height: 76px; border-radius: 8px; overflow: hidden;
          border: 1.5px solid #C4C4BC;
        }
        .pi-image-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pi-remove-img {
          position: absolute; top: 3px; right: 3px;
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(0,0,0,0.65); color: #fff;
          border: none; cursor: pointer; font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          line-height: 1; transition: background 0.15s;
        }
        .pi-remove-img:hover { background: #A32D2D; }

        .pi-error {
          display: flex; align-items: flex-start; gap: 10px;
          background: #FCEBEB; border: 0.5px solid #F09595;
          color: #791F1F; border-radius: 10px;
          padding: 12px 16px; font-size: 13px; margin-bottom: 20px;
        }
        .pi-error i { flex-shrink: 0; margin-top: 1px; }

        .pi-submit-btn {
          width: 100%; padding: 13px; font-size: 15px; font-weight: 500;
          background: #0F6E56; color: #fff; border: none; border-radius: 10px;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
        }
        .pi-submit-btn:hover:not(:disabled) { background: #085041; }
        .pi-submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .pi-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pi-submit-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff; border-radius: 50%;
          animation: pi-spin 0.7s linear infinite;
        }
      `}</style>

      <div className="pi-wrap">

        <div className="pi-hero">
          <p className="pi-hero-eyebrow">Marketplace de reciclables</p>
          <h1>Publicar material</h1>
          <p>Completá los datos para que otros puedan encontrar y contactarte</p>
        </div>

        {error && (
          <div className="pi-error">
            <i className="ti ti-alert-circle" style={{ fontSize: 16 }} aria-hidden="true" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Sección 1 — Info básica */}
          <div className="pi-card">
            <p className="pi-section-label">Información básica</p>

            <div className="pi-field">
              <label className="pi-label">
                Título <span>*</span>
              </label>
              <input
                type="text"
                name="title"
                className="pi-input"
                placeholder="Ej: Botellas PET limpias, 20 kg"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pi-field">
              <label className="pi-label">Descripción</label>
              <textarea
                name="description"
                className="pi-textarea"
                rows="3"
                placeholder="Contá más detalles: cantidad, estado, condiciones de retiro..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Sección 2 — Categoría */}
          <div className="pi-card">
            <p className="pi-section-label">Categoría del material</p>
            <div className="pi-cat-grid">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`pi-cat-btn${formData.category === cat.id ? ' active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                >
                  <i className={`ti ti-${cat.icon}`} aria-hidden="true" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sección 3 — Ubicación */}
          <div className="pi-card">
            <p className="pi-section-label">Ubicación</p>

            <div className="pi-field">
              <label className="pi-label">
                Dirección <span>*</span>
              </label>
              <div className="pi-address-row">
                <input
                  type="text"
                  className="pi-input"
                  placeholder="Ej: Av. Rivadavia 1234, Buenos Aires"
                  value={formData.address || ''}
                  onChange={handleAddressChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddress(); } }}
                />
                <button type="button" className="pi-gps-btn" onClick={handleSearchAddress}>
                  <i className="ti ti-search" style={{ fontSize: 16 }} aria-hidden="true" />
                  Buscar Mapa
                </button>
                <button type="button" className="pi-gps-btn" onClick={getLocation}>
                  <i className="ti ti-current-location" style={{ fontSize: 16 }} aria-hidden="true" />
                  GPS
                </button>
              </div>

              {isGeocoding && (
                <div className="pi-geocoding">
                  <span className="pi-geocoding-dot" />
                  Buscando dirección…
                </div>
              )}

              {formData.lat && !isGeocoding && (
                <div className="pi-location-chip" title={`Coordenadas GPS: ${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}`}>
                  <i className="ti ti-map-pin" style={{ fontSize: 13, flexShrink: 0 }} aria-hidden="true" />
                  <span>{formData.address ? formData.address : `${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}`}</span>
                </div>
              )}

              {/* Mapa Interactivo con Pin del Material a Reciclar */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-map-2" style={{ color: '#0F6E56', fontSize: 16 }} aria-hidden="true" />
                    Punto de recolección en el mapa
                  </span>
                  <span style={{ fontSize: '11px', color: '#0F6E56', fontWeight: 500, background: '#E1F5EE', padding: '3px 8px', borderRadius: '12px' }}>
                    Libre · OpenFreeMap
                  </span>
                </div>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #D1D5DB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <MapView
                    center={formData.lng && formData.lat ? [formData.lng, formData.lat] : mapCenter}
                    zoom={mapZoom}
                    markers={formData.lat && formData.lng ? [{
                      id: 'product-pin',
                      coordinates: [formData.lng, formData.lat],
                      color: '#0F6E56',
                      draggable: true,
                      onDragEnd: handleMapPinSelect,
                      title: formData.title || 'Material a reciclar',
                      description: formData.address || `${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}`
                    }] : []}
                    onMapClick={handleMapPinSelect}
                    height="340px"
                    showControls={true}
                    showStyleSelector={true}
                  />
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#4B5563', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <i className="ti ti-info-circle" style={{ color: '#0F6E56', fontSize: 15, flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
                  <span>
                    Buscá tu ciudad o barrio arriba y hacé clic sobre tu casa o arrastrá el pin para fijar la ubicación exacta.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Sección 4 — Fotos */}
          <div className="pi-card">
            <p className="pi-section-label">Fotos del material</p>

            <div
              className="pi-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="pi-dropzone-icon">
                <i className="ti ti-photo-up" aria-hidden="true" />
              </div>
              <p>Hacé clic para agregar fotos</p>
              <span>Hasta 5 imágenes · JPG, PNG, WEBP</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            {previewUrls.length > 0 && (
              <div className="pi-image-grid">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="pi-image-thumb">
                    <img src={url} alt={`preview ${idx}`} />
                    <button
                      type="button"
                      className="pi-remove-img"
                      onClick={() => removeImage(idx)}
                      aria-label="Eliminar imagen"
                    >
                      <i className="ti ti-x" style={{ fontSize: 11 }} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                {previewUrls.length < 5 && (
                  <button
                    type="button"
                    className="pi-image-thumb"
                    style={{
                      background: 'var(--color-background-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', border: '1.5px dashed #C4C4BC'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="ti ti-plus" style={{ fontSize: 22, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <p className="pi-hint">{previewUrls.length}/5 imágenes seleccionadas</p>
          </div>

          <button type="submit" className="pi-submit-btn" disabled={submitting}>
            {submitting ? (
              <><span className="pi-submit-spinner" /> Publicando…</>
            ) : (
              <><i className="ti ti-circle-check" style={{ fontSize: 18 }} aria-hidden="true" /> Publicar material</>
            )}
          </button>
        </form>
      </div>

      {/* Modal Amigable para Completar Teléfono */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-scale-up border border-gray-100 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mx-auto">
              <i className="ti ti-phone-call text-2xl" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Número de contacto requerido
            </h3>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Para que los recicladores y cooperativas puedan coordinar el retiro de tus materiales, ingresa tu teléfono o WhatsApp de contacto:
            </p>

            {phoneModalError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200 text-left">
                {phoneModalError}
              </div>
            )}

            <form onSubmit={handleSavePhone} className="flex flex-col gap-4 text-left">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-gray-500">
                  Teléfono / WhatsApp
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 transition-all focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-700/10">
                  <i className="ti ti-phone text-gray-400 text-base" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Ej: +54 9 351 1234567"
                    required
                    autoFocus
                    className="min-w-0 flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-1/2 rounded-xl border border-gray-200 py-2.5 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Ir al Dashboard
                </button>
                <button
                  type="submit"
                  disabled={savingPhone}
                  className="w-full sm:w-1/2 rounded-xl bg-primary py-2.5 px-4 text-sm font-semibold text-white hover:bg-primary-dark shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {savingPhone ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar y Continuar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PublishItem;