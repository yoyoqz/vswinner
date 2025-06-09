'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface BVisaQuestion {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface BVisaQuestionsProps {
  questions: BVisaQuestion[];
}

export default function BVisaQuestions({ questions }: BVisaQuestionsProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>B Visa Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No B visa questions available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <Card key={q.id} className="border border-gray-200">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleQuestion(q.id)}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-gray-900 pr-4">
                {q.question}
              </CardTitle>
              <div className="flex-shrink-0">
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    expandedQuestion === q.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </CardHeader>
          
          {expandedQuestion === q.id && (
            <CardContent className="pt-0 border-t border-gray-100">
              <div 
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: q.answer }}
              />
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
} 