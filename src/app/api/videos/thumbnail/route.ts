import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url: string): string | null => {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[7].length === 11 ? match[7] : null;
    };

    // Check if it's a YouTube video
    const youtubeVideoId = getYouTubeVideoId(url);
    
    if (youtubeVideoId) {
      // For YouTube videos, return the thumbnail URL
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;
      
      // Verify the thumbnail exists
      try {
        const response = await fetch(thumbnailUrl, { method: 'HEAD' });
        if (response.ok) {
          return NextResponse.json({ thumbnail: thumbnailUrl });
        } else {
          // Fallback to standard quality thumbnail
          const fallbackUrl = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
          return NextResponse.json({ thumbnail: fallbackUrl });
        }
      } catch {
        // Fallback to standard quality thumbnail
        const fallbackUrl = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
        return NextResponse.json({ thumbnail: fallbackUrl });
      }
    }

    // For non-YouTube videos, we'll return a placeholder or attempt to generate
    // Note: Actual video frame extraction would require additional libraries like FFmpeg
    // For now, we'll return a placeholder
    return NextResponse.json({
      thumbnail: null,
      message: 'For non-YouTube videos, please provide a custom thumbnail URL'
    });

  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnail' },
      { status: 500 }
    );
  }
} 