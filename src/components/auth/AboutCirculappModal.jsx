import { XMarkIcon } from '@heroicons/react/24/outline';
import BrandLogo from '../common/BrandLogo';

export default function AboutCirculappModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-3xl shadow-2xl border-t-4 border-[#0F6E56] animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="symbol" size="md" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 m-0 leading-tight">¿Qué es ComunaRed?</h2>
              <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-wider m-0 mt-0.5">Plataforma de Economía Circular</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-2 flex flex-col gap-4 text-sm text-gray-700">
          {/* Misión Box */}
          <div className="p-4 rounded-2xl bg-[#EAF5F1] border border-[#d2ebe2] text-[#13493b]">
            <p className="m-0 text-xs sm:text-sm leading-relaxed">
              <strong className="text-[#0c3c2f] font-bold">🌱 Nuestra Misión: </strong>
              ComunaRed es la solución digital que transforma la gestión de residuos en recursos de valor, conectando a vecinos, comercios y gestores de reciclaje.
            </p>
          </div>

          {/* Cómo funciona */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              ¿Cómo funciona la red?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Paso 1 */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs mb-1">
                  <span className="text-base">📦</span>
                  <span>1. Publicación</span>
                </div>
                <p className="text-[11px] text-gray-500 m-0 leading-normal">
                  Publicá tus materiales reciclables clasificados por categoría (plásticos, vidrios, papeles, etc.).
                </p>
              </div>

              {/* Paso 2 */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs mb-1">
                  <span className="text-base">📍</span>
                  <span>2. Geolocalización</span>
                </div>
                <p className="text-[11px] text-gray-500 m-0 leading-normal">
                  Conectá con puntos de acopio y recolectores cercanos usando mapas en tiempo real.
                </p>
              </div>

              {/* Paso 3 */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs mb-1">
                  <span className="text-base">✅</span>
                  <span>3. Certificación</span>
                </div>
                <p className="text-[11px] text-gray-500 m-0 leading-normal">
                  Gestores verifican la calidad y compactado de fardos para su procesamiento industrial.
                </p>
              </div>

              {/* Paso 4 */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs mb-1">
                  <span className="text-base">🌍</span>
                  <span>4. Impacto Real</span>
                </div>
                <p className="text-[11px] text-gray-500 m-0 leading-normal">
                  Sumá puntos de impacto ambiental y reducí la huella de carbono en tu comunidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-[#0F6E56] hover:bg-[#0c5946] active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            ¡Entendido! Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
