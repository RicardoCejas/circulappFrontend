// Este componente representa la barra de navegación de la aplicación. Utiliza el contexto de autenticación para obtener información 
// sobre el usuario actual y su rol, y renderiza los elementos de navegación correspondientes según los permisos del usuario. 
// También maneja la navegación entre rutas y la funcionalidad de cierre de sesión.

import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthContext from "../../../contexts/AuthContext";

import Logo from "./components/Logo";
import DesktopMenu from "./components/DesktopMenu";
import MobileMenu from "./components/MobileMenu";
import ProfileButton from "./components/ProfileButton";
import ProfileDropdown from "./components/ProfileDropdown";
import NotificationBell from "./components/NotificationBell";

import { NAVBAR_LINKS } from "./data/navbarLinks";

import DevRoleSwitcher from "../../dev/DevRoleSwitcher";

const Navbar = () => {
  const { user, logout, openAuthModal } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/search");
  };

  // Enlaces para usuario autenticado
  const navItems = user
    ? NAVBAR_LINKS.filter((item) => !item.roles || item.roles.includes(user.role))
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/15 bg-background-paper/90 backdrop-blur-md shadow-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5">
        <Logo onClick={() => navigate("/search")} />

        {/* Menú para usuarios autenticados */}
        {user && (
          <DesktopMenu
            navItems={navItems}
            pathname={location.pathname}
            navigate={navigate}
          />
        )}

        {/* Navegación central simplificada para invitados */}
        {!user && (
          <nav className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/search")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                location.pathname === "/search" || location.pathname === "/"
                  ? "bg-emerald-50 text-emerald-800 font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
              }`}
            >
              Explorar Catálogo
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("login", "Para publicar un material reciclable debes iniciar sesión")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Publicar
            </button>
          </nav>
        )}

        {/* Lado derecho del header */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <DevRoleSwitcher />

            <div className="relative">
              <ProfileButton
                user={user}
                showProfileMenu={showProfileMenu}
                setShowProfileMenu={setShowProfileMenu}
              />

              {showProfileMenu && (
                <ProfileDropdown
                  user={user}
                  navigate={navigate}
                  handleLogout={handleLogout}
                  closeMenu={() => setShowProfileMenu(false)}
                />
              )}
            </div>

            {/* Botón de Feedback Superior Derecho (Inmediatamente a la derecha del perfil) */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-feedback-modal"))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#E1F5EE] hover:bg-[#d0f0e4] text-[#0F6E56] text-xs font-bold border border-[#A3E0CB] hover:border-[#0F6E56] shadow-2xs transition-all active:scale-95 cursor-pointer flex-shrink-0"
              title="¡Tus Comentarios! Ayúdanos a mejorar"
            >
              <i className="ti ti-speakerphone text-sm sm:text-base text-[#0F6E56]" aria-hidden="true" />
              <span className="hidden md:inline">¡Tus Comentarios!</span>
              <span className="inline md:hidden">Feedback</span>
            </button>
          </div>
        ) : (
          /* Header para Invitados */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Saludo Invitado */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold select-none">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>¡Hola, Invitado!</span>
            </div>

            {/* Botón Iniciar Sesión */}
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-gray-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 rounded-xl border border-gray-300 hover:border-emerald-400 transition-all cursor-pointer shadow-2xs"
            >
              Iniciar sesión
            </button>

            {/* Botón Crear Cuenta */}
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#0F6E56] hover:bg-[#0c5946] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Crear cuenta
            </button>

            {/* Botón de Feedback Invitados */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-feedback-modal"))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#E1F5EE] hover:bg-[#d0f0e4] text-[#0F6E56] text-xs font-bold border border-[#A3E0CB] hover:border-[#0F6E56] shadow-2xs transition-all active:scale-95 cursor-pointer flex-shrink-0"
              title="¡Tus Comentarios! Ayúdanos a mejorar"
            >
              <i className="ti ti-speakerphone text-sm sm:text-base text-[#0F6E56]" aria-hidden="true" />
              <span className="hidden md:inline">¡Tus Comentarios!</span>
              <span className="inline md:hidden">Feedback</span>
            </button>
          </div>
        )}
      </div>

      {user && (
        <MobileMenu
          navItems={navItems}
          pathname={location.pathname}
          navigate={navigate}
        />
      )}
    </header>
  );
};

export default Navbar;
