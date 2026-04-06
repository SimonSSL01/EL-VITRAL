'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!siteKey) {
      setError('Captcha no está configurado. Define NEXT_PUBLIC_RECAPTCHA_SITE_KEY.');
      setLoading(false);
      return;
    }

    if (!recaptchaToken) {
      setError('Por favor, completa el captcha antes de continuar.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Inicio exitoso');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1200);
      } else {
        setError(data.error || 'Error al iniciar sesión');
        setRecaptchaToken(null);
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        <div className="mb-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base mr-1">arrow_back</span>
            Volver al inicio
          </Link>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-primary">
          Iniciar Sesión
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                  sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                  sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div></div>
              <div className="text-sm">
                <Link
                  href="/olvide-password"
                  className="font-medium text-primary hover:text-secondary"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Captcha
              </div>
              {siteKey ? (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={siteKey}
                    onChange={(token) => setRecaptchaToken(token)}
                  />
                </div>
              ) : (
                <div className="rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-yellow-800">
                  Captcha no configurado. Añade <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> en tu archivo de entorno.
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !siteKey}
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white 
                bg-primary hover:bg-secondary 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary 
                disabled:opacity-50 transition"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/registro"
                  className="font-medium text-primary hover:text-secondary"
                >
                  Regístrate
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}