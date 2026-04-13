import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      if (decoded.rol !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
