'use client';

import Link from 'next/link';
import { Button } from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const t = useTranslations('navigation');
  const locale = useLocale();
  
  // 创建本地化链接的辅助函数
  const createLocalizedLink = (path: string) => {
    return `/${locale}${path}`;
  };
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={createLocalizedLink('/')} className="text-xl font-bold text-blue-600">
                {t('visa')}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href={createLocalizedLink('/')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                {t('home')}
              </Link>
              <Link href={createLocalizedLink('/visa/f-visa')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                {t('fvisa')}
              </Link>
              <Link href={createLocalizedLink('/visa/b-visa')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                {t('bvisa')}
              </Link>

              <Link href={createLocalizedLink('/questions')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                {t('questions')}
              </Link>
              <Link href={createLocalizedLink('/blog')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                {t('blog')}
              </Link>
              <Link href={createLocalizedLink('/videos')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                {t('videos')}
              </Link>
              <Link href={createLocalizedLink('/files')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                {t('files')}
              </Link>
              <Link href={createLocalizedLink('/membership')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                {t('membership')}
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link href={createLocalizedLink('/admin')}>
                    <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                      {t('admin')}
                    </Button>
                  </Link>
                )}
                <Link href={createLocalizedLink('/dashboard')}>
                  <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    {t('dashboard')}
                  </Button>
                </Link>
                <Button 
                  onClick={logout}
                  className="text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href={createLocalizedLink('/login')}>
                  <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    {t('login')}
                  </Button>
                </Link>
                <Link href={createLocalizedLink('/register')}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 