import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                imageUrl: true,
            },
        });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // Add rating aggregates
        const ratingAgg = await prisma.rating.aggregate({
            where: { productId },
            _avg: { value: true },
            _count: { _all: true }
        });

        const avgRating = ratingAgg._avg?.value || 0;
        const ratingCount = ratingAgg._count?._all || 0;

        return NextResponse.json({
            ...product,
            averageRating: Math.round((avgRating + Number.EPSILON) * 100) / 100,
            ratingCount
        });
    } catch (error: any) {
        console.error('Error fetching product from DB:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const backendBase = 'http://127.0.0.1:5000';
        const response = await fetch(`${backendBase}/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const backendBase = 'http://127.0.0.1:5000';
        const response = await fetch(`${backendBase}/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': request.headers.get('Authorization') || '',
            },
        });

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await response.json().catch(() => ({ message: 'Deleted' }));
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy DELETE error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
