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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/useAuthStore";
import { teamService } from "@/services/api/teamService";
import { useQuery } from "@tanstack/react-query";

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "manager", "member"]),
});

type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export function InviteMemberForm() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
  });
  const { user } = useAuthStore();
  const { data: team } = useQuery({
    queryKey: ["team", user?.id],
    queryFn: () => teamService.getCurrentTeam(user!.id),
    enabled: !!user,
  });

  const onSubmit = async (data: InviteMemberFormValues) => {
    if (!team) {
      return;
    }
    try {
      await teamService.inviteMember(data.email, team.id, data.role);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Invite Member</CardTitle>
        <CardDescription>
          Enter the email and role of the new member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => setValue("role", value as "admin" | "manager" | "member")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </div>
          <Button type="submit" className="w-full">
            Invite member
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
