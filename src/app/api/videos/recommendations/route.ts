import { fetchVideoRecommendations } from '@/entities/video/api/server';
import { VideoCategory } from '@/entities/video/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = url.searchParams.get('limit') || '10';
  const categoryParam = url.searchParams.get('category') || 'video';
  
  const category: VideoCategory = 
    (categoryParam === 'video' || categoryParam === 'audio' || categoryParam === 'shorts') 
      ? categoryParam 
      : 'video';
  
  try {
    const { data, error } = await fetchVideoRecommendations({
      limit: parseInt(limit),
      category,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 