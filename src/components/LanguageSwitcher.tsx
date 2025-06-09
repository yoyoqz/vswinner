'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // 获取当前路径，去除语言前缀
    const pathWithoutLocale = pathname.startsWith(`/${locale}`) 
      ? pathname.slice(locale.length + 1) 
      : pathname;
    
    // 构建新的路径
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => switchLanguage(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-label={t('selectLanguage')}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === 'en' ? t('english') : t('chinese')}
          </option>
        ))}
      </select>
    </div>
  );
} 