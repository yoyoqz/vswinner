# 国际化链接更新指南

## 需要更新的链接模式

以下是需要从硬编码路径更新为国际化路径的常见模式：

### 1. 简单链接更新

```tsx
// ❌ 更新前
<Link href="/admin">Admin</Link>

// ✅ 更新后
<Link href={`/${locale}/admin`}>Admin</Link>
```

### 2. 使用自定义Hook

```tsx
// 1. 导入Hook
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';

// 2. 在组件中使用
const { createLocalizedPath } = useLocalizedRouter();

// 3. 更新链接
<Link href={createLocalizedPath('/admin')}>Admin</Link>
```

### 3. 在服务器组件中

```tsx
// 获取locale参数
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // 使用模板字符串
  return <Link href={`/${locale}/admin`}>Admin</Link>;
}
```

## 需要更新的文件列表

基于搜索结果，以下文件包含需要更新的硬编码链接：

### 优先级1 - 主要导航链接
- [x] `src/app/[locale]/login/page.tsx` - 已更新
- [x] `src/app/[locale]/register/page.tsx` - 已更新
- [ ] `src/app/[locale]/dashboard/page.tsx`

### 优先级2 - 功能页面
- [ ] `src/app/[locale]/questions/page.tsx`
- [ ] `src/app/[locale]/questions/new/page.tsx`
- [ ] `src/app/[locale]/questions/success/page.tsx`

### 优先级3 - 管理页面
- [ ] `src/app/[locale]/admin/page.tsx`
- [ ] `src/app/[locale]/admin/faq/page.tsx`
- [ ] `src/app/[locale]/admin/blog/page.tsx`

## 批量替换模式

可以使用以下正则表达式进行批量查找替换：

### 查找模式：
```regex
href=["']/([^"']+)["']
```

### 替换模式：
```
href={`/${locale}/$1`}
```

或者使用 `createLocalizedPath`:
```
href={createLocalizedPath('/$1')}
```

## 注意事项

1. **API路由不需要更新** - `/api/*` 路径保持不变
2. **外部链接不需要更新** - `http://` 或 `https://` 开头的链接
3. **锚点链接不需要更新** - `#` 开头的链接
4. **相对路径需要小心** - 确保路径正确

## 验证方法

更新后，在不同语言环境下测试：
- 访问 `/en/page` 和 `/zh/page`
- 确保所有链接都包含正确的语言前缀
- 测试语言切换功能 