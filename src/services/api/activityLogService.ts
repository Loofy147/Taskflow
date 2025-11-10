import { supabase } from '@/lib/supabase';

interface LogActivityPayload {
  team_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: object;
}

const logActivity = async (payload: LogActivityPayload) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('activity_logs')
    .insert([{ ...payload, user_id: user.id }]);

  if (error) throw error;
  return data;
};

const getActivityLogsByTeam = async (teamId: string) => {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const activityLogService = {
  logActivity,
  getActivityLogsByTeam,
};
