import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params; 
    const body = await request.json();
    const { estado } = body;

    if (!estado) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
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