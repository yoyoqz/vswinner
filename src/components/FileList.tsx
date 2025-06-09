'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, FileImage, FileVideo, File as FileIcon, Calendar, Eye } from 'lucide-react';
import { formatTextForReact } from '@/lib/formatText';

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  fileSize: string;
  mimeType: string;
  category?: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FileListProps {
  category?: string;
}

export default function FileList({ category }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');

  useEffect(() => {
    fetchFiles();
  }, [selectedCategory]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const url = selectedCategory 
        ? `/api/files?category=${encodeURIComponent(selectedCategory)}`
        : '/api/files';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Refresh the list to update download count
      fetchFiles();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Download failed. Please try again.');
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    return FileIcon;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = Array.from(new Set(files.map(f => f.category).filter(Boolean)));

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
        <button
          onClick={fetchFiles}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat!)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <FileIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">暂无可下载的文件</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <div
                key={file.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {file.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {file.originalName}
                      </p>
                    </div>
                  </div>
                </div>

                {file.description && (
                  <div className="text-sm text-gray-600 mb-3 line-clamp-2" dangerouslySetInnerHTML={formatTextForReact(file.description)} />
                )}

                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center justify-between">
                    <span>大小: {formatFileSize(file.fileSize)}</span>
                    {file.category && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {file.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{file.downloadCount} 次下载</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(file.id, file.originalName)}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>下载</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 