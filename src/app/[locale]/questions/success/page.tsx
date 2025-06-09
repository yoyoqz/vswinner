import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

export default function QuestionSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-green-600">Question Submitted Successfully!</CardTitle>
          <CardDescription>
            Thank you for your question
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="mb-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg mb-2">Your question has been submitted successfully!</p>
            <p className="text-gray-500">
              Our team will review your question shortly. Once approved, it will appear on the questions page.
            </p>
          </div>
          <div className="space-y-4">
            <Link href="/questions">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                View All Questions
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 