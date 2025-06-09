import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the file in database
    const file = await prisma.file.findUnique({
      where: { 
        id,
        published: true 
      }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    let fileContent: Buffer;
    const headers: Record<string, string> = {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    };

    try {
      if (file.filePath.startsWith('http://') || file.filePath.startsWith('https://')) {
        // Handle remote URLs
        const response = await fetch(file.filePath);
        if (!response.ok) {
          throw new Error('Failed to fetch remote file');
        }
        const arrayBuffer = await response.arrayBuffer();
        fileContent = Buffer.from(arrayBuffer);
      } else if (file.filePath.startsWith('/')) {
        // Handle absolute paths
        fileContent = await fs.readFile(file.filePath);
      } else {
        // Handle relative paths from project root
        const fullPath = path.join(process.cwd(), file.filePath);
        fileContent = await fs.readFile(fullPath);
      }
    } catch (fileError) {
      console.error('Error reading file:', fileError);
      
      // Create a demo file with file information
      const demoContent = `文件名: ${file.name}
原始文件名: ${file.originalName}
描述: ${file.description || '无描述'}
文件路径: ${file.filePath}
文件类型: ${file.mimeType}
分类: ${file.category || '未分类'}

这是一个演示文件。实际文件可能不存在或无法访问。
请联系管理员获取正确的文件。

下载时间: ${new Date().toLocaleString('zh-CN')}
`;
      
      fileContent = Buffer.from(demoContent, 'utf8');
      headers['Content-Type'] = 'text/plain; charset=utf-8';
      headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(file.originalName.replace(/\.[^/.]+$/, '') + '_demo.txt')}"`;
    }

    // Update download count
    await prisma.file.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    return new NextResponse(fileContent, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
} 