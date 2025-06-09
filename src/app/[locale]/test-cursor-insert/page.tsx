'use client';

import { useState, useRef } from 'react';

export default function TestCursorInsertPage() {
  const [content, setContent] = useState('这是一些示例文本。\n\n在这里输入更多内容...\n\n光标可以放在任何位置。');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track cursor position
  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart);
  };

  // Insert text at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const beforeCursor = content.slice(0, cursorPosition);
    const afterCursor = content.slice(cursorPosition);
    
    const newContent = beforeCursor + textToInsert + afterCursor;
    setContent(newContent);

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

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  // Simulate image insertion
  const insertSampleImage = () => {
    const imageTag = '<img src="/sample-image.jpg" alt="Sample Image" width="100%" />';
    insertTextAtCursor('\n\n' + imageTag + '\n\n');
  };

  // Insert different types of content
  const insertSampleContent = (type: string) => {
    let contentToInsert = '';
    
    switch (type) {
      case 'image':
        contentToInsert = '\n\n<img src="/sample-image.jpg" alt="Sample Image" width="100%" />\n\n';
        break;
      case 'link':
        contentToInsert = '[示例链接](https://example.com)';
        break;
      case 'bold':
        contentToInsert = '**粗体文本**';
        break;
      case 'code':
        contentToInsert = '```\n代码块示例\n```';
        break;
      case 'list':
        contentToInsert = '\n- 列表项 1\n- 列表项 2\n- 列表项 3\n';
        break;
      default:
        contentToInsert = '插入的示例文本';
    }
    
    insertTextAtCursor(contentToInsert);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">光标位置插入功能测试</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Textarea Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">编辑器</h2>
            
            <div className="mb-4 text-sm text-gray-600">
              当前光标位置: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{cursorPosition}</span>
            </div>
            
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              onSelect={handleTextareaSelect}
              onClick={handleTextareaSelect}
              onKeyUp={handleTextareaSelect}
              rows={20}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="在这里输入文本，然后点击右侧按钮在光标位置插入内容..."
            />
            
            <div className="mt-4 text-sm text-gray-500">
              <p><strong>说明:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>点击文本区域中的任意位置来设置光标位置</li>
                <li>使用键盘方向键移动光标</li>
                <li>点击右侧按钮将在当前光标位置插入内容</li>
                <li>插入后光标会自动移动到插入内容的末尾</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Control Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">插入内容</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => insertSampleContent('image')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                插入图片标签
              </button>
              
              <button
                onClick={() => insertSampleContent('link')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                插入链接
              </button>
              
              <button
                onClick={() => insertSampleContent('bold')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                插入粗体文本
              </button>
              
              <button
                onClick={() => insertSampleContent('code')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                插入代码块
              </button>
              
              <button
                onClick={() => insertSampleContent('list')}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                插入列表
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">实际应用场景</h4>
            <p className="text-sm text-gray-600">
              这个功能已经应用到博客新增和编辑页面。当您拖拽图片到编辑器时，
              图片标签会插入到光标当前位置，而不是文本末尾。
            </p>
          </div>
        </div>
      </div>
      
      {/* Preview Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">内容预览 (HTML渲染)</h3>
        <div 
          className="border border-gray-200 rounded-md p-4 min-h-32 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
        />
      </div>
    </div>
  );
} 