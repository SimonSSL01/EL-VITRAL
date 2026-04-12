'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

interface Producto {
  id: number;
  nombre: string;
  tipo?: string;
  descripcion: string;
  imagen_url?: string;
  unidad_medida?: string;
  precio_base?: number;
  stock_minimo?: number;
  stock_actual?: number;
  activo: boolean;
}

function ModalProducto({ producto, onClose, onUpdate }) {
  const [form, setForm] = useState(producto);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const guardar = async () => {
    try {
      const res = await fetch(`/api/admin/productos/${producto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al editar');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const eliminar = async () => {
    try {
      const res = await fetch(`/api/admin/productos/${producto.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#1e2939] p-6 rounded-lg w-[500px] text-white">

        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Detalle del producto</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="grid gap-3">

          <input
            value={form.nombre}
            onChange={e => handleChange('nombre', e.target.value)}
            className="bg-[#101828] p-2 rounded"
            placeholder="Nombre"
          />

          <input
            value={form.descripcion}
            onChange={e => handleChange('descripcion', e.target.value)}
            className="bg-[#101828] p-2 rounded"
            placeholder="Descripcion"
          />

          <input
            value={form.tipo || ''}
            onChange={e => handleChange('tipo', e.target.value)}
            className="bg-[#101828] p-2 rounded"
            placeholder="Tipo"
          />

          <input
            value={form.unidad_medida || ''}
            onChange={e => handleChange('unidad_medida', e.target.value)}
            className="bg-[#101828] p-2 rounded"
            placeholder="Unidad"
          />

          <input
            type="number"
            value={form.precio_base || ''}
            onChange={e => handleChange('precio_base', e.target.value)}
            className="bg-[#101828] p-2 rounded"
            placeholder="Precio"
          />

          <input
            type="number"
            value={form.stock_minimo || ''}
            onChange={e => handleChange('stock_minimo', e.target.value)}
            className="bg-[#101828] p-2 rounded"
            placeholder="Stock mínimo"
          />

          <input
            value={form.imagen_url || ''}
            onChange={e => handleChange('imagen_url', e.target.value)}
            className="bg-[#101828] p-2 rounded"
            placeholder="URL imagen"
          />

        </div>

        <div className="flex justify-between mt-5">

          <button
            onClick={guardar}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Confirmar cambios
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-red-400"
            >
              Eliminar
            </button>
          ) : (
            <button
              onClick={eliminar}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Confirmar eliminación
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/admin/productos', { credentials: 'include' });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message = errorData?.error || `${res.status}`;
        setError(`No autorizado: ${message}`);
        setProductos([]);
        return;
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        setError('Datos inválidos');
        setProductos([]);
        return;
      }

      setProductos(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#101828'}}>
        <NavBar />
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-xl">Cargando Productos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#101828' }}>
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-12">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Gestión de Productos</h1>
          <Link href="/admin" className="text-blue-400">
            Volver
          </Link>
        </div>

        <div className="mb-4">
          {productos.map(p => {
            if (p.stock_actual <= p.stock_minimo) {
              return (
                <div key={p.id} className="text-red-500">
                  ⚠️ {p.nombre} stock crítico ({p.stock_actual})
                </div>
              );
            }
            if (p.stock_actual <= (p.stock_minimo || 0) + 10) {
              return (
                <div key={p.id} className="text-yellow-400">
                  ⚠️ {p.nombre} stock bajo ({p.stock_actual})
                </div>
              );
            }
            return null;
          })}
        </div>

        {error ? (
          <div className="bg-red-900/30 border border-red-500 p-6 text-red-200">
            {error}
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1e2939'}}>
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-300">Producto</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {productos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/50">

                    <td className="px-6 py-4 flex items-center gap-3">
                      {p.imagen_url && (
                        <img src={p.imagen_url} className="w-10 h-10 rounded object-cover" />
                      )}
                      {p.nombre}
                    </td>

                    <td>{p.tipo}</td>
                    <td>${p.precio_base}</td>
                    <td>{p.stock_actual}</td>

                    <td
                      style={{
                        color:
                          p.stock_actual <= p.stock_minimo ? 'red' :
                          p.stock_actual <= (p.stock_minimo || 0) + 10 ? 'yellow' :
                          'lightgreen'
                      }}
                    >
                      ●
                    </td>

                    <td>
                      <button
                        onClick={() => setProductoSeleccionado(p)}
                        className="text-blue-400"
                      >
                        Editar
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {productoSeleccionado && (
        <ModalProducto
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
          onUpdate={fetchProductos}
        />
      )}

    </div>
  );
}