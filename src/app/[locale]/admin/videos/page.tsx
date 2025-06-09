'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { formatTextForReact } from '@/lib/formatText';

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

export default function AdminVideosPage() {
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    duration: '',
    published: true,
    order: 0,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchVideos();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      //const token = localStorage.getItem('token');
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
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

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url: string): string | null => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  // Capture first frame of video
  const captureVideoFrame = async (videoUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) {
        resolve(null);
        return;
      }

      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      
      const handleLoadedData = () => {
        try {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame to canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              } else {
                resolve(null);
              }
            }, 'image/jpeg', 0.8);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Error capturing video frame:', error);
          resolve(null);
        }
        
        // Clean up
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      };

      const handleError = () => {
        console.error('Error loading video');
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        resolve(null);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      
      video.load();
    });
  };

  // Auto-generate thumbnail when URL changes
  const handleUrlChange = async (url: string) => {
    setFormData({ ...formData, url });
    
    if (!url) {
      setFormData(prev => ({ ...prev, thumbnail: '' }));
      return;
    }

    setLoadingThumbnail(true);
    
    try {
      // Use API to generate thumbnail
      const response = await fetch('/api/videos/thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail) {
          setFormData(prev => ({ ...prev, thumbnail: data.thumbnail }));
        } else if (data.message) {
          // For non-YouTube videos, try client-side capture as fallback
          const frameCapture = await captureVideoFrame(url);
          if (frameCapture) {
            setFormData(prev => ({ ...prev, thumbnail: frameCapture }));
          } else {
            // Show message to user
            console.log(data.message);
          }
        }
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Fallback to client-side capture
      try {
        const frameCapture = await captureVideoFrame(url);
        if (frameCapture) {
          setFormData(prev => ({ ...prev, thumbnail: frameCapture }));
        }
      } catch (clientError) {
        console.error('Client-side capture also failed:', clientError);
      }
    } finally {
      setLoadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingVideo 
        ? `/api/admin/videos/${editingVideo.id}` 
        : '/api/admin/videos';
      const method = editingVideo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingVideo ? 'update' : 'create'} video`);
      }

      // Reset form and refresh list
      setFormData({
        title: '',
        description: '',
        url: '',
        thumbnail: '',
        duration: '',
        published: true,
        order: 0,
      });
      setEditingVideo(null);
      setShowForm(false);
      fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      url: video.url,
      thumbnail: video.thumbnail || '',
      duration: video.duration?.toString() || '',
      published: video.published,
      order: video.order,
    });
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Show loading state or redirect if not authenticated or not admin
  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Video Management</h1>
        <p className="text-gray-600 mt-2">Manage video content and playlists</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingVideo(null);
              setFormData({
                title: '',
                description: '',
                url: '',
                thumbnail: '',
                duration: '',
                published: true,
                order: 0,
              });
            }
          }}
          className={showForm ? 'bg-gray-500 hover:bg-gray-600' : ''}
        >
          {showForm ? 'Cancel' : 'Add New Video'}
        </Button>
      </div>

      {/* Hidden video and canvas elements for frame capture */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        muted
        preload="metadata"
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Thumbnail will be automatically generated from the video
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                  {loadingThumbnail && (
                    <span className="ml-2 text-blue-600 text-xs">Generating...</span>
                  )}
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated or custom thumbnail URL"
                  />
                  {formData.thumbnail && (
                    <div className="mt-2">
                      <img
                        src={formData.thumbnail}
                        alt="Video thumbnail preview"
                        className="w-48 h-32 object-cover rounded border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Published
                  </label>
                  <select
                    value={formData.published.toString()}
                    onChange={(e) => setFormData({ ...formData, published: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loadingThumbnail}>
                  {editingVideo ? 'Update Video' : 'Create Video'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingVideo(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {videos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No videos found. Create your first video!</p>
          ) : (
            videos.map((video) => (
              <Card key={video.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{video.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            video.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {video.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        {video.description && (
                          <div className="text-gray-600 mb-2" dangerouslySetInnerHTML={formatTextForReact(video.description)} />
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>Order: {video.order}</span>
                          {video.duration && <span>Duration: {formatDuration(video.duration)}</span>}
                          <span>Created: {new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Video →
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(video)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(video.id)}
                        className="text-red-600 hover:text-red-800 hover:border-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
} 