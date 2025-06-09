'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { formatTextForReact } from '@/lib/formatText';
import { VideoComments } from './VideoComments';
import { VideoPlayer } from './VideoPlayer';

interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  duration: number | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const t = useTranslations('videos');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };



  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('noVideos')}</p>
      </div>
    );
  }

  // If a video is selected, show the video player and comments
  if (selectedVideo) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={handleCloseVideo}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回视频列表
          </button>
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <VideoPlayer url={selectedVideo.url} title={selectedVideo.title} />
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {selectedVideo.title}
            </h1>
            
            {selectedVideo.description && (
              <div 
                className="text-gray-700 mb-4 leading-relaxed"
                dangerouslySetInnerHTML={formatTextForReact(selectedVideo.description)}
              />
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
              <span>发布时间: {new Date(selectedVideo.createdAt).toLocaleDateString('zh-CN')}</span>
              {selectedVideo.duration && (
                <span>时长: {formatDuration(selectedVideo.duration)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <VideoComments videoId={selectedVideo.id} />
      </div>
    );
  }

  // Default video grid view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div 
            className="relative aspect-video cursor-pointer"
            onClick={() => handleVideoClick(video)}
          >
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDQgNzJMMTc2IDkwTDE0NCAxMDhWNzJaIiBmaWxsPSIjOUM5Q0EzIi8+Cjwvc3ZnPg==';
                  target.className = "w-full h-full object-cover bg-gray-200";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v.5m0 0v1m0-1h4.5m0 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
              <div className="bg-white bg-opacity-90 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-gray-800"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Duration badge */}
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
            {video.description && (
              <div className="text-gray-600 text-sm mb-3 line-clamp-2" dangerouslySetInnerHTML={formatTextForReact(video.description)} />
            )}
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleVideoClick(video)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                观看视频
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 