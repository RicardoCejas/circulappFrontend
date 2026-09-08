// frontend/src/pages/funcionalidades/RateUserModal.jsx
import { useState } from 'react';
import API from '../../services/Api';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, XMarkIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const SCORE_LABELS = {
  1: { text: 'Muy deficiente', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  2: { text: 'Regular', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  3: { text: 'Bueno', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  4: { text: 'Muy bueno', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  5: { text: '¡Excelente!', color: 'text-emerald-700 bg-emerald-100 border-emerald-300 font-bold' }
};

// Componente interactivo de barra de 5 estrellas con hover y selección
function StarRatingBar({ value, onChange, label, sublabel, required = false }) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value || 0;

  return (
    <div className="flex flex-col gap-1.5 p-3.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-2xl transition-all">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
            {label}
            {required && <span className="text-rose-500 font-black">*</span>}
          </span>
          {sublabel && <p className="text-[11px] text-gray-400 m-0">{sublabel}</p>}
        </div>

        {/* Badge de puntuación actual */}
        {displayValue > 0 ? (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${SCORE_LABELS[displayValue]?.color || 'bg-gray-100 text-gray-700'}`}>
            {displayValue} de 5 ★ — {SCORE_LABELS[displayValue]?.text}
          </span>
        ) : (
          <span className="text-[11px] text-gray-400 font-medium italic">
            Sin calificar
          </span>
        )}
      </div>

      {/* Barra de estrellas interactiva */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div 
          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-xs"
          onMouseLeave={() => setHoverValue(0)}
        >
          {[1, 2, 3, 4, 5].map((starNumber) => {
            const isFilled = starNumber <= displayValue;
            return (
              <button
                key={starNumber}
                type="button"
                onClick={() => onChange(starNumber)}
                onMouseEnter={() => setHoverValue(starNumber)}
                className="p-1 rounded-lg hover:scale-125 active:scale-95 transition-transform cursor-pointer focus:outline-none border-0 bg-transparent"
                title={`${starNumber} estrellas - ${SCORE_LABELS[starNumber]?.text}`}
              >
                {isFilled ? (
                  <StarSolid className="w-7 h-7 text-amber-400 filter drop-shadow-xs transition-colors" />
                ) : (
                  <StarOutline className="w-7 h-7 text-gray-300 hover:text-amber-300 transition-colors" />
                )}
              </button>
            );
          })}
        </div>

        {!required && value > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setHoverValue(0);
            }}
            className="text-[11px] text-gray-400 hover:text-rose-600 transition-colors font-medium cursor-pointer border-0 bg-transparent"
          >
            Quitar calificación
          </button>
        )}
      </div>
    </div>
  );
}

const RateUserModal = ({ itemId, ownerName, onClose }) => {
  const [formData, setFormData] = useState({
    materialQuality: 5,
    punctuality: 5,
    standardCompliance: 5,
    comment: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemId) {
      setError('ID del ítem no válido.');
      return;
    }

    if (!formData.materialQuality) {
      setError('Por favor califica la calidad del material donado.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await API.post('/ratings', {
        itemId,
        materialQuality: parseInt(formData.materialQuality, 10),
        punctuality: formData.punctuality ? parseInt(formData.punctuality, 10) : undefined,
        standardCompliance: formData.standardCompliance ? parseInt(formData.standardCompliance, 10) : undefined,
        comment: formData.comment.trim()
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al enviar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl overflow-hidden shadow-xl p-6 mt-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Cabecera */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 m-0 leading-tight">
              Calificar a {ownerName}
            </h2>
            <p className="text-xs text-gray-500 m-0 mt-0.5">
              Tu valoración ayuda a construir una comunidad de reciclaje confiable y segura.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border-0"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Feedback Alert */}
      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold p-3.5 rounded-2xl mb-4 flex items-center gap-2">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="py-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center gap-2">
          <CheckCircleIcon className="w-12 h-12 text-emerald-600 animate-bounce" />
          <h3 className="text-base font-bold text-emerald-900 m-0">¡Calificación enviada con éxito!</h3>
          <p className="text-xs text-emerald-700 m-0">Gracias por colaborar con la comunidad ComunaRed.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Calidad del material */}
          <StarRatingBar
            label="Calidad del material entregado"
            sublabel="Estado de conservación, limpieza y separación del residuo."
            value={formData.materialQuality}
            onChange={(val) => setFormData(prev => ({ ...prev, materialQuality: val }))}
            required
          />

          {/* Puntualidad */}
          <StarRatingBar
            label="Puntualidad en la entrega o retiro"
            sublabel="Cumplimiento con el horario pactado para el encuentro."
            value={formData.punctuality}
            onChange={(val) => setFormData(prev => ({ ...prev, punctuality: val }))}
          />

          {/* Cumplimiento de estándares */}
          <StarRatingBar
            label="Cumplimiento de estándares de procesamiento"
            sublabel="Volumen acorde a la publicación y embalaje adecuado."
            value={formData.standardCompliance}
            onChange={(val) => setFormData(prev => ({ ...prev, standardCompliance: val }))}
          />

          {/* Comentario */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Comentario o reseña (Opcional)
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Contanos tu experiencia con este usuario (amabilidad, predisposición, etc.)..."
              className="w-full p-3 text-xs bg-gray-50 border border-gray-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition-all resize-none"
              rows="3"
              maxLength="500"
            />
            <p className="text-[10px] text-gray-400 text-right m-0 mt-1">
              {formData.comment.length}/500 caracteres
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0F6E56] hover:bg-[#0c5945] active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-60 cursor-pointer inline-flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Calificación'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RateUserModal;