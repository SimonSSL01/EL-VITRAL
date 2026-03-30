'use client';
import { useState } from 'react';

export default function ConsultaCotizacionPage() {
  const [codigo, setCodigo] = useState('');
  const [cotizacion, setCotizacion] = useState<any>(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const buscar = async () => {
    const res = await fetch(`/api/cotizaciones/${codigo}`);
    if (res.ok) {
      const data = await res.json();
      setCotizacion(data);
      setError('');
      setShowModal(true);
    } else {
      setError('Código no válido');
      setCotizacion(null);
      setShowModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCotizacion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Consultar cotización</h1>
        
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Ingresa tu código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={buscar}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary"
          >
            Buscar
          </button>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        {/* Modal */}
        {showModal && cotizacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Detalle de cotización</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-4">
                  <p><strong>Código:</strong> {cotizacion.codigo_unico}</p>
                  <p><strong>Cliente:</strong> {cotizacion.nombre_cliente}</p>
                  <p><strong>Email:</strong> {cotizacion.email_cliente}</p>
                  <p><strong>Fecha:</strong> {new Date(cotizacion.fecha_cotizacion).toLocaleDateString()}</p>
                </div>

                <h3 className="font-bold mb-2">Productos</h3>
                <table className="w-full mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-left">Medidas</th>
                      <th className="p-2 text-left">Cantidad</th>
                      <th className="p-2 text-left">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cotizacion.detalles?.map((det: any, i: number) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{det.descripcion}</td>
                        <td className="p-2">
                          {det.medida_largo && `${det.medida_largo}x${det.medida_ancho} cm`}
                        </td>
                        <td className="p-2">{det.cantidad}</td>
                        <td className="p-2">${det.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right">
                  <p className="text-xl font-bold text-primary">Total: ${cotizacion.total}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}