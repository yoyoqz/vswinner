'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface BVisaQuestion {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface BVisaQuestionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsUpdated: () => void;
}

export default function BVisaQuestionsManager({
  isOpen,
  onClose,
  onQuestionsUpdated
}: BVisaQuestionsManagerProps) {
  const { user, isAdmin } = useAuth();
  const [questions, setQuestions] = useState<BVisaQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchQuestions();
    }
  }, [isOpen, isAdmin]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/visa/b-visa/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch(`/api/visa/b-visa/questions/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete question');
        }
        setQuestions(questions.filter(q => q.id !== id));
        onQuestionsUpdated();
        toast.success('Question deleted successfully!');
      } catch (err: any) {
        console.error('Error deleting question:', err);
        toast.error(err.message || 'Failed to delete question');
      }
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/visa/b-visa/questions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: newOrder }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      fetchQuestions(); // Refresh the list after reordering
      onQuestionsUpdated();
    } catch (err: any) {
      console.error('Error updating order:', err);
      toast.error(err.message || 'Failed to update order');
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const currentOrder = questions[index].order;
      const prevOrder = questions[index - 1].order;
      
      updateOrder(questions[index].id, prevOrder);
      updateOrder(questions[index - 1].id, currentOrder);
    }
  };

  const moveDown = (index: number) => {
    if (index < questions.length - 1) {
      const currentOrder = questions[index].order;
      const nextOrder = questions[index + 1].order;
      
      updateOrder(questions[index].id, nextOrder);
      updateOrder(questions[index + 1].id, currentOrder);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    try {
      const response = await fetch('/api/visa/b-visa/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add question');
      }

      const newQuestionData = await response.json();
      setQuestions([...questions, newQuestionData]);
      setNewQuestion('');
      setNewAnswer('');
      setIsAddingQuestion(false);
      onQuestionsUpdated();
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
      const response = await fetch(`/api/visa/b-visa/questions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      const updatedQuestion = await response.json();
      setQuestions(questions.map(q => q.id === id ? updatedQuestion : q));
      setNewQuestion('');
      setNewAnswer('');
      setEditingQuestionId(null);
      onQuestionsUpdated();
      toast.success('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question. Please try again.');
    }
  };

  const startEditing = (question: BVisaQuestion) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage B Visa Questions</h2>
            <p className="text-gray-600 mt-1">Add, edit, and manage frequently asked questions</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={startAdding}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Add New Question
            </Button>
            <Button
              onClick={onClose}
              className="border-2 border-gray-600 text-gray-600 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="p-6">
            {/* Add/Edit Form */}
            {(isAddingQuestion || editingQuestionId) && (
              <Card className="mb-6 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">
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
                      placeholder="Enter the question..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer (HTML supported)
                    </label>
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Enter the answer with HTML formatting..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={8}
                    />
                  </div>
                  <div className="flex gap-2">
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
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-600">No questions yet</h3>
                <p className="mt-2 text-gray-500">Add your first question to get started</p>
                <div className="mt-4">
                  <Button
                    onClick={startAdding}
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Add Question
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="shadow-md border">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold pr-4">{question.question}</CardTitle>
                          <div className="text-sm text-gray-500 mt-1">Order: {question.order}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div 
                        className="text-sm text-gray-700 line-clamp-3" 
                        dangerouslySetInnerHTML={{ __html: question.answer }} 
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm disabled:border-gray-400 disabled:text-gray-400"
                        >
                          Move Up
                        </Button>
                        <Button 
                          onClick={() => moveDown(index)}
                          disabled={index === questions.length - 1}
                          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm disabled:border-gray-400 disabled:text-gray-400"
                        >
                          Move Down
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => startEditing(question)}
                          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteQuestion(question.id)}
                          className="border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 