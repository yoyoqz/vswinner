'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function useLocalizedRouter() {
  const locale = useLocale();
  const router = useRouter();

  const createLocalizedPath = (path: string): string => {
    // 确保路径以 / 开头
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${locale}${cleanPath}`;
  };

  const push = (path: string) => {
    router.push(createLocalizedPath(path));
  };

  const replace = (path: string) => {
    router.replace(createLocalizedPath(path));
  };

  return {
    push,
    replace,
    createLocalizedPath,
    locale,
  };
} 