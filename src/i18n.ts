import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 支持的语言
export const locales = ['en', 'zh'] as const;
export type Locale = typeof locales[number];

// 默认语言
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // Wait for the incoming locale to be resolved.
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid.
  // Fallback to default if invalid or undefined.
  if (!locale || !locales.includes(locale as Locale)) {
    console.warn(`[getRequestConfig] Received locale '${locale}' is invalid or undefined. Falling back to default locale '${defaultLocale}'.`);
    locale = defaultLocale;
  }

  try {
    // console.log(`[getRequestConfig] Attempting to load messages for resolved locale: '${locale}'`); // Optional: for deeper debugging
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      locale, // Return the resolved locale
      messages
    };
  } catch (error) {
    // This error should ideally not happen if the locale fallback works
    // and json files for defaultLocale exist.
    console.error(`[getRequestConfig] Critical error: Failed to load messages for locale: '${locale}'. Calling notFound(). Original error:`, error);
    notFound();
  }
}); 