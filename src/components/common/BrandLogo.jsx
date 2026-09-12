import fullLogo from '../../assets/logo-full.webp';
import symbolLogo from '../../assets/logo-isotipo.webp';

/**
 * BrandLogo - Componente maestro de identidad visual para ComunaRed
 * 
 * Variantes:
 * - 'full': Imagotipo completo ("Comuna Red - Comunidad Circular")
 * - 'symbol': Isotipo / Favicon únicamente (hoja + persona + casa)
 * - 'responsive': Isotipo en pantallas móviles pequeñas (<sm), Imagotipo completo en pantallas medianas y grandes (>=sm)
 * - 'combo': Isotipo gráfico + tipografía semántica SVG/HTML estilizada
 */
export default function BrandLogo({
  variant = 'full',
  size = 'md',
  className = '',
  imgClassName = '',
  showTagline = true,
  onClick,
}) {
  const sizeMap = {
    xs: {
      symbol: 'h-7 w-auto',
      full: 'h-8 w-auto',
      container: 'gap-1.5',
      text: 'text-sm',
      tagline: 'text-[9px]',
    },
    sm: {
      symbol: 'h-9 w-auto',
      full: 'h-11 w-auto',
      container: 'gap-2',
      text: 'text-base',
      tagline: 'text-[10px]',
    },
    md: {
      symbol: 'h-11 sm:h-12 w-auto',
      full: 'h-12 sm:h-13 md:h-14 w-auto',
      container: 'gap-2.5',
      text: 'text-lg',
      tagline: 'text-xs',
    },
    lg: {
      symbol: 'h-16 w-auto',
      full: 'h-20 w-auto',
      container: 'gap-3',
      text: 'text-2xl',
      tagline: 'text-sm',
    },
    xl: {
      symbol: 'h-22 w-auto',
      full: 'h-28 w-auto',
      container: 'gap-3.5',
      text: 'text-3xl',
      tagline: 'text-base',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (() => {
    switch (variant) {
      case 'symbol':
        return (
          <img
            src={symbolLogo}
            alt="ComunaRed"
            width="48"
            height="48"
            className={`${currentSize.symbol} object-contain transition-transform duration-200 group-hover:scale-105 ${imgClassName}`}
            loading="eager"
            decoding="async"
          />
        );

      case 'full':
        return (
          <img
            src={fullLogo}
            alt="ComunaRed · Comunidad Circular"
            width="180"
            height="56"
            className={`${currentSize.full} object-contain transition-transform duration-200 group-hover:scale-105 ${imgClassName}`}
            loading="eager"
            decoding="async"
          />
        );

      case 'responsive':
        return (
          <picture className="inline-flex items-center">
            <source media="(min-width: 640px)" srcSet={fullLogo} width="180" height="56" />
            <img
              src={symbolLogo}
              alt="ComunaRed · Comunidad Circular"
              width="48"
              height="48"
              className={`${currentSize.symbol} sm:${currentSize.full} object-contain transition-transform duration-200 group-hover:scale-105 ${imgClassName}`}
              loading="eager"
              decoding="async"
            />
          </picture>
        );

      case 'combo':
      default:
        return (
          <div className={`flex items-center ${currentSize.container}`}>
            <img
              src={symbolLogo}
              alt="ComunaRed Isotipo"
              width="48"
              height="48"
              className={`${currentSize.symbol} object-contain transition-transform duration-200 group-hover:scale-105 ${imgClassName}`}
              loading="eager"
              decoding="async"
            />
            <div className="flex flex-col text-left leading-none">
              <span className={`font-black tracking-tight text-gray-900 ${currentSize.text}`}>
                <span className="text-emerald-700">Comuna</span>
                <span className="text-amber-500">Red</span>
              </span>
              {showTagline && (
                <span className={`font-semibold tracking-wider text-emerald-800/80 uppercase mt-0.5 ${currentSize.tagline}`}>
                  Comunidad Circular
                </span>
              )}
            </div>
          </div>
        );
    }
  })();

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group inline-flex items-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl transition-opacity hover:opacity-95 ${className}`}
        aria-label="Ir al inicio de ComunaRed"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {content}
    </div>
  );
}
