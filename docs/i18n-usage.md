# 国际化使用指南

## 概述

本项目使用 `next-intl` 库实现国际化功能，支持英文（en）和中文（zh）两种语言。

## 基本配置

### 支持的语言

- **en**: 英文（默认语言）
- **zh**: 中文

### 配置文件

- `src/i18n.ts`: 国际化配置文件
- `messages/en.json`: 英文翻译文件
- `messages/zh.json`: 中文翻译文件

## 路由结构

项目使用基于路径的国际化路由：

```
/          -> 重定向到 /en
/en        -> 英文主页
/zh        -> 中文主页
/en/faq    -> 英文FAQ页面
/zh/faq    -> 中文FAQ页面
```

## 使用方法

### 1. 在客户端组件中使用翻译

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MyClientComponent() {
  const t = useTranslations('navigation');
  
  return (
    <div>
      <h1>{t('home')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 2. 在服务器组件中使用翻译

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('common');
  
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

**重要区别**:
- **服务器组件**: 使用 `getTranslations` from `'next-intl/server'` （需要 `await`）
- **客户端组件**: 使用 `useTranslations` from `'next-intl'` （React Hook）
- 在 Next.js 15 中，页面参数是异步的，需要使用 `await` 来获取参数

### 3. 创建国际化链接

```tsx
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function MyComponent() {
  const locale = useLocale();
  
  return (
    <Link href={`/${locale}/about`}>
      About Page
    </Link>
  );
}
```

### 4. 语言切换

项目提供了 `LanguageSwitcher` 组件用于语言切换：

```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <nav>
        {/* 其他导航项 */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

## 添加新的翻译

### 1. 在翻译文件中添加新的键值对

在 `messages/en.json` 中：
```json
{
  "newSection": {
    "title": "New Section",
    "description": "This is a new section"
  }
}
```

在 `messages/zh.json` 中：
```json
{
  "newSection": {
    "title": "新栏目",
    "description": "这是一个新栏目"
  }
}
```

### 2. 在组件中使用新的翻译

```tsx
const t = useTranslations('newSection');
return <h1>{t('title')}</h1>;
```

## 添加新语言

### 1. 更新配置

在 `src/i18n.ts` 中添加新语言：

```typescript
export const locales = ['en', 'zh', 'es'] as const; // 添加西班牙语
```

### 2. 创建翻译文件

创建 `messages/es.json` 文件并添加相应的翻译。

### 3. 更新语言切换器

在 `src/components/LanguageSwitcher.tsx` 中添加新语言选项。

## 辅助工具

项目提供了一些辅助函数在 `src/utils/navigation.ts` 中：

- `createLocalizedLink(locale, path)`: 创建本地化链接
- `extractLocaleFromPath(pathname)`: 从路径中提取语言代码
- `removeLocaleFromPath(pathname, locale)`: 从路径中移除语言前缀
- `getPreferredLocale()`: 获取用户首选语言
- `setPreferredLocale(locale)`: 设置用户首选语言

## 最佳实践

1. **始终使用翻译键**: 避免在组件中硬编码文本
2. **保持翻译文件同步**: 确保所有语言文件包含相同的键
3. **使用有意义的键名**: 使用描述性的键名，如 `auth.loginButton` 而不是 `button1`
4. **组织翻译结构**: 使用嵌套对象组织相关的翻译
5. **测试所有语言**: 确保在所有支持的语言下应用都能正常工作

## Next.js 15 重要变化

### 异步页面参数

在 Next.js 15 中，页面参数现在是异步的。所有使用 `params` 的页面组件都需要：

1. 将函数标记为 `async`
2. 使用 `await` 来获取参数

```tsx
// ❌ 旧的方式 (Next.js 14)
export default function Page({ params: { locale } }) {
  // ...
}

// ✅ 新的方式 (Next.js 15)
export default async function Page({ params }) {
  const { locale } = await params;
  // ...
}
```

### 服务器组件中的翻译

由于页面组件现在是异步的，你不能在其中使用 React Hooks。因此：

```tsx
// ❌ 错误 - 不能在异步函数中使用 Hook
export default async function Page({ params }) {
  const { locale } = await params;
  const t = useTranslations('common'); // 这会报错！
  // ...
}

// ✅ 正确 - 使用 getTranslations
export default async function Page({ params }) {
  const { locale } = await params;
  const t = await getTranslations('common');
  // ...
}
```

### 类型定义更新

更新后的类型定义：

```typescript
interface PageProps {
  params: Promise<{ locale: string }>;
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}
```

## 故障排除

### 常见问题

1. **翻译不显示**: 检查翻译键是否在所有语言文件中都存在
2. **路由不工作**: 确保中间件配置正确
3. **语言切换失败**: 检查语言切换器的路径构建逻辑
4. **类型错误**: 确保使用了正确的异步参数模式（Next.js 15）
5. **React Hook 错误**: 
   - 错误: "React Hook cannot be called in an async function"
   - 解决: 在服务器组件中使用 `getTranslations`，在客户端组件中使用 `useTranslations`

### 调试技巧

1. 在浏览器控制台查看是否有缺失的翻译键警告
2. 检查网络请求确保正确的语言文件被加载
3. 使用开发者工具检查URL结构是否正确 