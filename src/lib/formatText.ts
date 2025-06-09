/**
 * 将文本中的换行符(\r, \n)替换为HTML的<br/>标签
 * @param text 原始文本
 * @returns 替换后的HTML字符串
 */
export function formatTextWithLineBreaks(text: string): string {
  if (!text) return text;
  
  // 替换 \r\n, \n, \r 为 <br/>
  return text
    .replace(/\r\n/g, '<br/>')
    .replace(/\n/g, '<br/>')
    .replace(/\r/g, '<br/>');
}

/**
 * React组件使用的格式化函数，返回dangerouslySetInnerHTML对象
 * @param text 原始文本
 * @returns dangerouslySetInnerHTML对象
 */
export function formatTextForReact(text: string) {
  return {
    __html: formatTextWithLineBreaks(text)
  };
} 