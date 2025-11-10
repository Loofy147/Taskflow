import { supabase } from '@/lib/supabase';

export const teamService = {
  async createTeam(name: string, ownerId: string) {
    const { data, error } = await supabase.from('teams').insert([{ name, owner_id: ownerId }]).select();
    if (error) {
      throw error;
    }
    return data[0];
  },

  async addTeamMember(teamId: string, userId: string, role: string) {
    const { data, error } = await supabase.from('team_members').insert([{ team_id: teamId, user_id: userId, role }]);
    if (error) {
      throw error;
    }
    return data;
  },

  async inviteMember(email: string, teamId: string, role: string) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        team_id: teamId,
        role: role,
      }
    });
    if (error) {
      throw error;
    }
    return data;
  },

  async getCurrentTeam(userId: string) {
    const { data, error } = await supabase.from('teams').select('*, team_members(*)').eq('team_members.user_id', userId).single();
    if (error) {
      throw error;
    }
    return data;
  }
};
