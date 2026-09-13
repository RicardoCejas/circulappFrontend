// circulappFrontend-main/src/pages/admin/AdminRecyclingPoints.jsx
import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/layout/Layout';
import AuthContext from '../../contexts/AuthContext';
import recyclingPointService from '../../services/recyclingPointService';
import MapView from '../../components/common/map/MapView';
import LocationPickerMap from '../../components/common/map/LocationPickerMap';
import ConfirmModal from '../../components/feedback/ConfirmModal';

const CATEGORIES_LIST = [
  { id: 'plastico', name: 'Plástico', color: '#1D9E75' },
  { id: 'papel', name: 'Papel y Cartón', color: '#378ADD' },
  { id: 'vidrio', name: 'Vidrio', color: '#7F77DD' },
  { id: 'metal', name: 'Metal', color: '#888780' },
  { id: 'textil', name: 'Textil', color: '#D85A30' },
  { id: 'electronico', name: 'Electrónico', color: '#D4537E' },
  { id: 'otro', name: 'Otro', color: '#16A085' }
];

const PRESET_COLORS = [
  '#10B981', // Verde Esmeralda
  '#059669', // Verde Oscuro
  '#2563EB', // Azul
  '#7C3AED', // Púrpura
  '#D97706', // Ámbar
  '#DC2626', // Rojo
  '#0D9488', // Teal
  '#4B5563'  // Gris neutro
];

const DEFAULT_FORM = {
  name: '',
  description: '',
  address: '',
  lat: -34.6037,
  lng: -58.3816,
  acceptedCategories: ['plastico', 'papel', 'vidrio'],
  schedule: 'Lunes a Viernes 08:00 a 18:00',
  contactPhone: '',
  pinColor: '#10B981',
  pinIcon: 'recycle',
  status: 'activo'
};

