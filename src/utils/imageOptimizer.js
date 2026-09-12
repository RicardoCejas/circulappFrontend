/**
 * Optimiza URLs de imágenes de Cloudinary inyectando transformaciones automáticas:
 * - f_auto: Formato WebP / AVIF según soporte del navegador
 * - q_auto: Compresión visualmente sin pérdidas
 * - w_{width}: Escala exacta según display
 * - c_{crop}: Modo de ajuste (limit preserva aspecto sin recortar)
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url || '';

  const { width = 450, crop = 'limit', quality = 'auto', format = 'auto' } = options;

  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    if (
      url.includes('/image/upload/f_auto') ||
      url.includes('/image/upload/w_') ||
      url.includes('/image/upload/q_auto')
    ) {
      return url;
    }

    const transform = 'f_' + format + ',q_' + quality + ',w_' + width + ',c_' + crop;
    return url.replace('/image/upload/', '/image/upload/' + transform + '/');
  }

  return url;
}

export default getOptimizedImageUrl;
