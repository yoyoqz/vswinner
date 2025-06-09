'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAIUsageLimit } from '@/hooks/useAIUsageLimit';

type PersonalQuestion = {
  id: string;
  question: string;
  answer: string;
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function PersonalQuestionsManagementPage() {
  const [questions, setQuestions] = useState<PersonalQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<PersonalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { used, limit, canUse, membershipType, loading: usageLimitLoading, updateUsage } = useAIUsageLimit();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/user/personal-questions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch personal questions');
        }

        const data = await response.json();
        const personalQuestions = data.map((q: any) => ({
          ...q,
          isCustom: true,
        }));
        
        setQuestions(personalQuestions);
        setFilteredQuestions(personalQuestions);
      } catch (err) {
        console.error('Error fetching personal questions:', err);
        setError('Failed to load personal questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [isAuthenticated, router]);

  // Search effect
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = questions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [questions, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const url = editingId 
        ? `/api/user/personal-questions/${editingId}`
        : '/api/user/personal-questions';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          answer: answer || 'No answer provided yet.',
        }),
      });

      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update question' : 'Failed to add question');
      }

      const updatedQuestion = await response.json();
      
      if (editingId) {
        setQuestions(prev => prev.map(q => 
          q.id === editingId ? { ...updatedQuestion, isCustom: true } : q
        ));
        toast.success('Question updated successfully!');
        setEditingId(null);
      } else {
        setQuestions(prev => [...prev, { ...updatedQuestion, isCustom: true }]);
        toast.success('Question added successfully!');
      }
      
      setQuestion('');
      setAnswer('');
      setShowForm(false);
      setSuggestedQuestions([]);
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
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/user/personal-questions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(prev => prev.filter(q => q.id !== id));
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
    setSuggestedQuestions([]);
  };

  const generateAISuggestions = async () => {
    if (!canUse) {
      toast.error('已达到AI建议使用限制');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai/suggestions?topic=f-visa&question=' + question, {
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
    setAnswer(suggestion);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Personal F-Visa Questions</h1>
          <p className="text-gray-600 mt-2">Manage your personalized F-visa questions with AI assistance</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/dashboard">
            <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Back to Dashboard
            </Button>
          </Link>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={16} /> Add Question
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-blue-600">{questions.length}</h3>
            <p className="text-sm text-gray-600">Total Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-green-600">{used}</h3>
            <p className="text-sm text-gray-600">AI Suggestions Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-purple-600">{limit - used}</h3>
            <p className="text-sm text-gray-600">AI Suggestions Remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      {questions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              placeholder="Search questions by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6 border border-gray-200">
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
                      disabled={loadingSuggestions || !canUse || usageLimitLoading || !question.trim()}
                    >
                      {loadingSuggestions ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      Get AI Suggestions
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
                  <p className="text-sm font-medium mb-2">Suggested Answers:</p>
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

      {/* Questions List */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Questions ({filteredQuestions.length})
            {searchTerm && <span className="text-gray-500 font-normal"> - Search results for "{searchTerm}"</span>}
          </h2>
          {filteredQuestions.map((item) => (
            <div 
              key={item.id} 
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              <div className="px-4 py-3 font-medium text-left bg-gray-100 flex justify-between items-center">
                <span>{item.question}</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1 h-7 px-2 text-xs border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors duration-200"
                  >
                    <Edit2 size={12} />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1 h-7 px-2 text-xs border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={12} />
                    Delete
                  </Button>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {questions.length === 0 ? (
            <>
              <h3 className="text-xl font-medium text-gray-500">No personal questions found</h3>
              <p className="mt-2 text-gray-400 mb-6">You haven't added any personal F-visa questions yet</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Add Your First Question
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-gray-500">No questions match your search</h3>
              <p className="mt-2 text-gray-400 mb-6">
                No questions found for "{searchTerm}"
              </p>
              <Button
                onClick={() => setSearchTerm('')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Clear Search
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
} 