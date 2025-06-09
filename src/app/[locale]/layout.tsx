import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VisaInfo - Visa Information and FAQ",
  description: "Get information about F and B visas, ask questions, and find answers to common questions.",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale; // Safer access

  // ------------- Enhanced Logging Start -------------
  console.log(`[LocaleLayout] Attempting to build for locale: '${locale}'. Resolved params object:`, JSON.stringify(resolvedParams));
  // ------------- Enhanced Logging End ---------------

  // 验证语言是否支持
  if (!locale || !locales.includes(locale as any)) { // Also check if locale itself is falsy
    console.error(`[LocaleLayout] Invalid or missing locale: '${locale}'. Calling notFound().`);
    notFound();
  }

  // Enable static rendering by setting the locale for the request
  setRequestLocale(locale);

  // 获取国际化消息
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
            <footer className="bg-white border-t py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              </div>
            </footer>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  console.log("[LocaleLayout] generateStaticParams called. Returning:", locales.map((l) => ({ locale: l })));
  return locales.map((locale) => ({ locale }));
} 