const AdminRecyclingPoints = () => {
  const { user } = useContext(AuthContext);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estado del Modal de Creación / Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPointId, setEditingPointId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Estado del modal de eliminación
  const [deletingId, setDeletingId] = useState(null);

  // Filtros de tabla
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const data = await recyclingPointService.getRecyclingPoints();
      setPoints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar puntos:', err);
      setErrorMsg('No se pudieron cargar los puntos limpios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleOpenCreate = () => {
    setEditingPointId(null);
    setFormData(DEFAULT_FORM);
    setIsModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleOpenEdit = (point) => {
    setEditingPointId(point._id);
    const lat = point.location?.coordinates ? point.location.coordinates[1] : (point.location?.lat || -34.6037);
    const lng = point.location?.coordinates ? point.location.coordinates[0] : (point.location?.lng || -58.3816);

    setFormData({
      name: point.name || '',
      description: point.description || '',
      address: point.address || '',
      lat,
      lng,
      acceptedCategories: point.acceptedCategories || ['plastico', 'papel'],
      schedule: point.schedule || '',
      contactPhone: point.contactPhone || '',
      pinColor: point.pinColor || '#10B981',
      pinIcon: point.pinIcon || 'recycle',
      status: point.status || 'activo'
    });
    setIsModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleToggleCategory = (catId) => {
    setFormData(prev => {
      const exists = prev.acceptedCategories.includes(catId);
      const next = exists
        ? prev.acceptedCategories.filter(c => c !== catId)
        : [...prev.acceptedCategories, catId];
      return { ...prev, acceptedCategories: next.length > 0 ? next : [catId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('La dirección es obligatoria.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingPointId) {
        await recyclingPointService.updateRecyclingPoint(editingPointId, formData);
        setSuccessMsg('Punto limpio actualizado correctamente.');
      } else {
        await recyclingPointService.createRecyclingPoint(formData);
        setSuccessMsg('Nuevo punto limpio registrado con éxito.');
      }
      setIsModalOpen(false);
      await fetchPoints();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.msg || 'Error al guardar el punto limpio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await recyclingPointService.deleteRecyclingPoint(deletingId);
      setSuccessMsg('Punto limpio eliminado.');
      setDeletingId(null);
      await fetchPoints();
    } catch (_err) {
      setErrorMsg('No se pudo eliminar el punto limpio.');
      setDeletingId(null);
    }
  };

  // Filtrado de puntos
  const filteredPoints = points.filter(pt => {
    if (statusFilter && pt.status !== statusFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchName = pt.name?.toLowerCase().includes(q);
      const matchAddr = pt.address?.toLowerCase().includes(q);
      if (!matchName && !matchAddr) return false;
    }
    return true;
  });

  // Marcadores para el mapa general
  const overviewMarkers = filteredPoints
    .filter(pt => {
      const lat = pt.location?.coordinates ? pt.location.coordinates[1] : pt.location?.lat;
      const lng = pt.location?.coordinates ? pt.location.coordinates[0] : pt.location?.lng;
      return lat && lng;
    })
    .map(pt => {
      const lat = pt.location?.coordinates ? pt.location.coordinates[1] : pt.location?.lat;
      const lng = pt.location?.coordinates ? pt.location.coordinates[0] : pt.location?.lng;
      return {
        id: pt._id,
        coordinates: [lng, lat],
        color: pt.pinColor || '#10B981',
        title: pt.name,
        badge: pt.status.toUpperCase(),
        description: `${pt.address} • Horario: ${pt.schedule || 'S/D'}`,
        onClick: () => handleOpenEdit(pt)
      };
    });

  if (!user || (user.role !== 'admin' && user.role !== 'gestor' && user.role !== 'coordinador' && !user.isDev && user.role !== 'dev')) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-20 px-4 text-center">
          <h2 className="text-xl font-bold text-gray-800">Acceso restringido</h2>
          <p className="text-gray-500 mt-2">Esta sección requiere permisos de Gestor o Administrador.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Banner Hero */}
          <div className="relative bg-gradient-to-r from-[#0F6E56] to-[#16A085] rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-md overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative z-10">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full mb-3">
                Panel de Gestión Geoespacial
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight m-0">
                Puntos Limpios y Centros de Acopio
              </h1>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                Personaliza al 100% los puntos de reciclaje en el mapa: ubicación por coordenadas, colores de pin, horarios de atención y tipos de material recibidos.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="relative z-10 inline-flex items-center gap-2 bg-white text-[#0F6E56] hover:bg-emerald-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-sm transition active:scale-98 cursor-pointer"
            >
              <svg className="w-5 h-5 text-[#0F6E56]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Punto Limpio
            </button>
          </div>

          {/* Mensajes de feedback */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
              <span>{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg('')} className="text-red-500 font-bold ml-4">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
              <span>{successMsg}</span>
              <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-600 font-bold ml-4">✕</button>
            </div>
          )}

          {/* Mapa General de Puntos Limpios */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 mb-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 m-0 flex items-center gap-2">
                  <span>🗺️</span> Vista en Mapa Satelital y Vectorial
                </h2>
                <p className="text-xs text-gray-500 m-0">
                  Mostrando {overviewMarkers.length} puntos limpios activos en OpenFreeMap.
                </p>
              </div>
              <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
                {overviewMarkers.length} Marcadores
              </span>
            </div>

            <MapView
              center={[-58.3816, -34.6037]}
              zoom={11}
              markers={overviewMarkers}
              fitBoundsMarkers={overviewMarkers.length > 1}
              height="400px"
              showControls={true}
              showStyleSelector={true}
            />
          </div>

          {/* Filtros y Listado de Puntos */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Buscar por nombre o dirección..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-gray-600 uppercase">Estado:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="mantenimiento">En mantenimiento</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500">Cargando puntos de reciclaje…</div>
            ) : filteredPoints.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No se encontraron puntos de reciclaje con los filtros seleccionados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPoints.map((pt) => {
                  const lat = pt.location?.coordinates ? pt.location.coordinates[1] : pt.location?.lat;
                  const lng = pt.location?.coordinates ? pt.location.coordinates[0] : pt.location?.lng;

                  return (
                    <div
                      key={pt._id}
                      className="border border-gray-200 rounded-2xl p-5 bg-white hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Cabecera de tarjeta */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                              style={{ backgroundColor: pt.pinColor || '#10B981' }}
                            >
                              ♻
                            </span>
                            <h3 className="font-bold text-gray-900 text-base leading-tight m-0">{pt.name}</h3>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                            pt.status === 'activo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pt.status === 'mantenimiento'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {pt.status}
                          </span>
                        </div>

                        {/* Dirección y Coordenadas */}
                        <p className="text-xs text-gray-600 mb-2 flex items-start gap-1.5">
                          <span className="text-emerald-700 shrink-0">📍</span>
                          <span>{pt.address}</span>
                        </p>

                        {lat && lng && (
                          <div className="text-[11px] font-mono text-gray-400 mb-3">
                            Coords: {lat.toFixed(4)}, {lng.toFixed(4)}
                          </div>
                        )}

                        {/* Horario y Teléfono */}
                        {pt.schedule && (
                          <p className="text-xs text-gray-500 mb-1">
                            <span className="font-semibold text-gray-700">Horario:</span> {pt.schedule}
                          </p>
                        )}
                        {pt.contactPhone && (
                          <p className="text-xs text-gray-500 mb-3">
                            <span className="font-semibold text-gray-700">Contacto:</span> {pt.contactPhone}
                          </p>
                        )}

                        {/* Categorías Aceptadas */}
                        <div className="flex flex-wrap gap-1.5 my-3">
                          {(pt.acceptedCategories || []).map((catId) => {
                            const conf = CATEGORIES_LIST.find(c => c.id === catId);
                            return (
                              <span
                                key={catId}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"
                              >
                                {conf?.name || catId}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pt)}
                          className="flex-1 py-1.5 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition text-center"
                        >
                          Editar / Personalizar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(pt._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Eliminar punto"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Creación / Edición 100% Personalizable */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h2 className="text-lg font-bold text-gray-900 m-0">
                {editingPointId ? 'Personalizar Punto Limpio' : 'Nuevo Punto de Reciclaje'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nombre del Punto Limpio / Centro de Acopio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Punto Verde Plaza San Martín"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Descripción o Recomendaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Ingreso por calle lateral. Traer materiales secos y limpios."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:border-emerald-600 outline-none"
                />
              </div>

              {/* Selector interactivo de ubicación y pin sobre mapa */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Ubicación y Marcador en Mapa *
                </label>
                <LocationPickerMap
                  value={{
                    lat: formData.lat,
                    lng: formData.lng,
                    address: formData.address
                  }}
                  pinColor={formData.pinColor}
                  onChange={(loc) => {
                    setFormData(prev => ({
                      ...prev,
                      lat: loc.lat,
                      lng: loc.lng,
                      address: loc.address
                    }));
                  }}
                  height="260px"
                />
              </div>

              {/* Personalización visual del Pin: Color */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Color Personalizado del Pin
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, pinColor: color })}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                        formData.pinColor === color ? 'scale-125 border-gray-900 shadow-sm' : 'border-white'
                      }`}
                    />
                  ))}
                  <div className="flex items-center gap-1.5 ml-2">
                    <input
                      type="color"
                      value={formData.pinColor}
                      onChange={(e) => setFormData({ ...formData, pinColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0"
                      title="Seleccionar color HEX libre"
                    />
                    <span className="text-xs font-mono text-gray-500">{formData.pinColor}</span>
                  </div>
                </div>
              </div>

              {/* Categorías Aceptadas */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Categorías de Material Aceptadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES_LIST.map(cat => {
                    const isSelected = formData.acceptedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Horario de Atención
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Lun-Vie 08:00 a 18:00"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: +54 9 11 1234-5678"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Estado Operativo
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:border-emerald-600 outline-none bg-white"
                >
                  <option value="activo">Activo (Visible en mapa público)</option>
                  <option value="mantenimiento">En mantenimiento temporal</option>
                  <option value="inactivo">Inactivo / Cerrado</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {submitting ? 'Guardando…' : (editingPointId ? 'Guardar Cambios' : 'Crear Punto Limpio')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Eliminar punto de reciclaje"
        message="¿Estás seguro de que deseas eliminar este punto de reciclaje? Esta acción no se puede deshacer."
        confirmText="Eliminar punto"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Layout>
  );
};

export default AdminRecyclingPoints;
