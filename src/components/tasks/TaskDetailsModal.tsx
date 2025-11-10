import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ITask } from '@/types';
import { CommentSection } from './CommentSection';
import { AttachmentSection } from './AttachmentSection';

interface TaskDetailsModalProps {
  task: ITask;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsModal = ({ task, isOpen, onClose }: TaskDetailsModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Status: {task.status}</p>
          <p>Priority: {task.priority}</p>
          <p>Assignee: {task.assignee?.full_name || 'Unassigned'}</p>
        </div>
        <CommentSection taskId={task.id} />
        <AttachmentSection taskId={task.id} />
      </DialogContent>
    </Dialog>
  );
};
