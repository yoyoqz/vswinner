'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Loader2, Plus, Sparkles, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIUsageLimit } from '@/hooks/useAIUsageLimit';

type PersonalQuestion = {
  id: string;
  question: string;
  answer: string;
  isCustom: boolean;
};

interface PersonalizedQuestionsProps {
  questions: PersonalQuestion[];
  onAddQuestion: (question: Omit<PersonalQuestion, 'id'>) => Promise<void>;
  onDeleteQuestion?: (id: string) => Promise<void>;
  onEditQuestion?: (id: string, question: Omit<PersonalQuestion, 'id'>) => Promise<void>;
}

export default function PersonalizedQuestions({ 
  questions, 
  onAddQuestion, 
  onDeleteQuestion, 
  onEditQuestion 
}: PersonalizedQuestionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { used, limit, canUse, membershipType, loading: usageLimitLoading, updateUsage } = useAIUsageLimit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      if (editingId) {
        await onEditQuestion?.(editingId, {
          question,
          answer: answer || 'No answer provided yet.',
          isCustom: true
        });
        toast.success('Question updated successfully!');
        setEditingId(null);
      } else {
        await onAddQuestion({
          question,
          answer: answer || 'No answer provided yet.',
          isCustom: true
        });
        toast.success('Question added successfully!');
      }
      
      setQuestion('');
      setAnswer('');
      setShowForm(false);
    } catch (error) {
      toast.error(editingId ? 'Failed to update question' : 'Failed to add question');
      console.error(error);
    }
  };

  const handleEdit = (item: PersonalQuestion) => {
    setEditingId(item.id);
    setQuestion(item.question);
    setAnswer(item.answer);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await onDeleteQuestion?.(id);
      toast.success('Question deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete question');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setQuestion('');
    setAnswer('');
  };

  // Generate AI suggestions using Grok-3
  const generateAISuggestions = async () => {
    if (!canUse) {
      toast.error('已达到AI建议使用限制');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai/suggestions?topic=f-visa', {
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
      setSuggestedQuestions(data.suggestions);
      
      // Update usage count
      if (data.usage) {
        updateUsage(data.usage.used);
        toast.success(`AI建议已生成! 剩余次数: ${data.usage.remaining}`);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Personal Questions</h2>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <Plus size={16} /> Add Question
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border border-gray-200">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Personal Question' : 'Add Personal Question'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium mb-1">
                  Question
                </label>
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your F-visa related question"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="answer" className="block text-sm font-medium mb-1">
                  Answer (optional)
                </label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Add an answer if you have one"
                  rows={3}
                />
              </div>

              {!editingId && (
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                        canUse 
                          ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50' 
                          : 'border-2 border-gray-400 text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={generateAISuggestions}
                      disabled={loadingSuggestions || !canUse || usageLimitLoading}
                    >
                      {loadingSuggestions ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      Get AI Suggestions (Grok-3)
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
                </div>
              )}

              {suggestedQuestions.length > 0 && !editingId && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium mb-2">Suggested Questions:</p>
                  <ul className="space-y-2">
                    {suggestedQuestions.map((suggestion, index) => (
                      <li key={index}>
                        <Button
                          type="button"
                          className="text-left w-full justify-start text-sm py-1 h-auto text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                onClick={handleCancel}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!question.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
              >
                {editingId ? 'Update Question' : 'Save Question'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((item) => (
            <div 
              key={item.id} 
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              <div className="px-4 py-3 font-medium text-left bg-gray-100 flex justify-between items-center">
                <span>{item.question}</span>
                {item.isCustom && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-1 h-7 px-2 text-xs border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors duration-200"
                    >
                      <Edit2 size={12} />
                      修改
                    </Button>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-1 h-7 px-2 text-xs border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors duration-200"
                    >
                      <Trash2 size={12} />
                      删除
                    </Button>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't added any personal questions yet.</p>
        </div>
      )}
    </div>
  );
} 