'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useAIUsageLimit } from '@/hooks/useAIUsageLimit';
import { Loader2, Sparkles } from 'lucide-react';

interface BVisaPersonalQuestion {
  id: string;
  question: string;
  answer: string;
  isCustom: boolean;
}

interface BVisaPersonalizedQuestionsProps {
  questions: BVisaPersonalQuestion[];
  onAddQuestion: (question: Omit<BVisaPersonalQuestion, 'id'>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onEditQuestion: (id: string, question: Omit<BVisaPersonalQuestion, 'id'>) => Promise<void>;
}

export default function BVisaPersonalizedQuestions({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onEditQuestion,
}: BVisaPersonalizedQuestionsProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  const { used, limit, canUse, membershipType, loading: usageLimitLoading, updateUsage } = useAIUsageLimit();

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    try {
      await onAddQuestion({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        isCustom: true,
      });
      
      setNewQuestion('');
      setNewAnswer('');
      setIsAddingQuestion(false);
      toast.success('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question. Please try again.');
    }
  };

  const handleEditQuestion = async (id: string) => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    try {
      await onEditQuestion(id, {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        isCustom: true,
      });
      
      setNewQuestion('');
      setNewAnswer('');
      setEditingQuestionId(null);
      toast.success('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question. Please try again.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await onDeleteQuestion(id);
        toast.success('Question deleted successfully!');
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question. Please try again.');
      }
    }
  };

  const startEditing = (question: BVisaPersonalQuestion) => {
    setEditingQuestionId(question.id);
    setNewQuestion(question.question);
    setNewAnswer(question.answer);
    setIsAddingQuestion(false);
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setNewQuestion('');
    setNewAnswer('');
  };

  const startAdding = () => {
    setIsAddingQuestion(true);
    setEditingQuestionId(null);
    setNewQuestion('');
    setNewAnswer('');
  };

  const getAISuggestion = async () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter a question first');
      return;
    }

    if (!canUse) {
      toast.error('已达到AI建议使用限制');
      return;
    }

    setIsGettingSuggestion(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai/suggestions?topic=b-visa', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 429) {
        const errorData = await response.json();
        toast.error(`已达到AI建议使用限制 (${errorData.used}/${errorData.limit})`);
        return;
      }
      
      if (!response.ok) throw new Error('Failed to get suggestions');
      
      const data = await response.json();
      
      // Use the first suggestion as the answer
      if (data.suggestions && data.suggestions.length > 0) {
        setNewAnswer(data.suggestions[0]);
      }
      
      // Update usage count
      if (data.usage) {
        updateUsage(data.usage.used);
        toast.success(`AI建议已生成! 剩余次数: ${data.usage.remaining}`);
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      toast.error('Failed to get AI suggestion. Please try again.');
    } finally {
      setIsGettingSuggestion(false);
    }
  };

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My B Visa Personal Questions</h2>
        <Button
          onClick={startAdding}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Add Question
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingQuestion || editingQuestionId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingQuestionId ? 'Edit Question' : 'Add New Question'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your B visa question..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer
              </label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Enter the answer or get AI suggestions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap items-center">
                <Button
                  onClick={getAISuggestion}
                  disabled={isGettingSuggestion || !canUse || usageLimitLoading}
                  className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                    canUse 
                      ? 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50' 
                      : 'border-2 border-gray-400 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isGettingSuggestion ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {isGettingSuggestion ? 'Getting Suggestion...' : 'Get AI Suggestions'}
                </Button>
                
                {!usageLimitLoading && (
                  <div className="text-sm text-gray-600">
                    {limit === 0 ? (
                      <span className="text-red-600 font-medium">需要会员订阅</span>
                    ) : canUse ? (
                      <span>剩余次数: {limit - used}/{limit}</span>
                    ) : (
                      <span className="text-red-600 font-medium">已到额度</span>
                    )}
                    {membershipType && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({membershipType})
                      </span>
                    )}
                    

                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={editingQuestionId ? () => handleEditQuestion(editingQuestionId) : handleAddQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </Button>
                <Button
                  onClick={editingQuestionId ? cancelEditing : () => setIsAddingQuestion(false)}
                  className="border-2 border-gray-600 text-gray-600 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't added any personal B visa questions yet.</p>
              <Button
                onClick={startAdding}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Add Your First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="border border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium text-gray-900 pr-4">
                    {question.question}
                  </CardTitle>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => startEditing(question)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                    >
                      修改
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {question.answer}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 