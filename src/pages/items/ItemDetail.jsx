import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import API from '../../services/Api';
import itemService from '../../services/itemService';
import AuthContext from '../../contexts/AuthContext';
import RateUserModal from '../funcionalidades/RateUserModal';
import ConfirmModal from '../../components/feedback/ConfirmModal';
import ReportModal from '../../components/feedback/ReportModal';
import ErrorToast from '../../components/feedback/ErrorToast';
import MapView from '../../components/common/map/MapView';
import { getDirectionsUrl } from '../../services/locationService';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
  TagIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const cleanPhone = (phone) => (phone ? String(phone).replace(/\D/g, '') : '');

const categoryNames = {
  plastico:    'Plástico',
  papel:       'Papel y Cartón',
  vidrio:      'Vidrio',
  metal:       'Metal',
  textil:      'Textil',
  electronico: 'Electrónico',
  otro:        'Otro',
};

const processingStates = {
  sin_procesar: { label: 'Sin procesar', color: 'bg-gray-100 text-gray-600' },
  en_proceso:   { label: 'En proceso',   color: 'bg-amber-100 text-amber-700' },
  fardado:      { label: 'Fardado',      color: 'bg-blue-100 text-blue-700' },
  validado:     { label: 'Validado',     color: 'bg-green-100 text-green-700' },
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useContext(AuthContext);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportUserModal, setShowReportUserModal] = useState(false);

  // Estados para procesar/fardar
  const [processing, setProcessing] = useState(false);
  const [confirmBaleModal, setConfirmBaleModal] = useState(false);

  // Estados para editar ítem
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', category: '', address: '', keepImages: [], newFiles: [] });
  const [savingEdit, setSavingEdit] = useState(false);

  // Estado para eliminar ítem
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchItem = useCallback(async () => {
    try {
      const data = await itemService.getItemById(id);
      setItem(data);
    } catch (err) {
      setError(err?.response?.data?.msg || 'No se pudo cargar el material.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchItem();
  }, [id, fetchItem]);

  const handleBale = async () => {
    setProcessing(true);
    setActionError('');
    try {
      await itemService.markAsBaled(item._id);
      await fetchItem();
    } catch (err) {
      setActionError(err.response?.data?.msg || 'Error al fardar material');
    } finally {
      setProcessing(false);
      setConfirmBaleModal(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setActionError('');
    try {
      await itemService.deleteItem(item._id);
      navigate('/dashboard');
    } catch (err) {
      setActionError(err.response?.data?.msg || 'Error al eliminar la publicación');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleOpenEdit = () => {
    setEditData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'plastico',
      address: item.address || '',
      keepImages: item.images || [],
      newFiles: []
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setActionError('');
    try {
      const formData = new FormData();
      formData.append('title', editData.title);
      formData.append('description', editData.description);
      formData.append('category', editData.category);
      formData.append('address', editData.address);

      if (editData.keepImages && editData.keepImages.length > 0) {
        editData.keepImages.forEach(img => formData.append('keepImages', img));
      } else {
        formData.append('keepImages', '');
      }

      if (editData.newFiles && editData.newFiles.length > 0) {
        editData.newFiles.forEach(file => formData.append('images', file));
      }

      const data = await itemService.updateItem(item._id, formData);
      setItem(data);
      setIsEditing(false);
    } catch (err) {
      setActionError(err.response?.data?.msg || 'Error al guardar cambios.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Cargando material...</p>
        </div>
      </Layout>
    );
  }

  if (error || !item) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-20 text-center">
          <p className="text-red-500 mb-4">{error || 'Material no encontrado.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver a la búsqueda
          </button>
        </div>
      </Layout>
    );
  }

  const currentUserId = user?.id || user?._id;
  const itemOwnerId = item?.ownerId?._id || item?.ownerId;
  const isOwner = Boolean(currentUserId && itemOwnerId && String(currentUserId) === String(itemOwnerId));
  const isAdmin = Boolean(user && user.role === 'admin');
  const isGestor = Boolean(user && user.role === 'gestor');
  const state = processingStates[item.processingState] || { label: item.processingState, color: 'bg-gray-100 text-gray-600' };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-3.5 sm:px-4 py-6 sm:py-8 overflow-hidden">

        {/* Back + Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Botón Denunciar (Para usuarios autenticados o invitados con intercepción) */}
            {!isOwner && (
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    openAuthModal('login', 'Debes iniciar sesión para denunciar una publicación');
                  } else {
                    setShowReportModal(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200 transition cursor-pointer"
                title="Denunciar publicación por contenido indebido o erróneo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Denunciar
              </button>
            )}

            {/* Botón Editar: ÚNICAMENTE el autor legítimo de la publicación (o Administrador) */}
            {(isOwner || isAdmin) && (
              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Editar
              </button>
            )}

            {/* Botón Eliminar: Autor legítimo, Administrador o Gestor moderador */}
            {(isOwner || isAdmin || isGestor) && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <TrashIcon className="w-4 h-4" />
                {isGestor && !isOwner ? 'Moderar / Eliminar' : 'Eliminar'}
              </button>
            )}
          </div>
        </div>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-1 break-words">
              {item.title}
            </h1>
            <p className="text-sm text-gray-500 break-words">
              {item.description || 'Sin descripción.'}
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${state.color}`}>
              {state.label}
            </span>

            {/* BOTÓN DE APROBACIÓN / FARDADO EXCLUSIVO PARA GESTOR O ADMIN */}
            {(isGestor || isAdmin) && (
              <>
                {['sin_procesar', 'en_proceso'].includes(item.processingState) && (
                  <button
                    type="button"
                    onClick={() => setConfirmBaleModal(true)}
                    disabled={processing}
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Marcar Fardado
                  </button>
                )}

                {item.processingState === 'fardado' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/validate?itemId=${item._id}`)}
                    className="bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckBadgeIcon className="w-4 h-4" />
                    Validar Material
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Image gallery */}
        {item.images?.length > 0 && (
          <div className="mb-6">
            <div
              className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-2 cursor-zoom-in shadow-inner"
              onClick={() => setSelectedImage(item.images[0])}
            >
              <img
                src={getOptimizedImageUrl(item.images[0], { width: 900 })}
                alt={item.title || "Foto principal"}
                loading="eager"
                fetchPriority="high"
                width="800"
                height="450"
                className="w-full h-full object-cover"
              />
            </div>
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.slice(1).map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(url)}
                  >
                    <img
                      src={getOptimizedImageUrl(url, { width: 200 })}
                      alt={`Foto ${idx + 2}`}
                      loading="lazy"
                      width="150"
                      height="150"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-4">
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Categoría</p>
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-800 font-medium">
                  {categoryNames[item.category] || item.category}
                </span>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 m-0">Ofertante</p>
                {!isOwner && item.ownerId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        openAuthModal('login', 'Debes iniciar sesión para reportar a un usuario');
                      } else {
                        setShowReportUserModal(true);
                      }
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none p-0"
                    title="Denunciar a este usuario por conducta inapropiada o sospecha de fraude"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Reportar usuario
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-800 font-medium">
                  {item.ownerId?.name || 'Usuario'}
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Ubicación</p>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  {item.address || (item.location?.coordinates ? `${item.location.coordinates[1]?.toFixed(4)}, ${item.location.coordinates[0]?.toFixed(4)}` : (item.location?.lat ? `${item.location.lat?.toFixed(4)}, ${item.location.lng?.toFixed(4)}` : 'Sin dirección'))}
                </span>
              </div>
              {(item.location?.coordinates || item.location?.lat) && (
                <a
                  href={`https://www.google.com/maps?q=${item.location?.coordinates ? item.location.coordinates[1] : item.location.lat},${item.location?.coordinates ? item.location.coordinates[0] : item.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium transition-colors"
                >
                  Google Maps
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Mapa Interactivo con Pin del Material */}
            {(() => {
              const itemLng = item.location?.coordinates ? item.location.coordinates[0] : item.location?.lng;
              const itemLat = item.location?.coordinates ? item.location.coordinates[1] : item.location?.lat;
              if (!itemLat || !itemLng || isNaN(itemLat) || isNaN(itemLng)) return null;

              return (
                <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 shadow-xs">
                  <MapView
                    center={[itemLng, itemLat]}
                    zoom={14}
                    markers={[{
                      id: item._id,
                      coordinates: [itemLng, itemLat],
                      title: item.title,
                      badge: categoryNames[item.category] || item.category,
                      description: item.address || 'Ubicación para retiro del material',
                      color: '#16A085'
                    }]}
                    height="260px"
                    interactive={true}
                    showControls={true}
                    showStyleSelector={true}
                  />
                  <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">MapLibre + OpenFreeMap</span>
                    <a
                      href={getDirectionsUrl(itemLat, itemLng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 transition"
                    >
                      Cómo llegar (OSM)
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Actions */}
        {!isOwner && (
          <div className="flex flex-col sm:flex-row gap-3">
            {item.ownerId?.phone && (
              user ? (
                <a
                  href={`https://wa.me/${cleanPhone(item.ownerId.phone)}?text=Hola%20${encodeURIComponent(item.ownerId.name)},%20vi%20tu%20publicación%20"${encodeURIComponent(item.title)}"%20en%20ComunaRed%20y%20me%20interesa.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white text-sm font-medium px-5 py-3 rounded-xl transition-all duration-150 cursor-pointer shadow-xs"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-12.416c-5.514 0-10 4.486-10 10 0 1.956.564 3.78 1.542 5.327l-1.581 5.771 5.922-1.553c1.48.887 3.208 1.455 5.117 1.455 5.514 0 10-4.486 10-10s-4.486-10-10-10z" />
                  </svg>
                  Contactar por WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'Inicia sesión para contactar al ofertante por WhatsApp')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white text-sm font-medium px-5 py-3 rounded-xl transition-all duration-150 cursor-pointer shadow-xs"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-12.416c-5.514 0-10 4.486-10 10 0 1.956.564 3.78 1.542 5.327l-1.581 5.771 5.922-1.553c1.48.887 3.208 1.455 5.117 1.455 5.514 0 10-4.486 10-10s-4.486-10-10-10z" />
                  </svg>
                  Contactar por WhatsApp
                </button>
              )
            )}

            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login', 'Inicia sesión para calificar al ofertante');
                } else {
                  setShowRateModal(true);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 text-sm font-medium px-5 py-3 rounded-xl transition-all duration-150 cursor-pointer shadow-2xs"
            >
              <StarIcon className="w-4 h-4 text-amber-400" />
              Calificar al ofertante
            </button>
          </div>
        )}

        {/* Validated badge */}
        {item.processingState === 'validado' && (
          <div className="mt-4 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckBadgeIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Este material fue <span className="font-medium">validado</span> por un operador de la Comuna.
            </p>
          </div>
        )}

        {/* Image modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            <img
              src={selectedImage}
              alt="Ampliada"
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Rate User Modal */}
        {showRateModal && item?.ownerId && (
          <RateUserModal
            itemId={item._id}
            ownerName={item.ownerId.name}
            onClose={() => setShowRateModal(false)}
          />
        )}

        {/* MODAL DE DENUNCIA DE PUBLICACIÓN */}
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="item"
          itemId={item._id}
          itemTitle={item.title}
        />

        {/* MODAL DE DENUNCIA DE USUARIO */}
        <ReportModal
          isOpen={showReportUserModal}
          onClose={() => setShowReportUserModal(false)}
          targetType="user"
          reportedUserId={item.ownerId?._id || item.ownerId}
          reportedUserName={item.ownerId?.name || 'Usuario'}
        />

        {/* MODAL CONFIRMACIÓN DE FARDADO */}
        <ConfirmModal
          isOpen={confirmBaleModal}
          title="Confirmar Fardado de Material"
          message="¿Deseas marcar este material como fardado para pasarlo a la etapa de validación?"
          confirmText="Marcar como Fardado"
          cancelText="Cancelar"
          type="success"
          onConfirm={handleBale}
          onCancel={() => setConfirmBaleModal(false)}
        />

        {/* MODAL CONFIRMACIÓN DE ELIMINAR */}
        <ConfirmModal
          isOpen={confirmDelete}
          title="Eliminar Publicación"
          message="¿Estás seguro de que deseas eliminar permanentemente esta publicación? Esta acción no se puede deshacer."
          confirmText={deleting ? 'Eliminando...' : 'Sí, Eliminar'}
          cancelText="Cancelar"
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />

        {/* MODAL EDICIÓN DE PUBLICACIÓN */}
        {isEditing && (
          <div 
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}
          >
            <div style={{ background: '#FFF', borderRadius: '18px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ background: 'linear-gradient(135deg, #0f4c38, #16A085)', padding: '16px 20px', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Editar Publicación</h3>
                <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Título</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #DEE2E6', fontSize: '13px', outline: 'none' }}
                    value={editData.title}
                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Categoría</label>
                  <select
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #DEE2E6', fontSize: '13px', outline: 'none' }}
                    value={editData.category}
                    onChange={e => setEditData({ ...editData, category: e.target.value })}
                  >
                    {Object.entries(categoryNames).map(([catId, catName]) => (
                      <option key={catId} value={catId}>{catName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Descripción</label>
                  <textarea
                    rows="3"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #DEE2E6', fontSize: '13px', outline: 'none' }}
                    value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Dirección</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #DEE2E6', fontSize: '13px', outline: 'none' }}
                    value={editData.address}
                    onChange={e => setEditData({ ...editData, address: e.target.value })}
                  />
                </div>

                {/* GESTIÓN DE FOTOS */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Imágenes Actuales</label>
                  {editData.keepImages?.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {editData.keepImages.map((imgUrl, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                          <img src={imgUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setEditData({ ...editData, keepImages: editData.keepImages.filter((_, i) => i !== idx) })}
                            style={{
                              position: 'absolute', top: '2px', right: '2px', background: 'rgba(220,38,38,0.85)',
                              color: '#FFF', border: 'none', borderRadius: '50%', width: '18px', height: '18px',
                              fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                            title="Quitar foto"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 8px' }}>No hay imágenes conservadas.</p>
                  )}

                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Agregar Nuevas Imágenes</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => setEditData({ ...editData, newFiles: Array.from(e.target.files) })}
                    style={{ fontSize: '12px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="footer-btn secondary" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setIsEditing(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="publish-cta" disabled={savingEdit}>
                    {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast no intrusivo de error */}
        <ErrorToast error={actionError} onClose={() => setActionError('')} />
      </div>
    </Layout>
  );
};

export default ItemDetail;