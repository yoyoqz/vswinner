'use client';

import { useTranslations } from 'next-intl';
import FileList from '@/components/FileList';
import { MembershipGuard } from '@/components/MembershipGuard';

export default function FilesPage() {
  const t = useTranslations('files');

  return (
    <MembershipGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('description')}
          </p>
        </div>

        <FileList />
      </div>
    </MembershipGuard>
  );
} 