import { supabase } from '@/lib/supabase';
import { teamService } from './teamService';

export const projectService = {
  async createProject(name: string, description: string | undefined, teamId: string, createdBy: string) {
    const { data, error } = await supabase.from('projects').insert([{ name, description, team_id: teamId, created_by: createdBy }]).select();
    if (error) {
      throw error;
    }
    return data[0];
  },

  async getProjectsByTeam(userId: string) {
    const team = await teamService.getCurrentTeam(userId);
    if (!team) {
      return [];
    }
    const { data, error } = await supabase.from('projects').select('*').eq('team_id', team.id);
    if (error) {
      throw error;
    }
    return data;
  },
};
