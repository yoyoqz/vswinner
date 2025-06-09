'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface FVisaQuestion {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FVisaQuestionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsUpdated: () => void;
}

export default function FVisaQuestionsManager({
  isOpen,
  onClose,
  onQuestionsUpdated
}: FVisaQuestionsManagerProps) {
  const { user, isAdmin } = useAuth();
  const [questions, setQuestions] = useState<FVisaQuestion[]>([]);
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
      const response = await fetch('/api/visa/f-visa/questions');
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
        const response = await fetch(`/api/visa/f-visa/questions/${id}`, {
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
      const response = await fetch(`/api/visa/f-visa/questions/${id}`, {
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
      const response = await fetch('/api/visa/f-visa/questions', {
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
      const response = await fetch(`/api/visa/f-visa/questions/${id}`, {
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

  const startEditing = (question: FVisaQuestion) => {
    setEditingQuestionId(question.id);
    setNewQuestion(question.question);
    setNewAnswer(question.answer);
    setIsAddingQuestion(false);
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setNewQuestion('');
    setNewAnswer('');
    setIsAddingQuestion(false);
  };

  const startAdding = () => {
    setIsAddingQuestion(true);
    setEditingQuestionId(null);
    setNewQuestion('');
    setNewAnswer('');
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to manage questions.</p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">F Visa Questions Management</h2>
            <Button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchQuestions}>Retry</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Questions ({questions.length})
                </h3>
                <Button
                  onClick={startAdding}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Add New Question
                </Button>
              </div>

              {isAddingQuestion && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800">Add New Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question
                      </label>
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter the question..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer
                      </label>
                      <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter the answer..."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex space-x-2">
                    <Button
                      onClick={handleAddQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Add Question
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {questions.map((question, index) => (
                <Card key={question.id} className="border border-gray-200">
                  {editingQuestionId === question.id ? (
                    <>
                      <CardHeader>
                        <CardTitle className="text-orange-800">Edit Question</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question
                          </label>
                          <textarea
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            rows={2}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer
                          </label>
                          <textarea
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex space-x-2">
                        <Button
                          onClick={() => handleEditQuestion(question.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Save Changes
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Cancel
                        </Button>
                      </CardFooter>
                    </>
                  ) : (
                    <>
                      <CardHeader>
                        <CardTitle className="text-gray-800 text-lg">
                          {question.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-600 whitespace-pre-wrap">
                          {question.answer}
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          Order: {question.order} | Created: {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white text-sm py-1 px-3 rounded transition-colors duration-200"
                          >
                            ↑ Move Up
                          </Button>
                          <Button
                            onClick={() => moveDown(index)}
                            disabled={index === questions.length - 1}
                            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white text-sm py-1 px-3 rounded transition-colors duration-200"
                          >
                            ↓ Move Down
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => startEditing(question)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteQuestion(question.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No questions found</p>
                  <Button
                    onClick={startAdding}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Add First Question
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 