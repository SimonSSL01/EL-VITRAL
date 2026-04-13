import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getStockColumn } from '@/lib/productStock';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const movimientos = await query(`
    SELECT
      i.id,
      i.producto_id,
      p.nombre AS producto_nombre,
      i.cantidad,
      i.tipo_movimiento,
      i.descripcion,
      i.pedido_id,
      u.nombre AS usuario_nombre,
      i.fecha_movimiento
    FROM inventario i
    LEFT JOIN productos p ON p.id = i.producto_id
    LEFT JOIN usuarios u ON u.id = i.usuario_id
    ORDER BY i.fecha_movimiento DESC
  `);

  return NextResponse.json(movimientos);
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { producto_id, cantidad, descripcion } = await request.json();

  if (!producto_id || cantidad == null || cantidad <= 0) {
    return NextResponse.json({ error: 'Producto y cantidad válidos son requeridos' }, { status: 400 });
  }

  const stockColumn = await getStockColumn();
  const productos = await query(`SELECT id, ${stockColumn} AS stock FROM productos WHERE id = ?`, [producto_id]);
  const producto = (productos as any[])[0];

  if (!producto) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  const nuevoStock = Number(producto.stock || 0) + Number(cantidad);

  await query(
    `UPDATE productos SET ${stockColumn} = ? WHERE id = ?`,
    [nuevoStock, producto_id]
  );

  await query(
    `INSERT INTO inventario (producto_id, cantidad, tipo_movimiento, descripcion, usuario_id)
     VALUES (?, ?, 'entrada', ?, ?)`,
    [producto_id, cantidad, descripcion || 'Entrada de inventario', (user as any).id]
  );

  return NextResponse.json({ message: 'Movimiento de inventario registrado' });
}
