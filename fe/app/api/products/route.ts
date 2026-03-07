import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Mengambil semua data dari tabel product di database
    const products = await prisma.product.findMany();
    
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data produk', error: error.message },
      { status: 500 }
    );
  }
}