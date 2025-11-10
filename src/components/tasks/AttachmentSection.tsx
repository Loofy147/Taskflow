import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentService } from '@/services/api/attachmentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';

interface AttachmentSectionProps {
  taskId: string;
}

export const AttachmentSection = ({ taskId }: AttachmentSectionProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);

  const { data: attachments } = useQuery({
    queryKey: ['attachments', taskId],
    queryFn: () => attachmentService.getAttachmentsByTask(taskId),
  });

  const addAttachmentMutation = useMutation({
    mutationFn: (file: File) => attachmentService.addAttachment(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      setFile(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddAttachment = () => {
    if (file) {
      addAttachmentMutation.mutate(file);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Attachments</h3>
      <div className="mt-2 space-y-2">
        {attachments?.map((attachment) => (
          <div key={attachment.id} className="flex items-center justify-between">
            <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
              {attachment.file_name}
            </a>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Input type="file" onChange={handleFileChange} />
        <Button onClick={handleAddAttachment} className="mt-2">
          Add Attachment
        </Button>
      </div>
    </div>
  );
};
