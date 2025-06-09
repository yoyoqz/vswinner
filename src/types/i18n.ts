import { locales } from '@/i18n';

export type Locale = typeof locales[number];

export interface LocaleParams {
  locale: string;
}

export interface PageProps {
  params: Promise<LocaleParams>;
}

export interface LayoutProps {
  children: React.ReactNode;
  params: Promise<LocaleParams>;
}

// 用于生成静态参数的类型
export interface StaticParams {
  locale: string;
} 