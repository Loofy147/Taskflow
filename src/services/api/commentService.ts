import { supabase } from '@/lib/supabase';

const getCommentsByTask = async (taskId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, author:users(*)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

const addComment = async (taskId: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert([{ task_id: taskId, content, user_id: user.id }]);

  if (error) throw error;
  return data;
};

export const commentService = {
  getCommentsByTask,
  addComment,
};
