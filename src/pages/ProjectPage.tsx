import { useState, useEffect } from "react";
import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { taskService } from "@/services/api/taskService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { ITask } from "@/types";
import { TaskDetailsModal } from "@/components/tasks/TaskDetailsModal";

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [view, setView] = useState("list");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskService.getTasksByProject(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const channel = supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  const handleTaskClick = (task: ITask) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  if (!projectId) {
    return <div>Project not found</div>;
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Project</h1>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Manage your project tasks.</p>
          <div className="flex gap-2">
            <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}>List</Button>
            <Button variant={view === "kanban" ? "default" : "outline"} onClick={() => setView("kanban")}>Kanban</Button>
            <CreateTaskForm projectId={projectId} />
          </div>
        </div>
      </div>
      <div>
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : view === "list" ? (
          <TaskList tasks={tasks || []} onTaskClick={handleTaskClick} />
        ) : (
          <KanbanBoard tasks={tasks || []} onTaskClick={handleTaskClick} />
        )}
      </div>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
