import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user || (user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
const productos = await query(`
  SELECT 
    p.id,
    p.nombre,
    p.tipo,
    p.descripcion,
    p.imagen_url,
    p.unidad_medida,
    p.precio_base,
    p.stock_minimo,
    p.activo,

    COALESCE(SUM(
      CASE 
        WHEN i.tipo_movimiento = 'entrada' THEN i.cantidad
        WHEN i.tipo_movimiento = 'salida' THEN -i.cantidad
        ELSE 0
      END
    ), 0) AS stock_actual

  FROM productos p
  LEFT JOIN inventario i ON p.id = i.producto_id
  GROUP BY p.id
  ORDER BY p.nombre ASC
`);

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}