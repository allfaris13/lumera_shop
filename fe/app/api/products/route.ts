import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:500';
        const response = await fetch(`${backendBase}/api/products`);

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const products = await response.json();
        return NextResponse.json(products);
    } catch (error: any) {
        console.error('Error proxying products GET:', error);
        return NextResponse.json(
            { message: 'Gagal mengambil data produk dari server', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:500';

        const response = await fetch(`${backendBase}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error proxying products POST:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}