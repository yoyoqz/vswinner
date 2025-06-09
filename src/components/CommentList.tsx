'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { formatTextForReact } from '@/lib/formatText';

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type CommentListProps = {
  comments: Comment[];
};

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.user.id;
  
  return (
    <Card className={isAuthor ? 'border-blue-200' : ''}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {comment.user.name || comment.user.email.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
          </div>
          {isAuthor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              You
            </span>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-700" dangerouslySetInnerHTML={formatTextForReact(comment.content)} />
      </CardContent>
    </Card>
  );
} 