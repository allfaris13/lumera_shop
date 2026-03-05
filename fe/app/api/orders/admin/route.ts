import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:500';
    const response = await fetch(`${backendBase}/api/orders/admin`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      // Forward the error status and message from the backend
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Backend request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in /api/orders/admin route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}