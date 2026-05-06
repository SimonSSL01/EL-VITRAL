import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const users = await query('SELECT id, nombre, email, telefono, direccion, rol FROM usuarios WHERE id = ?', [(user as any).id]);
  const userData = (users as any[])[0];
  return NextResponse.json(userData);
}

export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { nombre, email, telefono, direccion } = body;

  if (!nombre || !email) {
    return NextResponse.json({ error: 'Nombre y correo son obligatorios.' }, { status: 400 });
  }

  try {
    await query(
      'UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre, email, telefono || null, direccion || null, (user as any).id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el perfil.' }, { status: 500 });
  }
}