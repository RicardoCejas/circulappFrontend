import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MapView, { MAP_STYLES } from '../components/common/map/MapView';
import LocationPickerMap from '../components/common/map/LocationPickerMap';
import { geocodeAddress, reverseGeocode, getDirectionsUrl } from '../services/locationService';
import recyclingPointService from '../services/recyclingPointService';
import API from '../services/Api';

vi.mock('../services/Api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Pruebas Unitarias de MapLibre, OpenFreeMap y Servicios Geoespaciales', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('MapView debe definir los estilos de OpenFreeMap (Liberty, Positron, Bright)', () => {
    expect(MAP_STYLES.liberty.url).toBe('https://tiles.openfreemap.org/styles/liberty');
    expect(MAP_STYLES.positron.url).toBe('https://tiles.openfreemap.org/styles/positron');
    expect(MAP_STYLES.bright.url).toBe('https://tiles.openfreemap.org/styles/bright');
  });

  it('MapView debe renderizar fallback accesible cuando WebGL no está disponible en jsdom', () => {
    render(<MapView center={[-58.3816, -34.6037]} zoom={12} />);
    expect(screen.getByText(/Visualizador de Mapa Interactivo/i)).toBeInTheDocument();
    expect(screen.getByText(/OpenFreeMap/i)).toBeInTheDocument();
  });

  it('LocationPickerMap debe mostrar controles de búsqueda, GPS y estado de selección', () => {
    const handleChange = vi.fn();
    render(
      <LocationPickerMap
        value={{ lat: -34.6037, lng: -58.3816, address: 'Obelisco, Buenos Aires' }}
        onChange={handleChange}
        label="Ubicación de Prueba"
      />
    );

    expect(screen.getByText('Ubicación de Prueba')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar calle, barrio, localidad.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mi GPS/i })).toBeInTheDocument();
    expect(screen.getByText(/Obelisco, Buenos Aires/i)).toBeInTheDocument();
  });

  it('locationService.getDirectionsUrl debe generar un enlace OSRM/OpenStreetMap válido', () => {
    const url = getDirectionsUrl(-34.6037, -58.3816);
    expect(url).toContain('https://www.openstreetmap.org/directions');
    expect(url).toContain('-34.6037');
    expect(url).toContain('-58.3816');
  });

  it('locationService.geocodeAddress debe consultar la API y retornar coordenadas formateadas', async () => {
    API.get.mockResolvedValueOnce({
      data: {
        lat: -34.6037,
        lng: -58.3816,
        formattedAddress: 'Av. Corrientes 1000, CABA'
      }
    });

    const res = await geocodeAddress('Av. Corrientes 1000');
    expect(res).not.toBeNull();
    expect(res.lat).toBe(-34.6037);
    expect(res.lng).toBe(-58.3816);
    expect(res.formattedAddress).toBe('Av. Corrientes 1000, CABA');
  });

  it('recyclingPointService debe interactuar correctamente con los endpoints del backend', async () => {
    const mockPoints = [
      { _id: 'rp1', name: 'Punto Verde Plaza Mitre', pinColor: '#10B981', status: 'activo' }
    ];
    API.get.mockResolvedValueOnce({ data: mockPoints });

    const points = await recyclingPointService.getRecyclingPoints({ status: 'activo' });
    expect(points).toEqual(mockPoints);
    expect(API.get).toHaveBeenCalledWith('/recycling-points', { params: { status: 'activo' } });
  });

});
