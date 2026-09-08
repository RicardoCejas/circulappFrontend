// Este componente representa el logo de la aplicación en la barra de navegación. Es un botón que, al hacer clic, ejecuta la 
// función onClick pasada como prop. 
// El logo incluye un icono de reciclaje y el nombre de la aplicación "CirculApp" con un subtítulo "Gestión circular". 

// POSIBLE CAMBIO PORQUE NO ME GUSTO

import BrandLogo from "../../../common/BrandLogo";

function Logo({ onClick }) {
  return (
    <div className="flex items-center">
      <BrandLogo
        variant="full"
        size="md"
        onClick={onClick}
        className="py-0.5 px-1 rounded-xl hover:bg-emerald-50/60 transition-colors"
      />
    </div>
  );
}

export default Logo;