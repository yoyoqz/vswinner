import { useTranslations } from 'next-intl';
import { MembershipPlans } from '@/components/MembershipPlans';

export default function MembershipPage() {
  const t = useTranslations('membership');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          {t('description')}
        </p>
      </div>
      
      <MembershipPlans />
    </div>
  );
} 