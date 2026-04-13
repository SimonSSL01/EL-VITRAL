import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getStockColumn } from '@/lib/productStock';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('PATCH request for product');
  const { id } = await params;
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      nombre,
      descripcion,
      tipo,
      unidad_medida,
      precio_base,
      imagen_url,
      stock,
      activo,
    } = body;

    if (!nombre || !descripcion || !tipo || !unidad_medida || precio_base == null || stock == null) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    const stockColumn = await getStockColumn();

    await query(
      `UPDATE productos SET nombre = ?, descripcion = ?, tipo = ?, unidad_medida = ?, precio_base = ?, imagen_url = ?, ${stockColumn} = ?, activo = ? WHERE id = ?`,
      [nombre, descripcion, tipo, unidad_medida, precio_base, imagen_url, stock, activo ? 1 : 0, parseInt(id)]
    );

    return NextResponse.json({ message: 'Producto actualizado' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    await query(
      'UPDATE productos SET activo = false WHERE id = ?',
      [parseInt(id)]
    );

    return NextResponse.json({ message: 'Producto desactivado' });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}