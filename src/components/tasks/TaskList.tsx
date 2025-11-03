import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { taskService } from "@/services/api/taskService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITask } from "@/types";

interface TaskListProps {
  tasks: ITask[];
  onTaskClick: (task: ITask) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const queryClient = useQueryClient();

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string, status: string }) => taskService.updateTask(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Card key={task.id} onClick={() => onTaskClick(task)} className="cursor-pointer">
          <CardHeader>
            <CardTitle>{task.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{task.description}</p>
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Assignee: {task.assignee?.full_name || "Unassigned"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Priority: {task.priority}
                </p>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={task.status}
                  onValueChange={(status) => updateTaskStatusMutation.mutate({ taskId: task.id, status })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">Edit</Button>
                <Button variant="destructive" onClick={() => deleteTaskMutation.mutate(task.id)}>Delete</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
