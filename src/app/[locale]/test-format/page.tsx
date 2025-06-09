import { formatTextForReact } from '@/lib/formatText';

export default function TestFormatPage() {
  const testTexts = [
    "这是第一行\n这是第二行\n这是第三行",
    "Windows换行符测试\r\n第二行\r\n第三行",
    "混合换行符测试\r第二行\n第三行\r\n第四行",
    "普通文本没有换行符",
    "多个连续换行符\n\n\n测试",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">换行符替换功能测试</h1>
      
      <div className="space-y-8">
        {testTexts.map((text, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">测试 {index + 1}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">原始文本:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
                  {JSON.stringify(text)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">格式化后显示:</h3>
                <div 
                  className="bg-gray-100 p-3 rounded text-sm border"
                  dangerouslySetInnerHTML={formatTextForReact(text)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">功能说明</h2>
        <ul className="text-blue-700 space-y-2">
          <li>• 将 \r\n (Windows换行符) 替换为 &lt;br/&gt;</li>
          <li>• 将 \n (Unix换行符) 替换为 &lt;br/&gt;</li>
          <li>• 将 \r (Mac换行符) 替换为 &lt;br/&gt;</li>
          <li>• 支持混合换行符格式</li>
          <li>• 在所有textarea内容显示处自动应用</li>
        </ul>
      </div>
    </div>
  );
} 