import { supabase } from '@/lib/supabase';

const getNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const markAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
  return data;
};

export const notificationService = {
  getNotifications,
  markAsRead,
};
