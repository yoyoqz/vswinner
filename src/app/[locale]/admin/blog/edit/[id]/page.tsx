'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditBlogPostPage() {
  const params = useParams();
  //const blogId = params.id as string;

  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    published: false,
  });
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, fileName: string, size: number}>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin && params.id) {
      fetchBlogPost();
    }
  }, [isAuthenticated, isAdmin, params.id]);

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`/api/blogs/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      const data = await response.json();
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        summary: data.summary || '',
        content: data.content || '',
        published: data.published || false,
      });

      // Extract image URLs from content for the uploaded images list
      const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
      const imageUrls = [];
      let match;
      while ((match = imgRegex.exec(data.content)) !== null) {
        const url = match[1];
        const fileName = url.split('/').pop() || 'image';
        imageUrls.push({ url, fileName, size: 0 });
      }
      setUploadedImages(imageUrls);
    } catch (err: any) {
      console.error('Error fetching blog post:', err);
      setError(err.message || 'Failed to load blog post');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title only if slug is empty or was auto-generated
    if (name === 'title' && (formData.slug === '' || formData.slug === formData.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-'))) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Track cursor position
  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart);
  };

  // Insert text at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentContent = formData.content;
    const beforeCursor = currentContent.slice(0, cursorPosition);
    const afterCursor = currentContent.slice(cursorPosition);
    
    const newContent = beforeCursor + textToInsert + afterCursor;
    
    setFormData(prev => ({
      ...prev,
      content: newContent,
    }));

    // Move cursor to after inserted text
    const newCursorPosition = cursorPosition + textToInsert.length;
    setCursorPosition(newCursorPosition);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      console.log(`Uploading ${files.length} files`);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        console.log(`Adding file to formData: ${files[i].name}`);
        formData.append('files', files[i]);
      }
      
      console.log('Sending upload request');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        throw new Error(errorData.message || 'Failed to upload images');
      }
      
      const data = await response.json();
      console.log('Upload success:', data);
      
      if (!data.images || data.images.length === 0) {
        throw new Error('No images were returned from the server');
      }
      
      // Ensure each image URL is complete
      const processedImages = data.images.map((img: any) => ({
        ...img,
        url: img.url.startsWith('/') ? img.url : `/${img.url}`,
      }));
      
      console.log('Processed images:', processedImages);
      setUploadedImages(prev => [...prev, ...processedImages]);
      
      // Insert image URLs into content at cursor position
      if (processedImages.length > 0) {
        const imageUrls = processedImages.map((img: {url: string}) => 
          `<img src="${img.url}" alt="Blog image" width="100%" />`
        ).join('\n\n');
        
        insertTextAtCursor('\n\n' + imageUrls);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      setUploadError(err.message || 'An unknown error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop uploads
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (contentAreaRef.current) {
      contentAreaRef.current.classList.remove('bg-blue-50', 'border-blue-300');
    }
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      console.log(`Uploading ${files.length} dragged files`);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          console.log(`Adding dragged file to formData: ${files[i].name}`);
          formData.append('files', files[i]);
        }
      }
      
      console.log('Sending upload request for dragged files');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        throw new Error(errorData.message || 'Failed to upload images');
      }
      
      const data = await response.json();
      console.log('Upload success:', data);
      
      if (!data.images || data.images.length === 0) {
        throw new Error('No images were returned from the server');
      }
      
      // Ensure each image URL is complete
      const processedImages = data.images.map((img: any) => ({
        ...img,
        url: img.url.startsWith('/') ? img.url : `/${img.url}`,
      }));
      
      console.log('Processed images:', processedImages);
      setUploadedImages(prev => [...prev, ...processedImages]);
      
      // Insert image URLs into content at cursor position
      if (processedImages.length > 0) {
        const imageUrls = processedImages.map((img: {url: string}) => 
          `<img src="${img.url}" alt="Blog image" width="100%" />`
        ).join('\n\n');
        
        insertTextAtCursor('\n\n' + imageUrls);
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      setUploadError(err.message || 'An unknown error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (contentAreaRef.current) {
      contentAreaRef.current.classList.add('bg-blue-50', 'border-blue-300');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (contentAreaRef.current) {
      contentAreaRef.current.classList.remove('bg-blue-50', 'border-blue-300');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update blog post');
      }

      router.push('/admin/blog');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state or redirect if not authenticated or not admin
  if (loading || isFetching) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Blog Post</h1>
          <Link href="/admin/blog">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be used for the URL: /blog/<span className="font-medium">{formData.slug}</span>
            </p>
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief summary of the blog post"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Images
            </label>
            <div className="mt-1 flex items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? 'Uploading...' : 'Upload Images'}
              </Button>
            </div>
            
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
            
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images ({uploadedImages.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={image.url} 
                          alt={`Uploaded image ${index + 1}`}
                          className="object-cover w-full h-full" 
                          onError={(e) => {
                            console.error(`Error loading image: ${image.url}`);
                            e.currentTarget.src = '/placeholder-image.svg';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        {image.fileName} {image.size ? `- ${Math.round(image.size / 1024)} KB` : ''}
                      </p>
                      <p className="text-xs text-blue-500 cursor-pointer" onClick={() => {
                        navigator.clipboard.writeText(image.url);
                        alert('Image URL copied to clipboard');
                      }}>
                        {image.url}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="mt-1 text-sm text-gray-500">
              Upload images to include in your blog post. Images will be automatically inserted into your content.
            </p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div 
              ref={contentAreaRef}
              className="mt-1 relative border border-gray-300 rounded-md transition-colors duration-200 ease-in-out"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <textarea
                ref={textareaRef}
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                onSelect={handleTextareaSelect}
                onClick={handleTextareaSelect}
                onKeyUp={handleTextareaSelect}
                required
                rows={15}
                className="block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your blog post content here..."
              />
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-sm font-medium text-gray-700">Uploading images...</p>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              HTML is supported for formatting. You can also drag and drop images directly into the editor.
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
              Published
            </label>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 