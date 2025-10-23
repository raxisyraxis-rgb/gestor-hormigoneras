import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TruckIcon } from './icons';
import Spinner from './Spinner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('cliente@test.com');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Fallo al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (role: 'client' | 'worker' | 'owner') => {
      if (role === 'client') {
          setEmail('cliente@test.com');
      } else if (role === 'worker') {
          setEmail('trabajador@test.com');
      } else {
          setEmail('admin@test.com');
      }
      setPassword('1234');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <TruckIcon className="mx-auto h-12 w-12 text-sky-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Gestor de Hormigoneras
            </h1>
            <p className="text-slate-500">Inicia sesión para continuar</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-600"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-600"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300"
            >
              {loading ? <Spinner /> : 'Iniciar Sesión'}
            </button>
          </form>
          <div className="text-center text-sm text-slate-500 pt-4 border-t">
              <p className="font-semibold mb-2">Usar credenciales de prueba:</p>
              <div className="flex justify-center space-x-2">
                  <button onClick={() => setCredentials('client')} className="text-sky-600 hover:underline">Cliente</button>
                  <span>|</span>
                  <button onClick={() => setCredentials('worker')} className="text-sky-600 hover:underline">Trabajador</button>
                  <span>|</span>
                  <button onClick={() => setCredentials('owner')} className="text-sky-600 hover:underline">Admin</button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;