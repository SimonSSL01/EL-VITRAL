'use client';
import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from "next/link";
import NavBar from '@/components/NavBar';
import { useSearchParams } from 'next/navigation';

interface Producto {
    id:number;
    nombre: string;
    tipo: string;
    descripcion: string;
    imagen_url:string | null;
    unidad_medida: string;
    precio_base: number;
}

const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function CatalogoPage() {
    const searchParams = useSearchParams();
    const [productos, setProductos] =useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos');

    useEffect(() => {
        fetch('/api/productos')
        .then(res => res.json())
        .then(data => {
            setProductos(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const tipo = searchParams.get('tipo');
        const aplicacion = searchParams.get('aplicacion');
        const servicio = searchParams.get('servicio');

        if (tipo) {
            const tipoMapeado = tipo === 'templado' || tipo === 'laminado' ? 'vidrio' : tipo;
            setFiltro(tipoMapeado);
        } else if (aplicacion || servicio) {
            setFiltro('todos');
        }
    }, [searchParams]);

    const productosFiltrados = filtro === 'todos'
    ? productos
    :productos.filter(p => p.tipo === filtro);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950">
                <NavBar />
                <div className="mx-auto mt-20 max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center shadow-2xl">
                    <p className="text-slate-400 mb-4">Cargando catálogo...</p>
                    <div className="mx-auto h-2.5 w-48 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full w-24 animate-pulse bg-sky-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl mb-10">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                        <div className="max-w-2xl">
                            <p className="text-sm uppercase tracking-[0.3em] text-sky-400 mb-3">Catálogo completo</p>
                            <h1 className="text-4xl font-bold text-white mb-4">Encuentra el producto perfecto para tu proyecto</h1>
                            <p className="text-slate-400 leading-7">Explora nuestra selección de vidrios, espejos, aluminio y más. Usa filtros rápidos para ver solo lo que necesitas.</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-6 text-center">
                            <p className="text-sm text-slate-400">Productos disponibles</p>
                            <p className="mt-3 text-3xl font-bold text-white">{productos.length}</p>
                            <p className="text-slate-500 text-sm">Categorias: Vidrio, Espejo, Aluminio, Herraje, Insumos</p>
                        </div>
                    </div>
                </div>

                {(searchParams.get('tipo') || searchParams.get('aplicacion') || searchParams.get('servicio')) && (
                    <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Resultados de búsqueda</h3>
                                <div className="flex flex-wrap gap-2">
                                    {searchParams.get('tipo') && (
                                        <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm text-sky-200">Tipo: {searchParams.get('tipo')}</span>
                                    )}
                                    {searchParams.get('aplicacion') && (
                                        <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm text-sky-200">Aplicación: {searchParams.get('aplicacion')}</span>
                                    )}
                                    {searchParams.get('servicio') && (
                                        <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm text-sky-200">Servicio: {searchParams.get('servicio')}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setFiltro('todos');
                                    window.history.replaceState({}, '', '/catalogo');
                                }}
                                className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}

                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-3">Filtrar productos</h2>
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        >
                            <option value="todos">Todos</option>
                            <option value="vidrio">Vidrio</option>
                            <option value="espejo">Espejo</option>
                            <option value="aluminio">Aluminio</option>
                            <option value="herraje">Herraje</option>
                            <option value="insumo">Insumo</option>
                        </select>
                        <p className="mt-4 text-sm text-slate-400">Usa este filtro para ver los productos más relevantes según tu búsqueda.</p>
                    </div>
                    <div className="md:col-span-2 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-3">Resumen rápido</h2>
                        <p className="text-slate-400">Selecciona un producto y solicita tu cotización al instante.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {productosFiltrados.map((producto) => (
                        <div key={producto.id} className="group rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl transition hover:-translate-y-1 hover:border-sky-500">
                            <div className="relative h-72 overflow-hidden rounded-t-3xl bg-slate-800">
                                {producto.imagen_url ? (
                                    <Image
                                        src={producto.imagen_url}
                                        alt={producto.nombre}
                                        fill
                                        className="object-cover transition duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-500">
                                        <div className="text-4xl">📦</div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-semibold text-white">{producto.nombre}</h3>
                                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm text-sky-200 uppercase tracking-[0.15em]">{producto.tipo}</span>
                                </div>
                                <p className="text-slate-400 mb-5 min-h-[72px]">{producto.descripcion || 'Descripción no disponible'}</p>
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-slate-400 text-sm">Precio base</p>
                                        <p className="text-2xl font-bold text-white">${formatPrice(producto.precio_base)}</p>
                                        {producto.unidad_medida && <p className="text-xs text-slate-500">/ {producto.unidad_medida}</p>}
                                    </div>
                                    <Link
                                        href={`/cotizar?producto=${producto.id}`}
                                        className="inline-flex items-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary"
                                    >
                                        Cotizar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <p className="text-lg text-white font-semibold">¿No encuentras lo que buscas?</p>
                            <p className="text-slate-400">Podemos ayudarte a diseñar una solución a medida para tu proyecto.</p>
                        </div>
                        <a
                            className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-secondary transition"
                        >
                            📞 Llámanos: 3137928483
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}