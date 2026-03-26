'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  direccion?: string;
}

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch {
        setError('No se pudo cargar el usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-200">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-500">{error || 'Usuario no encontrado'}</p>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Perfil de Usuario</h1>

          <div className="space-y-3">
            <p><strong>Nombre:</strong> {user.nombre}</p>
            <p><strong>Correo:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.rol}</p>
            <p><strong>Teléfono:</strong> {user.telefono || 'No registrado'}</p>
            <p><strong>Dirección:</strong> {user.direccion || 'No registrada'}</p>
          </div>
        </div>
      </div>
    </>
  );
}
