import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);

  if (!user || (user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { estado } = body;

    if (!estado) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
    }

    const pedidos = await query('SELECT * FROM pedidos WHERE id = ?', [id]);
    const pedido = (pedidos as any[])[0];

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    if (estado === 'en_proceso' && pedido.estado !== 'en_proceso') {

      const detalles = await query(
        'SELECT * FROM cotizacion_detalles WHERE cotizacion_id = ?',
        [pedido.cotizacion_id]
      );

      for (const item of detalles as any[]) {

        const stockResult = await query(`
          SELECT COALESCE(SUM(
            CASE 
              WHEN tipo_movimiento = 'entrada' THEN cantidad
              WHEN tipo_movimiento = 'salida' THEN -cantidad
            END
          ), 0) AS stock
          FROM inventario
          WHERE producto_id = ?
        `, [item.producto_id]);

        const stockActual = (stockResult as any[])[0].stock;

        if (stockActual < item.cantidad) {
          return NextResponse.json({
            error: `Stock insuficiente para producto ID ${item.producto_id}`
          }, { status: 400 });
        }
      }

      for (const item of detalles as any[]) {
        await query(
          `INSERT INTO inventario 
          (producto_id, cantidad, tipo_movimiento, descripcion, pedido_id, usuario_id)
          VALUES (?, ?, 'salida', ?, ?, ?)`,
          [
            item.producto_id,
            item.cantidad,
            `Salida por pedido #${id}`,
            id,
            pedido.usuario_id
          ]
        );
      }
    }

    await query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, id]
    );

    return NextResponse.json({ message: 'Estado actualizado correctamente' });

  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    return NextResponse.json(
      { error: 'Error al actualizar pedido' },
      { status: 500 }
    );
  }
}