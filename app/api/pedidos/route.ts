import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getStockColumn } from '@/lib/productStock';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const pedidos = await query(
    'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha_pedido DESC',
    [(user as any).id]
  );
  return NextResponse.json(pedidos);
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { cotizacion_id, fecha_entrega } = await request.json();

  const cotizaciones = await query('SELECT * FROM cotizaciones WHERE id = ?', [cotizacion_id]);
  const cotizacion = (cotizaciones as any[])[0];
  if (!cotizacion) {
    return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
  }

  if (cotizacion.usuario_id && cotizacion.usuario_id !== (user as any).id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const result = await query(
    `INSERT INTO pedidos (cotizacion_id, usuario_id, fecha_entrega, total, estado) 
     VALUES (?, ?, ?, ?, 'pendiente')`,
    [cotizacion_id, (user as any).id, fecha_entrega, cotizacion.total]
  );

  const pedidoId = (result as any).insertId;

  await query('UPDATE cotizaciones SET estado = "convertida" WHERE id = ?', [cotizacion_id]);

  const detalles = await query('SELECT * FROM cotizacion_detalles WHERE cotizacion_id = ?', [cotizacion_id]);
  const stockColumn = await getStockColumn();

  for (const detalle of detalles as any[]) {
    const productoRows = await query(`SELECT id, ${stockColumn} AS stock FROM productos WHERE id = ?`, [detalle.producto_id]);
    const producto = (productoRows as any[])[0];

    if (!producto) continue;

    const cantidad = Number(detalle.cantidad) || 0;
    const nuevoStock = Math.max(Number(producto.stock || 0) - cantidad, 0);

    await query(
      `UPDATE productos SET ${stockColumn} = ? WHERE id = ?`,
      [nuevoStock, detalle.producto_id]
    );

    await query(
      `INSERT INTO inventario (producto_id, cantidad, tipo_movimiento, descripcion, pedido_id, usuario_id)
       VALUES (?, ?, 'salida', ?, ?, ?)`,
      [detalle.producto_id, cantidad, `Salida por pedido ${pedidoId}`, pedidoId, (user as any).id]
    );
  }

  return NextResponse.json({ message: 'Pedido creado', id: pedidoId });
}