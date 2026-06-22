import { NextResponse } from 'next/server';
import { searchOffices } from '@/lib/econt';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  try {
    const offices = await searchOffices(q);
    return NextResponse.json(offices);
  } catch (err) {
    console.error('Econt offices error:', err);
    return NextResponse.json([], { status: 502 });
  }
}
