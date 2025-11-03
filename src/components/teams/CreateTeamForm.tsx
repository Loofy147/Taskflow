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
import { teamService } from "@/services/api/teamService";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
});

type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

export function CreateTeamForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
  });
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: CreateTeamFormValues) => {
    if (!user) {
      return;
    }
    try {
      const newTeam = await teamService.createTeam(data.name, user.id);
      await teamService.addTeamMember(newTeam.id, user.id, 'admin');
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Create Team</CardTitle>
        <CardDescription>
          Enter a name for your new team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Team name</Label>
            <Input id="name" placeholder="Acme Inc." {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <Button type="submit" className="w-full">
            Create team
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
