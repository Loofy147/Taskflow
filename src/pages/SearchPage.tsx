import { taskService } from "@/services/api/taskService";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { TaskList } from "@/components/tasks/TaskList";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", "search", query],
    queryFn: () => taskService.searchTasks(query),
    enabled: !!query,
  });

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground">Showing results for "{query}"</p>
      </div>
      <div>
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : (
          <TaskList tasks={tasks || []} />
        )}
      </div>
    </div>
  );
}
