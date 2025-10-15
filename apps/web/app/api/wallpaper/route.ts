import { NextRequest, NextResponse } from 'next/server';
import { fetchRandomWallpaper } from '@/lib/wallpaper';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || undefined;

    const url = await fetchRandomWallpaper(query);

    if (!url) {
      return NextResponse.json(
        { error: 'Failed to fetch wallpaper' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Wallpaper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
