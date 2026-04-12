import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('PATCH request for product');
  const { id } = await params;

  try {
    const body = await request.json();
    console.log('Request body:', body);

    const {
      nombre,
      descripcion,
      tipo,
      imagen_url,
      unidad_medida,
      precio_base,
      stock_minimo
    } = body;

    if (!nombre || !descripcion) {
      return NextResponse.json(
        { error: 'Nombre y descripción son requeridos' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE productos 
       SET nombre = ?, descripcion = ?, tipo = ?, imagen_url = ?, unidad_medida = ?, precio_base = ?, stock_minimo = ?
       WHERE id = ?`,
      [
        nombre,
        descripcion,
        tipo,
        imagen_url,
        unidad_medida,
        precio_base,
        stock_minimo,
        parseInt(id)
      ]
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