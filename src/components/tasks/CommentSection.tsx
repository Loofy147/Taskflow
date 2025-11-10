import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '@/services/api/commentService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth';

interface CommentSectionProps {
  taskId: string;
}

export const CommentSection = ({ taskId }: CommentSectionProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');

  const { data: comments } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentService.getCommentsByTask(taskId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentService.addComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setNewComment('');
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      <div className="mt-2 space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3">
            <Avatar>
              <AvatarImage src={comment.author?.avatar_url} />
              <AvatarFallback>{comment.author?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{comment.author?.full_name}</p>
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <Button onClick={handleAddComment} className="mt-2">
          Add Comment
        </Button>
      </div>
    </div>
  );
};
