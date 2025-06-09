'use client';

import { useTranslations } from 'next-intl';
import { VideoList } from '@/components/VideoList';
import { MembershipGuard } from '@/components/MembershipGuard';

export default function VideosPage() {
  const t = useTranslations('videos');

  return (
    <MembershipGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-500">{t('description')}</p>
        </div>
        
        <VideoList />
      </div>
    </MembershipGuard>
  );
} 