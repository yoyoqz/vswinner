import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    console.log('Upload API called');
    
    // Check user authentication and authorization
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      console.log('Unauthorized user attempted upload', currentUser);
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process the form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    console.log(`Received ${files.length} files`);
    
    if (!files || files.length === 0) {
      console.log('No files provided');
      return NextResponse.json(
        { message: 'No images provided' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog');
    if (!existsSync(uploadDir)) {
      console.log('Creating upload directory:', uploadDir);
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedImages = [];

    // Process each file
    for (const file of files) {
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      if (!file.type.startsWith('image/')) {
        console.log(`Rejected non-image file: ${file.type}`);
        return NextResponse.json(
          { message: 'Only image files are allowed' },
          { status: 400 }
        );
      }

      try {
        // Generate a unique filename
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const relativePath = `/uploads/blog/${fileName}`;
        const fullPath = join(process.cwd(), 'public', relativePath);
        
        console.log(`Saving to: ${fullPath}`);
        
        // Save file to the public directory
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(fullPath, buffer);
        
        uploadedImages.push({
          url: relativePath,
          fileName: file.name,
          type: file.type,
          size: file.size,
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { message: 'Failed to process any of the uploaded images' },
        { status: 500 }
      );
    }

    console.log('Upload successful:', uploadedImages);
    
    return NextResponse.json(
      { message: 'Images uploaded successfully', images: uploadedImages },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { message: `Error uploading images: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 