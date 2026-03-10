import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const backendBase = 'http://localhost:5000';
        const response = await fetch(`${backendBase}/api/products/${id}`);
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const backendBase = 'http://localhost:5000';
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
        const backendBase = 'http://localhost:5000';
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
