import React, { useState, useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import feedbackService from "../../services/feedbackService";

const CATEGORIES = [
  { id: "general", label: "General", icon: "ti-message" },
  { id: "ux_ui", label: "Diseño e Interfaz", icon: "ti-layout" },
  { id: "mapa_geolocalizacion", label: "Mapa y Geolocalización", icon: "ti-map-pin" },
  { id: "publicaciones", label: "Publicar Materiales", icon: "ti-package" },
  { id: "notificaciones", label: "Notificaciones", icon: "ti-bell" },
  { id: "rendimiento", label: "Rendimiento y Carga", icon: "ti-bolt" },
  { id: "otro", label: "Otro", icon: "ti-dots" }
];

const FeedbackModal = ({ isOpen, onClose, initialType = "general_feedback", initialFeature = "" }) => {
  const { user } = useContext(AuthContext);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).slice(0, 3);
    setFiles(selected);
    const newPreviews = selected.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Por favor escribe tu comentario o sugerencia.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("title", title.trim() || "Comentario de usuario");
      fd.append("comment", comment.trim());
      fd.append("rating", rating);
      fd.append("category", category);
      fd.append("type", initialType);
      fd.append("pageUrl", window.location.pathname);
      if (initialFeature) fd.append("featureTested", initialFeature);
      if (!user) {
        if (guestName.trim()) fd.append("userName", guestName.trim());
        if (guestEmail.trim()) fd.append("userEmail", guestEmail.trim());
      }
      files.forEach(f => fd.append("attachments", f));

      await feedbackService.createFeedback(fd);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setTitle("");
        setComment("");
        setFiles([]);
        setPreviews([]);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Ocurrió un error al enviar tus comentarios.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center text-xl shadow-2xs">
              <i className="ti ti-speakerphone" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 m-0">
                ¡Tus Comentarios! Ayúdanos a mejorar
              </h2>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                Tu opinión es clave para el avance y desarrollo de ComunaRed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3 shadow-xs">
              ✓
            </div>
            <h3 className="text-base font-bold text-gray-800">¡Muchísimas gracias por tus comentarios!</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Tu reporte ha sido registrado con éxito en nuestro repositorio de mejoras de la comunidad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <i className="ti ti-alert-circle text-base" />
                <span>{error}</span>
              </div>
            )}

            {/* Calificación por estrellas */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 text-center">
                ¿Cómo calificarías tu experiencia en esta sección?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-120 cursor-pointer focus:outline-none"
                    style={{ color: (hoverRating || rating) >= star ? "#F59E0B" : "#D1D5DB" }}
                    title={`${star} estrella${star > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Categorías */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Área de tu comentario
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                      category === c.id
                        ? "bg-[#0F6E56] text-white border-[#0F6E56] shadow-2xs"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <i className={`ti ${c.icon}`} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Título opcional */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Título o resumen breve
              </label>
              <input
                type="text"
                placeholder="Ej: Sugerencia para el mapa / Botón de publicar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:border-[#0F6E56] outline-none"
              />
            </div>

            {/* Comentario principal */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Tus observaciones o propuesta *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contanos qué te gustaría mejorar, qué falló o qué funcionalidad sumarías..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:border-[#0F6E56] outline-none resize-none"
              />
            </div>

            {/* Datos si es usuario no autenticado */}
            {!user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tu nombre (opcional)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl outline-none"
                />
                <input
                  type="email"
                  placeholder="Tu email de contacto (opcional)"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl outline-none"
                />
              </div>
            )}

            {/* Adjuntar capturas / archivos */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Adjuntar captura o imagen (opcional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E1F5EE] file:text-[#0F6E56] hover:file:bg-[#d1fae5] cursor-pointer"
              />
              {previews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {previews.map((url, i) => (
                    <img key={i} src={url} alt="Adjunto" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  ))}
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0F6E56] hover:bg-[#0c5946] active:scale-98 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando comentarios...
                  </>
                ) : (
                  <>
                    <i className="ti ti-send" />
                    Enviar Comentarios
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
