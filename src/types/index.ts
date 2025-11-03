export interface ITask {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  assignee_id: string | null;
  created_at: string;
  assignee?: {
    full_name: string | null;
  } | null;
}
