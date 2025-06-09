'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MembershipGuard } from '@/components/MembershipGuard';
import FVisaQuestions from './FVisaQuestions';
import PersonalizedQuestions from './PersonalizedQuestions';
import FVisaQuestionsManager from './FVisaQuestionsManager';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

interface FVisaQuestion {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PersonalQuestion {
  id: string;
  question: string;
  answer: string;
  isCustom: boolean;
}

export default function FVisaPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const t = useTranslations('fVisa');
  const [visaInfo, setVisaInfo] = useState<any>(null);
  const [fVisaQuestions, setFVisaQuestions] = useState<FVisaQuestion[]>([]);
  const [personalQuestions, setPersonalQuestions] = useState<PersonalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'faq' | 'personal'>('overview');
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch visa info
        const visaInfoResponse = await fetch('/api/visa/info?type=F_VISA');
        if (visaInfoResponse.ok) {
          const visaInfoData = await visaInfoResponse.json();
          setVisaInfo(visaInfoData);
        }

        // Fetch F visa questions
        const questionsResponse = await fetch('/api/visa/f-visa/questions');
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          setFVisaQuestions(questionsData);
        }

        // Fetch personal questions if authenticated
        if (isAuthenticated && user) {
          const token = localStorage.getItem('auth_token');
          const personalResponse = await fetch('/api/user/personal-questions', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (personalResponse.ok) {
            const personalData = await personalResponse.json();
            setPersonalQuestions(personalData.map((q: any) => ({
              ...q,
              isCustom: true,
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  const refreshFAQ = async () => {
    try {
      const questionsResponse = await fetch('/api/visa/f-visa/questions');
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setFVisaQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error refreshing FAQ:', error);
    }
  };

  const handleAddPersonalQuestion = async (question: Omit<PersonalQuestion, 'id'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/user/personal-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question.question,
          answer: question.answer,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add question');
      }
      
      const newQuestion = await response.json();
      setPersonalQuestions(prev => [{
        ...newQuestion,
        isCustom: true,
      }, ...prev]);
    } catch (error) {
      console.error('Error adding personal question:', error);
      throw error;
    }
  };

  const handleDeletePersonalQuestion = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`/api/user/personal-questions?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      
      setPersonalQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting personal question:', error);
      throw error;
    }
  };

  const handleEditPersonalQuestion = async (id: string, question: Omit<PersonalQuestion, 'id'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/user/personal-questions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          question: question.question,
          answer: question.answer,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update question');
      }
      
      const updatedQuestion = await response.json();
      setPersonalQuestions(prev => 
        prev.map(q => q.id === id ? { ...updatedQuestion, isCustom: true } : q)
      );
    } catch (error) {
      console.error('Error updating personal question:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <MembershipGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {t('description')}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.overview')}
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.faq')}
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.personal')}
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div>
            {false ? (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900">{visaInfo?.title}</h2>
                <div 
                  className="mt-4 text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: visaInfo?.content || '' }} 
                />
              </div>
            ) : (
              <div className="grid gap-8">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="text-xl">{t('overview.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 mb-6">
                        {t('overview.description')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                      <CardTitle className="text-xl">{t('overview.f1Title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4">
                        {t('overview.f1Description')}
                      </p>
                      <p className="font-semibold text-gray-800 mb-3">{t('overview.f1Requirements')}</p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {t('overview.f1Req1')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {t('overview.f1Req2')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {t('overview.f1Req3')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {t('overview.f1Req4')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {t('overview.f1Req5')}
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                      <CardTitle className="text-xl">{t('overview.f2Title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4">
                        {t('overview.f2Description')}
                      </p>
                      <p className="font-semibold text-gray-800 mb-3">{t('overview.f2Activities')}</p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          {t('overview.f2Act1')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          {t('overview.f2Act2')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          {t('overview.f2Act3')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          {t('overview.f2Act4')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          {t('overview.f2Act5')}
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                    <CardTitle className="text-xl">{t('overview.processTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ol className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                        {t('overview.processStep1')}
                      </li>
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                        {t('overview.processStep2')}
                      </li>
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                        {t('overview.processStep3')}
                      </li>
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                        {t('overview.processStep4')}
                      </li>
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">5</span>
                        {t('overview.processStep5')}
                      </li>
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">6</span>
                        {t('overview.processStep6')}
                      </li>
                    </ol>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                    <CardTitle className="text-xl">{t('overview.documentsTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">📄</span>
                        {t('overview.doc1')}
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">📄</span>
                        {t('overview.doc2')}
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">📄</span>
                        {t('overview.doc3')}
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">📄</span>
                        {t('overview.doc4')}
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">📄</span>
                        {t('overview.doc5')}
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">📄</span>
                        {t('overview.doc6')}
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">📄</span>
                        {t('overview.doc7')}
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">📄</span>
                        {t('overview.doc8')}
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="text-xl">{t('overview.workTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-semibold text-gray-800 mb-3">{t('overview.onCampusTitle')}</p>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">•</span>
                            {t('overview.onCampus1')}
                          </li>
                          <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">•</span>
                            {t('overview.onCampus2')}
                          </li>
                          <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">•</span>
                            {t('overview.onCampus3')}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 mb-3">{t('overview.offCampusTitle')}</p>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            {t('overview.offCampus1')}
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            {t('overview.offCampus2')}
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            {t('overview.offCampus3')}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'faq' && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('faq.title')}</h2>
                  <p className="text-gray-600">{t('faq.description')}</p>
                </div>
                {isAdmin && (
                  <Button
                    onClick={() => setIsManagerOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ml-4"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    {t('faq.manageQuestions')}
                  </Button>
                )}
              </div>
            </div>
            <FVisaQuestions questions={fVisaQuestions} />
          </div>
        )}

        {activeTab === 'personal' && (
          <>
            {isAuthenticated ? (
              <PersonalizedQuestions 
                questions={personalQuestions}
                onAddQuestion={handleAddPersonalQuestion}
                onDeleteQuestion={handleDeletePersonalQuestion}
                onEditQuestion={handleEditPersonalQuestion}
              />
            ) : (
              <div className="text-center py-12">
                <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h3>
                    <p className="text-gray-600 mb-6">Sign in to add your own personalized F-1 visa questions with AI assistance</p>
                    <Button
                      onClick={() => window.location.href = '/login'}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Sign In to Continue
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* F Visa Questions Manager Modal */}
      <FVisaQuestionsManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onQuestionsUpdated={refreshFAQ}
      />
    </MembershipGuard>
  );
} 