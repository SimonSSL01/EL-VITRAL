import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getStockColumn } from '@/lib/productStock';

export async function GET() {
  const stockColumn = await getStockColumn();
  const productos = await query(
    `SELECT id, nombre, tipo, descripcion, imagen_url, unidad_medida, precio_base, ${stockColumn} AS stock
     FROM productos
     WHERE activo = true AND ${stockColumn} >= 2`
  );
  return NextResponse.json(productos);
}