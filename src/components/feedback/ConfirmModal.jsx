import React from 'react';

/**
 * Componente Modal de Confirmación Estilizado con el tema nativo de CirculApp.
 * Centrado absoluto perfecto en pantalla completa con overlay borroso.
 */
const ConfirmModal = ({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro de realizar esta acción?",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  type = "primary", // primary, danger, success
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getHeaderBg = () => {
    switch (type) {
      case "danger": return "linear-gradient(135deg, #C0392B, #E74C3C)";
      case "success": return "linear-gradient(135deg, #1E8449, #27AE60)";
      default: return "linear-gradient(135deg, #0f4c38 0%, #117A65 40%, #16A085 100%)";
    }
  };

  const getConfirmBtnStyle = () => {
    switch (type) {
      case "danger": return { background: '#E74C3C', color: '#FFF' };
      case "success": return { background: '#16A085', color: '#FFF' };
      default: return { background: '#16A085', color: '#FFF' };
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onCancel}
    >
      <div 
        style={{
          maxWidth: '440px',
          width: '100%',
          borderRadius: '20px',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.28)',
          overflow: 'hidden',
          animation: 'confirmScaleUp 0.18s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con Gradiente */}
        <div 
          style={{
            background: getHeaderBg(),
            padding: '16px 20px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {type === 'danger' ? (
              <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 10-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            )}
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{title}</h3>
          </div>

          <button 
            type="button" 
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '18px',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Mensaje */}
        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#4B5563', lineHeight: '1.55' }}>
            {message}
          </p>
        </div>

        {/* Acciones */}
        <div 
          style={{
            padding: '14px 20px',
            background: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: '#E2E8F0',
                color: '#334155',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            style={{
              ...getConfirmBtnStyle(),
              border: 'none',
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              transition: 'opacity 0.15s'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confirmScaleUp {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
