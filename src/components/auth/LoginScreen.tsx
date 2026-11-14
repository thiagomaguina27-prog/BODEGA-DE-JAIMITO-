import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Store, KeyRound, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useBodega();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor ingrese usuario y contraseña.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = login(username, password, remember);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Credenciales incorrectas');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-emerald-50 via-slate-100 to-slate-200 p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200/80">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-800 px-6 py-8 text-center text-white relative">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xs text-yellow-300 shadow-inner mb-3 border border-white/20">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              LA BODEGA DE JAIMITO
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              Sistema de Gestión Comercial y Punto de Venta (Perú)
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-semibold text-slate-800">
                Iniciar Sesión en el Sistema
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingrese sus credenciales autorizadas para acceder a la administración.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Usuario */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Usuario del Sistema
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingrese su usuario"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-hidden"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Recordar sesión */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Recordar sesión</span>
                </label>
                <span className="text-slate-400 text-[11px]">Acceso local seguro</span>
              </div>

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span>Verificando acceso...</span>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Ingresar al Sistema</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer info */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-center text-[11px] text-slate-400">
            <span>Versión 2.5 · Los Olivos, Lima · RUC 20608492011</span>
          </div>
        </div>
      </div>
    </div>
  );
};
