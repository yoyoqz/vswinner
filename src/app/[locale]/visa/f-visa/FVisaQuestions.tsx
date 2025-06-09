'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

type FVisaQuestion = {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
};

interface FVisaQuestionsProps {
  questions: FVisaQuestion[];
}

export default function FVisaQuestions({ questions }: FVisaQuestionsProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No FAQs available at this time.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {questions.map((item) => (
        <div 
          key={item.id} 
          className="border border-gray-200 rounded-md overflow-hidden"
        >
          <div className="px-4 py-3 font-medium text-left bg-gray-100">
            {item.question}
          </div>
          <div className="px-4 py-3 bg-gray-50">
            <div dangerouslySetInnerHTML={{ __html: item.answer }} />
          </div>
        </div>
      ))}
    </div>
  );
} 