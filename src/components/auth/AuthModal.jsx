import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import CircularIllustration from './CircularIllustration';
import AboutCirculappModal from './AboutCirculappModal';
import BrandLogo from '../common/BrandLogo';
import MailIcon from '../../pages/auth/icons/MailIcon';
import LockIcon from '../../pages/auth/icons/LockIcon';
import EyeIcon from '../../pages/auth/icons/EyeIcon';
import UserIcon from '../../pages/auth/icons/UserIcon';
import ArrowRightIcon from '../../pages/auth/icons/ArrowRightIcon';
import { XMarkIcon } from '@heroicons/react/24/outline';

const fieldClasses = `
  flex items-center gap-2.5
  rounded-xl
  border border-gray-300
  bg-gray-50/50
  px-3.5 py-2.5
  transition-all duration-200
  focus-within:border-emerald-600
  focus-within:bg-white
  focus-within:ring-3
  focus-within:ring-emerald-600/10
`;

const inputClasses = `
  min-w-0 flex-1
  border-none
  bg-transparent
  text-sm
  text-gray-800
  outline-none
  placeholder:text-gray-400
`;

const labelClasses = `
  mb-1 block
  text-[11px]
  font-bold
  uppercase
  tracking-[0.06em]
  text-gray-500
`;

export default function AuthModal() {
  const {
    user,
    authModalOpen,
    authModalTab,
    authModalPrompt,
    openAuthModal,
    closeAuthModal,
    continueAsGuest,
    login,
    register
  } = useContext(AuthContext);

  const [showAboutModal, setShowAboutModal] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (user || !authModalOpen) return null;

  const isLogin = authModalTab === 'login';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
        <div className="flex flex-col items-center justify-center w-full max-w-[880px] my-auto">
          {/* Main Unified Dual-Pane Card */}
          <div className="relative w-full bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-slide-up border border-gray-100">
            {/* Close Button on top-right */}
            <button
              type="button"
              onClick={continueAsGuest}
              className="absolute top-3.5 right-3.5 z-30 p-2 text-gray-400 hover:text-gray-700 bg-gray-100/90 hover:bg-gray-200 rounded-full transition-colors cursor-pointer shadow-xs"
              title="Cerrar y continuar como invitado"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Left Column (Circular Illustration) */}
            <div className="hidden md:block md:col-span-5 h-full">
              <CircularIllustration onOpenAbout={() => setShowAboutModal(true)} />
            </div>

            {/* Right Column (Auth Form) */}
            <div className="col-span-1 md:col-span-7 p-6 sm:p-8 md:p-9 flex flex-col justify-center">
              {/* Logo Badge */}
              <div className="flex justify-center mb-3">
                <BrandLogo variant="symbol" size="lg" />
              </div>

              {/* Title & Subtitle */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  {isLogin ? 'Bienvenido' : 'Crear cuenta'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 m-0 mt-1">
                  {isLogin ? (
                    <>
                      Inicia sesión en <span className="font-bold text-[#0F6E56]">ComunaRed</span>
                    </>
                  ) : (
                    <>
                      Únete a <span className="font-bold text-[#0F6E56]">ComunaRed</span>
                    </>
                  )}
                </p>

                {/* Prompt context if opened from action */}
                {authModalPrompt && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    🔒 {authModalPrompt}
                  </div>
                )}
              </div>

              {/* Error Box */}
              {error && (
                <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              {isLogin ? (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                  {/* Correo Electrónico */}
                  <div>
                    <label className={labelClasses}>Correo electrónico</label>
                    <div className={fieldClasses}>
                      <span className="text-gray-400"><MailIcon /></span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@correo.com"
                        required
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelClasses}>Contraseña</label>
                      <Link
                        to="/forgot-password"
                        onClick={closeAuthModal}
                        className="text-xs text-[#0F6E56] hover:underline font-medium"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className={fieldClasses}>
                      <span className="text-gray-400"><LockIcon /></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={inputClasses}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer p-0 bg-transparent border-none"
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Recordar */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      id="modalRememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#0F6E56] focus:ring-[#0F6E56] cursor-pointer"
                    />
                    <label htmlFor="modalRememberMe" className="text-xs text-gray-600 cursor-pointer select-none font-medium">
                      Recordar mi correo y datos de acceso
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F6E56] to-[#16a085] hover:opacity-95 active:scale-[0.98] py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    {!isLoading && <ArrowRightIcon />}
                  </button>

                  {/* Toggle to Register */}
                  <div className="text-center pt-1 text-xs text-gray-500">
                    ¿No tenés cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => { setError(''); openAuthModal('register', authModalPrompt); }}
                      className="font-bold text-[#0F6E56] hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Registrate
                    </button>
                  </div>

                  {/* Separator & Guest Access */}
                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-2 text-gray-400 font-medium">o</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={continueAsGuest}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-800 bg-gray-100/90 hover:bg-emerald-50/80 py-2.5 px-4 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-150 cursor-pointer"
                  >
                    <span>Continuar como invitado</span>
                    <span>→</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2.5">
                  {/* Nombre */}
                  <div>
                    <label className={labelClasses}>Nombre completo</label>
                    <div className={fieldClasses}>
                      <span className="text-gray-400"><UserIcon /></span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre"
                        required
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label className={labelClasses}>Correo electrónico</label>
                    <div className={fieldClasses}>
                      <span className="text-gray-400"><MailIcon /></span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@correo.com"
                        required
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Contraseña con indicador de fortaleza */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClasses}>Contraseña</label>
                      {password.length > 0 && (() => {
                        const hasMinLength = password.length >= 8;
                        const hasUpper = /[A-Z]/.test(password);
                        const hasNumber = /[0-9]/.test(password);
                        const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_=+\\[\]~`]/.test(password);
                        const score = [hasMinLength, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
                        const strengthMap = [
                          { label: 'Débil', text: 'text-red-600' },
                          { label: 'Débil', text: 'text-red-600' },
                          { label: 'Regular', text: 'text-orange-600' },
                          { label: 'Buena', text: 'text-amber-600' },
                          { label: 'Muy Fuerte 🛡️', text: 'text-emerald-600' }
                        ];
                        const s = strengthMap[score] || strengthMap[0];
                        return (
                          <span className={`text-[11px] font-bold ${s.text}`}>
                            Seguridad: {s.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className={fieldClasses}>
                      <span className="text-gray-400"><LockIcon /></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={inputClasses}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer p-0 bg-transparent border-none"
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>

                    {/* Barra de fortaleza de contraseña */}
                    {password.length > 0 && (() => {
                      const hasMinLength = password.length >= 8;
                      const hasUpper = /[A-Z]/.test(password);
                      const hasNumber = /[0-9]/.test(password);
                      const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_=+\\[\]~`]/.test(password);
                      const score = [hasMinLength, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
                      const config = [
                        { percent: '20%', bg: 'bg-red-500' },
                        { percent: '25%', bg: 'bg-red-500' },
                        { percent: '50%', bg: 'bg-orange-500' },
                        { percent: '75%', bg: 'bg-amber-500' },
                        { percent: '100%', bg: 'bg-emerald-500' }
                      ][score] || { percent: '20%', bg: 'bg-red-500' };

                      return (
                        <div className="mt-1.5">
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${config.bg}`}
                              style={{ width: config.percent }}
                            />
                          </div>

                          <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] text-gray-500">
                            <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                              <span>{hasMinLength ? '✓' : '○'}</span> 8+ caracteres
                            </div>
                            <div className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                              <span>{hasUpper ? '✓' : '○'}</span> Una mayúscula (A-Z)
                            </div>
                            <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                              <span>{hasNumber ? '✓' : '○'}</span> Un número (0-9)
                            </div>
                            <div className={`flex items-center gap-1 ${hasSymbol ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                              <span>{hasSymbol ? '✓' : '○'}</span> Un símbolo (!@#$...)
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <label className={labelClasses}>Confirmar contraseña</label>
                    <div className={fieldClasses}>
                      <span className="text-gray-400"><LockIcon /></span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={inputClasses}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer p-0 bg-transparent border-none"
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F6E56] to-[#16a085] hover:opacity-95 active:scale-[0.98] py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                    {!isLoading && <ArrowRightIcon />}
                  </button>

                  {/* Toggle to Login */}
                  <div className="text-center pt-1 text-xs text-gray-500">
                    ¿Ya tenés una cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => { setError(''); openAuthModal('login', authModalPrompt); }}
                      className="font-bold text-[#0F6E56] hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Iniciar sesión
                    </button>
                  </div>

                  {/* Separator & Guest Access */}
                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-2 text-gray-400 font-medium">o</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={continueAsGuest}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-800 bg-gray-100/90 hover:bg-emerald-50/80 py-2.5 px-4 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-150 cursor-pointer"
                  >
                    <span>Continuar como invitado</span>
                    <span>→</span>
                  </button>
                </form>
              )}

              {/* Mobile "Sobre ComunaRed" link */}
              <div className="mt-3.5 md:hidden text-center">
                <button
                  type="button"
                  onClick={() => setShowAboutModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#0F6E56] font-semibold bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 transition-colors cursor-pointer"
                >
                  <span>ℹ️</span> ¿De qué trata ComunaRed?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informative Modal: ¿De qué trata Circulapp? */}
      <AboutCirculappModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </>
  );
}
