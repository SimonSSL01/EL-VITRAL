import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('PATCH request to enable product');
  const { id } = await params;
  const user = getUserFromRequest(request);

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    console.log('Executing query to enable product:', id);
    await query(
      'UPDATE productos SET activo = true WHERE id = ?',
      [parseInt(id)]
    );
    console.log('Product enabled successfully');

    return NextResponse.json({ message: 'Producto habilitado' });
  } catch (error) {
    console.error('Error al habilitar producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}