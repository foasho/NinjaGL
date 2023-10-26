import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('filePath') as string;
 
  const blob = await put(filePath, request.body!, {
    access: 'public',
  });
 
  return NextResponse.json(blob);
}