// circulappFrontend-main/src/services/locationService.js
import API from './Api';

// Cache en memoria para evitar llamadas redundantes a la API de geocodificación
const geocodeCache = new Map();

/**
 * Geocodificación directa: convierte una dirección textual en coordenadas [lat, lng]
 * @param {string} address - Texto de la dirección
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string} | null>}
 */
export const geocodeAddress = async (address) => {
  if (!address || typeof address !== 'string' || address.trim().length < 3) {
    return null;
  }

  const query = address.trim();
  const cacheKey = `geo:${query.toLowerCase()}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // 1. Intentar a través del backend si el usuario está autenticado o backend disponible
  try {
    const res = await API.get('/location/geocode', { params: { address: query } });
    if (res.data && res.data.lat !== undefined && res.data.lng !== undefined) {
      const result = {
        lat: Number(res.data.lat),
        lng: Number(res.data.lng),
        formattedAddress: res.data.formattedAddress || query
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (backendError) {
    // Si da 401 (no autenticado) o error de red, proceder con fallback público de OpenStreetMap
    console.debug('Fallo endpoint backend geocode, usando OpenStreetMap Nominatim:', backendError.message);
  }

  // 2. Fallback desacoplado directo a OpenStreetMap Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(nomUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CirculApp-Frontend/1.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const result = {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          formattedAddress: item.display_name
        };
        geocodeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (nomError) {
    console.warn('Error en fallback Nominatim:', nomError.message);
  }

  return null;
};

/**
 * Geocodificación inversa: convierte coordenadas [lat, lng] en dirección legible
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string} | null>}
 */
export const reverseGeocode = async (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) return null;

  const cacheKey = `rev:${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // 1. Intentar backend
  try {
    const res = await API.get('/location/reverse-geocode', { params: { lat: latitude, lng: longitude } });
    if (res.data && res.data.formattedAddress) {
      const result = {
        lat: latitude,
        lng: longitude,
        formattedAddress: res.data.formattedAddress
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (backendErr) {
    console.debug('Fallo backend reverse geocode, usando OpenStreetMap:', backendErr.message);
  }

  // 2. Fallback directo a Nominatim Reverse
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(nomUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CirculApp-Frontend/1.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        const result = {
          lat: latitude,
          lng: longitude,
          formattedAddress: data.display_name
        };
        geocodeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Error en reverse geocoding fallback:', err.message);
  }

  return {
    lat: latitude,
    lng: longitude,
    formattedAddress: `Ubicación GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  };
};

/**
 * Genera enlace universal para abrir indicaciones / navegación en OpenStreetMap o Google Maps
 */
export const getDirectionsUrl = (lat, lng) => {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${lat}%2C${lng}`;
};

export default {
  geocodeAddress,
  reverseGeocode,
  getDirectionsUrl
};
