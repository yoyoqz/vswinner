import { locales, defaultLocale } from '@/i18n';

// 辅助函数：创建本地化链接
export function createLocalizedLink(locale: string, path: string): string {
  return `/${locale}${path}`;
}

// 辅助函数：从路径中提取语言代码
export function extractLocaleFromPath(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return null;
}

// 辅助函数：从路径中移除语言前缀
export function removeLocaleFromPath(pathname: string, locale: string): string {
  if (pathname.startsWith(`/${locale}/`)) {
    return pathname.substring(locale.length + 1);
  }
  if (pathname === `/${locale}`) {
    return '/';
  }
  return pathname;
}

// 辅助函数：获取用户首选语言
export function getPreferredLocale(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('preferred-locale');
    if (stored && locales.includes(stored as any)) {
      return stored;
    }
  }
  return defaultLocale;
}

// 辅助函数：设置用户首选语言
export function setPreferredLocale(locale: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-locale', locale);
  }
} 