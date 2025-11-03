import { useQuery } from '@tanstack/react-query';
import { activityLogService } from '@/services/api/activityLogService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

interface ActivityFeedProps {
  teamId: string;
}

export const ActivityFeed = ({ teamId }: ActivityFeedProps) => {
  const { data: activityLogs } = useQuery({
    queryKey: ['activityLogs', teamId],
    queryFn: () => activityLogService.getActivityLogsByTeam(teamId),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs?.map((log) => (
            <div key={log.id}>
              <p>{log.action}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
