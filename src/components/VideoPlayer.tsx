'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1`;
    }
    return url;
  };

  const isYouTubeVideo = url.includes('youtube.com') || url.includes('youtu.be');
  const isDirectVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg');

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="aspect-video bg-black relative">
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white text-sm">正在加载视频...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-gray-300 mb-2">视频加载失败</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-400 hover:text-blue-300 underline"
            >
              在新窗口中打开
            </a>
          </div>
        </div>
      )}

      {/* YouTube Video */}
      {isYouTubeVideo && (
        <iframe
          src={getVideoEmbedUrl(url)}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: hasError ? 'none' : 'block' }}
        />
      )}

      {/* Direct Video File */}
      {isDirectVideo && (
        <video
          controls
          className="w-full h-full"
          preload="metadata"
          onLoadedData={handleLoad}
          onError={handleError}
          style={{ display: hasError ? 'none' : 'block' }}
        >
          <source src={url} type="video/mp4" />
          <source src={url} type="video/webm" />
          <source src={url} type="video/ogg" />
          您的浏览器不支持视频播放。
        </video>
      )}

      {/* Unsupported format */}
      {!isYouTubeVideo && !isDirectVideo && (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v0" />
            </svg>
            <p className="text-gray-400 mb-2">不支持的视频格式</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-400 hover:text-blue-300 underline"
            >
              在新窗口中打开
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 