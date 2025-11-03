import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { projectService } from "@/services/api/projectService";
import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/api/teamService";
import { useNavigate } from "react-router-dom";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export function CreateProjectForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
  });
  const { user } = useAuthStore();
  const { data: team } = useQuery({
    queryKey: ["team", user?.id],
    queryFn: () => teamService.getCurrentTeam(user!.id),
    enabled: !!user,
  });
  const navigate = useNavigate();

  const onSubmit = async (data: CreateProjectFormValues) => {
    if (!team || !user) {
      return;
    }
    try {
      await projectService.createProject(data.name, data.description, team.id, user.id);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Create Project</CardTitle>
        <CardDescription>
          Enter a name and description for your new project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" placeholder="Website Redesign" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="A brief description of the project." {...register("description")} />
          </div>
          <Button type="submit" className="w-full">
            Create project
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
