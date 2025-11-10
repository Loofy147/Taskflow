import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { taskService } from "@/services/api/taskService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teamService } from "@/services/api/teamService";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export function CreateTaskForm({ projectId }: { projectId: string }) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: "todo",
      priority: "medium",
    },
  });
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: team } = useQuery({
    queryKey: ["team", user?.id],
    queryFn: () => teamService.getCurrentTeam(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTaskFormValues) => {
      if (!user) {
        throw new Error("User not found");
      }
      return taskService.createTask(data.title, data.description, projectId, user.id, data.assigneeId, data.status, data.priority);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      reset();
    },
  });

  const onSubmit = (data: CreateTaskFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Enter the details of your new task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" className="col-span-3" {...register("title")} />
            {errors.title && <p className="text-red-500 text-sm col-span-4">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea id="description" className="col-span-3" {...register("description")} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assigneeId" className="text-right">
              Assignee
            </Label>
            <Select onValueChange={(value) => setValue("assigneeId", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an assignee" />
              </SelectTrigger>
              <SelectContent>
                {team?.team_members.map((member: any) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.users.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(value) => setValue("status", value as "todo" | "in_progress" | "done")}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select onValueChange={(value) => setValue("priority", value as "low" | "medium" | "high" | "urgent")}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Create task</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
