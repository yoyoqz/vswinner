'use client';

import { useTranslations } from 'next-intl';
import { VideoList } from '@/components/VideoList';
import { MembershipGuard } from '@/components/MembershipGuard';

export default function VideosPage() {
  const t = useTranslations('videos');

  return (
    <MembershipGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <VideoList />
      </div>
    </MembershipGuard>
  );
} 