import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n'; // Ensure this import is present

export default createIntlMiddleware({
  locales, // Use imported locales
  defaultLocale, // Use imported defaultLocale
  localePrefix: 'always' // Explicitly set to 'always'
});

export const config = {
  // 匹配所有路径，除了以下模式
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 