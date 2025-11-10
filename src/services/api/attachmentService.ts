import { supabase } from '@/lib/supabase';

const getAttachmentsByTask = async (taskId: string) => {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

const addAttachment = async (taskId: string, file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${taskId}/${new Date().getTime()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('attachments')
    .insert([
      {
        task_id: taskId,
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type
      }
    ]);

  if (error) throw error;
  return data;
};

export const attachmentService = {
  getAttachmentsByTask,
  addAttachment,
};
