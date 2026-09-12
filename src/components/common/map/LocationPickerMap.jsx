// circulappFrontend-main/src/components/common/map/LocationPickerMap.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MapView from './MapView';
import { geocodeAddress, reverseGeocode } from '../../../services/locationService';

const LocationPickerMap = ({
  value = { lat: null, lng: null, address: '' },
  onChange,
  height = '340px',
  pinColor = '#10B981',
  label = 'Selecciona la ubicación en el mapa',
  readOnly = false
}) => {
  const [lat, setLat] = useState(value.lat || null);
  const [lng, setLng] = useState(value.lng || null);
  const [addressInput, setAddressInput] = useState(value.address || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const debounceRef = useRef(null);

  // Sincronizar estado interno si cambian las props externas
  useEffect(() => {
    if (value.lat !== undefined && value.lat !== lat) setLat(value.lat);
    if (value.lng !== undefined && value.lng !== lng) setLng(value.lng);
    if (value.address !== undefined && value.address !== addressInput) setAddressInput(value.address || '');
  }, [value.lat, value.lng, value.address]);

  // Actualizar coordenadas y notificar al padre
  const updateLocation = useCallback(async (newLat, newLng, newAddress) => {
    setLat(newLat);
    setLng(newLng);
    let resolvedAddress = newAddress;

    if (!resolvedAddress) {
      setIsSearching(true);
      const rev = await reverseGeocode(newLat, newLng);
      resolvedAddress = rev ? rev.formattedAddress : `Ubicación: ${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;
      setIsSearching(false);
    }

    setAddressInput(resolvedAddress);
    if (onChange) {
      onChange({
        lat: newLat,
        lng: newLng,
        address: resolvedAddress
      });
    }
  }, [onChange]);

  // Clic en el mapa para colocar/mover el pin
  const handleMapClick = useCallback((coords) => {
    if (readOnly) return;
    updateLocation(coords.lat, coords.lng);
  }, [readOnly, updateLocation]);

  // Fin del arrastre del pin
  const handleMarkerDragEnd = useCallback((coords) => {
    if (readOnly) return;
    updateLocation(coords.lat, coords.lng);
  }, [readOnly, updateLocation]);

  // Búsqueda de dirección con geocodificación
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!addressInput || addressInput.trim().length < 3) {
      setSearchError('Ingresa al menos 3 caracteres para buscar.');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const geo = await geocodeAddress(addressInput.trim());
      if (geo) {
        updateLocation(geo.lat, geo.lng, geo.formattedAddress);
      } else {
        setSearchError('No encontramos esa dirección. Intenta agregar ciudad o país.');
      }
    } catch (err) {
      setSearchError('Error de conexión al buscar dirección.');
    } finally {
      setIsSearching(false);
    }
  };

  // Geolocalización del navegador (GPS)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await updateLocation(latitude, longitude);
        setIsSearching(false);
      },
      (err) => {
        setIsSearching(false);
        setSearchError(err.code === 1 ? 'Permiso GPS denegado por el usuario.' : 'No se pudo obtener la posición GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Marcador activo para el mapa
  const markers = lat && lng ? [
    {
      id: 'active-pin',
      coordinates: [lng, lat],
      color: pinColor,
      draggable: !readOnly,
      onDragEnd: handleMarkerDragEnd,
      title: 'Ubicación seleccionada',
      description: addressInput || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  ] : [];

  const center = lat && lng ? [lng, lat] : [-58.3816, -34.6037]; // Buenos Aires por defecto
  const zoom = lat && lng ? 16 : 11;

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {label}
          </label>
          <span className="text-[11px] text-gray-400">
            {readOnly ? 'Solo lectura' : 'Haz clic o arrastra el pin'}
          </span>
        </div>
      )}

      {/* Barra de búsqueda integrada y botón GPS */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar calle, barrio, localidad..."
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                setSearchError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full pl-9 pr-20 py-2 text-sm border border-gray-300 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition bg-white"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-1.5 top-1 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            >
              {isSearching ? 'Buscando…' : 'Buscar'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isSearching}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition shadow-xs active:scale-[0.98]"
            title="Usar mi ubicación GPS actual"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Mi GPS</span>
          </button>
        </div>
      )}

      {searchError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {searchError}
        </p>
      )}

      {/* Contenedor del Mapa MapLibre */}
      <MapView
        center={center}
        zoom={zoom}
        markers={markers}
        onMapClick={handleMapClick}
        interactive={!readOnly}
        height={height}
        showStyleSelector={true}
      />

      {/* Chip con coordenadas activas */}
      {lat && lng && (
        <div className="flex flex-wrap items-center justify-between text-xs bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 px-3 py-2 rounded-xl gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-medium truncate">
              {addressInput || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700/80 font-mono shrink-0">
            Lat: {lat.toFixed(4)} | Lng: {lng.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationPickerMap;
