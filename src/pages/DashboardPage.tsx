import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/api/teamService";
import { ActivityFeed } from "@/components/activity/ActivityFeed";

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: teams } = useQuery({
    queryKey: ["teams", user?.id],
    queryFn: () => teamService.getTeams(),
    enabled: !!user,
  });

  const currentTeam = teams?.[0];

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {currentTeam && <ActivityFeed teamId={currentTeam.id} />}
    </div>
  );
}
