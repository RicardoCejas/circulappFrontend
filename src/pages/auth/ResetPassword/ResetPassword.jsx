import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import API from '../../../services/Api';
import LockIcon from '../icons/LockIcon';
import EyeIcon from '../icons/EyeIcon';

import PasswordStrengthMeter from '../../../components/common/PasswordStrengthMeter';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return setError('La contraseña debe incluir al menos una letra y un número.');
    }

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden. Por favor verifica.');
    }

    setIsLoading(true);

    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.msg || 'El enlace es inválido o ha expirado. Por favor solicita uno nuevo.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Nueva Contraseña"
      subtitle="Escribe tu nueva clave de acceso para ComunaRed"
      error={error}
    >
      {isSuccess ? (
        <div className="flex flex-col gap-5 text-center">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-semibold text-emerald-900 mb-1">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¡Contraseña restablecida!
            </div>
            <p>Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión con tu nueva clave.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex justify-center items-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark cursor-pointer"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nueva Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary"
            >
              Nueva contraseña
            </label>

            <div className="flex items-center gap-2.5 rounded-xl border border-gray-300 bg-background px-3.5 py-2.5 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <span className="flex shrink-0 text-text-secondary">
                <LockIcon />
              </span>

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className="min-w-0 flex-1 border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="flex shrink-0 cursor-pointer border-none bg-transparent p-0 text-text-secondary transition-colors hover:text-primary"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <PasswordStrengthMeter password={password} />
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary"
            >
              Confirmar nueva contraseña
            </label>

            <div className="flex items-center gap-2.5 rounded-xl border border-gray-300 bg-background px-3.5 py-2.5 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <span className="flex shrink-0 text-text-secondary">
                <LockIcon />
              </span>

              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
                className="min-w-0 flex-1 border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Actualizando contraseña...
              </>
            ) : (
              'Guardar nueva contraseña'
            )}
          </button>

          <div className="mt-3 text-center">
            <Link
              to="/login"
              className="text-xs font-medium text-text-secondary transition-colors hover:text-primary"
            >
              Cancelar y volver
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
