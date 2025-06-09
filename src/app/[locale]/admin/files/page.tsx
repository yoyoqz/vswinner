'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Edit, Download, Eye, Calendar, FileText } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { formatTextForReact } from '@/lib/formatText';

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  filePath: string;
  fileSize: string;
  mimeType: string;
  category?: string;
  downloadCount: number;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FileFormData {
  name: string;
  originalName: string;
  description: string;
  filePath: string;
  fileSize: string;
  mimeType: string;
  category: string;
  published: boolean;
  order: number;
}

export default function AdminFilesPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [formData, setFormData] = useState<FileFormData>({
    name: '',
    originalName: '',
    description: '',
    filePath: '',
    fileSize: '0',
    mimeType: 'application/octet-stream',
    category: '',
    published: true,
    order: 0,
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchFiles();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingFile ? `/api/admin/files/${editingFile.id}` : '/api/admin/files';
      const method = editingFile ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      await fetchFiles();
      resetForm();
    } catch (error) {
      console.error('Error saving file:', error);
      alert('保存文件失败，请重试。');
    }
  };

  const handleDelete = async (fileId: string) => {
    //if (!confirm('确定要删除这个文件吗？此操作不可撤销。')) {
    //  return;
    //}

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      await fetchFiles();
      //alert('文件删除成功！');
    } catch (error) {
      console.error('Error deleting file:', error);
      //alert('删除文件失败，请重试。');
    }
  };

  const handleEdit = (file: FileItem) => {
    setEditingFile(file);
    setFormData({
      name: file.name,
      originalName: file.originalName,
      description: file.description || '',
      filePath: file.filePath,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      category: file.category || '',
      published: file.published,
      order: file.order,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingFile(null);
    setFormData({
      name: '',
      originalName: '',
      description: '',
      filePath: '',
      fileSize: '0',
      mimeType: 'application/octet-stream',
      category: '',
      published: true,
      order: 0,
    });
  };

  const handleFileUpload = (fileInfo: {
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimeType: string;
  }) => {
    // Auto-fill form data with uploaded file information
    setFormData({
      ...formData,
      name: fileInfo.originalName.replace(/\.[^/.]+$/, ''), // Remove file extension
      originalName: fileInfo.originalName,
      filePath: fileInfo.path,
      fileSize: fileInfo.size.toString(),
      mimeType: fileInfo.mimeType,
    });
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">文件管理</h1>
            <p className="text-gray-600 mt-2">管理可下载的文件资源</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>添加文件</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingFile ? '编辑文件' : '添加文件'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload Section - Only show for new files */}
              {!editingFile && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    上传文件
                  </h3>
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip"
                    maxSize={50 * 1024 * 1024} // 50MB
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    上传文件后，表单将自动填充文件信息。您也可以手动填写下面的表单。
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文件名称 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    原始文件名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.originalName}
                    onChange={(e) => setFormData({ ...formData, originalName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文件路径/URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.filePath}
                    onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                    placeholder="例：/uploads/file.pdf 或 https://example.com/file.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文件大小 (字节)
                  </label>
                  <input
                    type="number"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文件类型 (MIME)
                  </label>
                  <select
                    value={formData.mimeType}
                    onChange={(e) => setFormData({ ...formData, mimeType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="application/pdf">PDF</option>
                    <option value="application/msword">Word (.doc)</option>
                    <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word (.docx)</option>
                    <option value="application/vnd.ms-excel">Excel (.xls)</option>
                    <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel (.xlsx)</option>
                    <option value="image/jpeg">JPEG 图片</option>
                    <option value="image/png">PNG 图片</option>
                    <option value="text/plain">文本文件</option>
                    <option value="application/zip">ZIP 压缩包</option>
                    <option value="application/octet-stream">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="例：表格、指南、模板"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    排序
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
                    状态
                  </label>
                  <select
                    value={formData.published.toString()}
                    onChange={(e) => setFormData({ ...formData, published: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">已发布</option>
                    <option value="false">草稿</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingFile ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">文件列表 ({files.length})</h3>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchFiles}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">暂无文件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    文件信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类/大小
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态/下载
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">{file.originalName}</div>
                        {file.description && (
                          <div className="text-sm text-gray-400 truncate max-w-xs" dangerouslySetInnerHTML={formatTextForReact(file.description)} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {file.category && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full mb-1">
                            {file.category}
                          </span>
                        )}
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          file.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {file.published ? '已发布' : '草稿'}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Eye className="h-3 w-3 mr-1" />
                          {file.downloadCount} 次
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(file.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(file)}
                          className="text-blue-600 hover:text-blue-900"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 