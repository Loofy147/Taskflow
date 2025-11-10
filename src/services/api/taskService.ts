import { supabase } from '@/lib/supabase';
import { activityLogService } from './activityLogService';

export const taskService = {
  async createTask(title: string, description: string | undefined, projectId: string, createdBy: string, assigneeId: string | undefined, status: string, priority: string) {
    const { data, error } = await supabase.from('tasks').insert([{ title, description, project_id: projectId, created_by: createdBy, assignee_id: assigneeId, status, priority }]).select();
    if (error) {
      throw error;
    }

    const { data: projectData } = await supabase.from('projects').select('team_id').eq('id', projectId).single();
    if (projectData) {
      await activityLogService.logActivity({
        team_id: projectData.team_id,
        action: 'created_task',
        entity_type: 'task',
        entity_id: data[0].id,
      });
    }

    return data[0];
  },

  async getTasksByProject(projectId: string) {
    const { data, error } = await supabase.from('tasks').select('*, assignee:users(full_name)').eq('project_id', projectId);
    if (error) {
      throw error;
    }
    return data;
  },

  async updateTask(taskId: string, updates: any) {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId);
    if (error) {
      throw error;
    }
    return data;
  },

  async deleteTask(taskId: string) {
    const { data, error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      throw error;
    }
    return data;
  },

  async searchTasks(query: string) {
    const { data, error } = await supabase.from('tasks').select('*').textSearch('fts', query);
    if (error) {
      throw error;
    }
    return data;
  },
};
