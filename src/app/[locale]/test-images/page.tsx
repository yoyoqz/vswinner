'use client';

import { useEffect, useState } from 'react';

export default function TestImagesPage() {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Hardcoded list of images found in the directory
    const imageList = [
      '/uploads/blog/3ae7a7f4-7f26-45db-a78e-f7e17222513b.jpg',
      '/uploads/blog/629e0538-af19-4ef9-87a4-ace3c276b6f9.jpg',
      '/uploads/blog/9bd530cc-66f7-47be-8727-a4456471d1b2.jpg'
    ];
    setImages(imageList);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Image Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((src, index) => (
          <div key={index} className="border rounded-lg overflow-hidden shadow-md">
            <div className="bg-gray-200 aspect-w-16 aspect-h-9 relative">
              <img 
                src={src} 
                alt={`Test image ${index + 1}`} 
                className="object-contain w-full h-full"
                onError={(e) => {
                  console.error(`Failed to load image: ${src}`);
                  e.currentTarget.src = '/placeholder-image.svg';
                  setError(prev => prev + `Failed to load: ${src}\n`);
                }}
                onLoad={() => console.log(`Successfully loaded: ${src}`)}
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700">Image Path: {src}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 