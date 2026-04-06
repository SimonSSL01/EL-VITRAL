import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, generateToken, hashPassword } from '@/lib/auth';

async function verifyRecaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY || '';
  if (!secret) return false;

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    { method: 'POST' }
  );

  const data = await response.json();
  return data?.success;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, recaptchaToken } = await request.json();

    if (!recaptchaToken) {
      return NextResponse.json({ error: 'Captcha no proporcionado' }, { status: 400 });
    }

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: 'Captcha inválido' }, { status: 400 });
    }

    const users = await query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = (users as any[])[0];
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    let valid = false;
    if (user.password && user.password.startsWith('$2')) {
      valid = await comparePassword(password, user.password);
    } else {
      // Usuario creado manualmente con contraseña en texto plano (p.ej. phpMyAdmin)
      valid = password === user.password;
      if (valid) {
        const hashed = await hashPassword(password);
        await query('UPDATE usuarios SET password = ? WHERE id = ?', [hashed, user.id]);
      }
    }

    if (!valid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    if (user.rol === 'admin' && !user.aprobado) {
      return NextResponse.json({ error: 'Cuenta de administrador pendiente de aprobación' }, { status: 403 });
    }

    const token = generateToken({ id: user.id, email: user.email, rol: user.rol });
    const response = NextResponse.json({ message: 'Login exitoso', user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}