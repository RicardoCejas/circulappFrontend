// circulappFrontend-main/src/components/common/map/MapView.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Configurar URL del WebWorker local para evitar errores 404 en Vite y navegadores
if (typeof maplibregl.setWorkerUrl === 'function') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

// Estilos de mapa: OpenStreetMap detallado estándar (calles, numeración, pasajes) + vectoriales OpenFreeMap
export const MAP_STYLES = {
  osm: {
    id: 'osm',
    name: 'Calles (OSM)',
    url: {
      version: 8,
      sources: {
        'osm-raster': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: 'osm-raster-layer',
          type: 'raster',
          source: 'osm-raster',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  liberty: {
    id: 'liberty',
    name: 'Liberty (Vector)',
    url: 'https://tiles.openfreemap.org/styles/liberty'
  },
  positron: {
    id: 'positron',
    name: 'Positron',
    url: 'https://tiles.openfreemap.org/styles/positron'
  },
  bright: {
    id: 'bright',
    name: 'Bright',
    url: 'https://tiles.openfreemap.org/styles/bright'
  }
};

const DEFAULT_CENTER = [-58.3816, -34.6037]; // Buenos Aires [lng, lat]
const DEFAULT_ZOOM = 13;

const isWebGLAvailable = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (_e) {
    void _e;
    return false;
  }
};

const MapView = ({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  styleUrl = MAP_STYLES.osm.url,
  markers = [],
  onMapClick,
  interactive = true,
  showControls = true,
  showStyleSelector = false,
  fitBoundsMarkers = false,
  height = '400px',
  className = '',
  onMapLoad
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [activeStyle, setActiveStyle] = useState(styleUrl);
  const [isSupported, setIsSupported] = useState(true);
  const [, setMapReady] = useState(false);

  // 1. Inicialización de la instancia de MapLibre GL
  useEffect(() => {
    // Comprobar soporte WebGL (evita caídas en entornos jsdom / sin WebGL)
    if (!isWebGLAvailable()) {
      setIsSupported(false);
      return;
    }

    if (!mapContainerRef.current) return;

    let initialStyle = activeStyle;
    // Si activeStyle es un objeto o URL de estilo
    if (typeof activeStyle === 'object' && activeStyle.url) {
      initialStyle = activeStyle.url;
    }

    const safeCenter = Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])
      ? center
      : DEFAULT_CENTER;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: safeCenter,
      zoom: zoom || DEFAULT_ZOOM,
      interactive,
      attributionControl: true
    });

    mapRef.current = map;

    // Controles de navegación y geolocalización
    if (showControls && interactive) {
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false
      });
      map.addControl(geolocate, 'top-right');
      map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    }

    map.on('style.load', () => {
      setMapReady(true);
      map.resize();
    });

    map.on('load', () => {
      setMapReady(true);
      map.resize();
      if (onMapLoad) onMapLoad(map);
    });

    map.on('error', (e) => {
      console.warn('Aviso de renderizado MapLibre:', e.error?.message || e.message || e);
    });

    // Forzar redimensionamiento tras render inicial
    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.resize();
    }, 200);

    // Observer para redimensionamiento automático si el contenedor cambia de tamaño
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []); // Solo al montar

  // 2. Manejo de cambio de estilo
  const handleStyleChange = useCallback((selected) => {
    if (!mapRef.current) return;
    const targetStyle = selected.url || selected;
    try {
      mapRef.current.setStyle(targetStyle);
      setActiveStyle(targetStyle);
    } catch (err) {
      console.warn('Error al cambiar estilo de mapa:', err);
    }
  }, []);

  // 3. Manejo de clics sobre el mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onMapClick) return;

    const handleClick = (e) => {
      onMapClick({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat
      }, e);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [onMapClick]);

  // 4. Centrado dinámico si cambian las coordenadas
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center || center.length !== 2) return;
    const [lng, lat] = center;
    if (isNaN(lng) || isNaN(lat)) return;

    const currentCenter = map.getCenter();
    const dx = Math.abs(currentCenter.lng - lng);
    const dy = Math.abs(currentCenter.lat - lat);
    if (dx > 0.0001 || dy > 0.0001) {
      map.flyTo({
        center: [lng, lat],
        zoom: zoom || map.getZoom(),
        speed: 1.4,
        curve: 1.2
      });
    }
  }, [center, zoom]);

  // 5. Renderizado y sincronización de marcadores
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar marcadores previos
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!Array.isArray(markers) || markers.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    let hasValidBounds = false;

    markers.forEach((m) => {
      if (!m.coordinates || m.coordinates.length !== 2) return;
      const [lng, lat] = m.coordinates;
      if (isNaN(lng) || isNaN(lat)) return;

      bounds.extend([lng, lat]);
      hasValidBounds = true;

      // Elemento DOM personalizado para el pin
      const el = document.createElement('div');
      el.className = 'maplibre-custom-marker';
      el.style.width = '34px';
      el.style.height = '42px';
      el.style.cursor = m.draggable ? 'grab' : 'pointer';
      el.style.pointerEvents = 'auto';

      const pinColor = m.color || '#16A085';
      const iconSvg = m.iconSvg || `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white" stroke="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      el.innerHTML = `
        <div style="position: relative; width: 34px; height: 34px;">
          <div style="
            width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
            background: ${pinColor};
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid white;
            display: flex; align-items: center; justify-content: center;
            transition: transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          ">
            <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
              ${iconSvg}
            </div>
          </div>
        </div>
      `;

      el.addEventListener('mouseenter', () => {
        const inner = el.querySelector('div > div');
        if (inner) inner.style.transform = 'rotate(-45deg) scale(1.15)';
      });
      el.addEventListener('mouseleave', () => {
        const inner = el.querySelector('div > div');
        if (inner) inner.style.transform = 'rotate(-45deg) scale(1)';
      });

      const markerInstance = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
        draggable: Boolean(m.draggable)
      })
        .setLngLat([lng, lat])
        .addTo(map);

      // Si es arrastrable, vincular evento de arrastre
      if (m.draggable && m.onDragEnd) {
        markerInstance.on('dragend', () => {
          const newPos = markerInstance.getLngLat();
          m.onDragEnd({ lng: newPos.lng, lat: newPos.lat });
        });
      }

      // Si tiene contenido de popup, asociar Popup
      if (m.popupContent || m.title) {
        const popup = new maplibregl.Popup({ offset: [0, -38], closeButton: true, maxWidth: '300px' });
        if (typeof m.popupContent === 'string') {
          popup.setHTML(m.popupContent);
        } else {
          popup.setHTML(`
            <div style="font-family: inherit; padding: 4px;">
              <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #111827;">${m.title || 'Ubicación'}</h4>
              ${m.badge ? `<span style="display:inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; background: #e1f5ee; color: #0f6e56; padding: 2px 8px; border-radius: 12px; margin-bottom: 6px;">${m.badge}</span>` : ''}
              ${m.description ? `<p style="margin: 0; font-size: 12px; color: #4b5563; line-height: 1.4;">${m.description}</p>` : ''}
            </div>
          `);
        }
        markerInstance.setPopup(popup);
      }

      if (m.onClick) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          m.onClick();
        });
      }

      markersRef.current.push(markerInstance);
    });

    // Ajustar límites automáticamente si se solicitó
    if (fitBoundsMarkers && hasValidBounds && markers.length > 1) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 600 });
    }
  }, [markers, fitBoundsMarkers]);

  // Fallback si el navegador no tiene aceleración WebGL o en entorno jsdom
  if (!isSupported) {
    return (
      <div
        className={`w-full rounded-2xl flex flex-col items-center justify-center bg-gray-100 border border-gray-200 text-gray-500 p-6 text-center ${className}`}
        style={{ height }}
      >
        <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-sm font-semibold text-gray-700">Visualizador de Mapa Interactivo</p>
        <p className="text-xs text-gray-500 mt-1">OpenFreeMap (MapLibre GL JS)</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-xs border border-gray-200/80 ${className}`} style={{ height }}>
      {/* Contenedor DOM para MapLibre GL */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Selector de estilos opcional (Liberty, Positron, Bright, OSM) */}
      {showStyleSelector && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-md border border-gray-200 flex items-center gap-1 text-xs">
          <span className="font-semibold text-gray-600 px-1 text-[10px] uppercase tracking-wider">Estilo:</span>
          {Object.values(MAP_STYLES).map((s) => {
            const isMatch = (typeof activeStyle === 'string' && activeStyle === s.url) ||
                            (typeof activeStyle === 'object' && s.id === 'osm');
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStyleChange(s)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {s.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MapView;
