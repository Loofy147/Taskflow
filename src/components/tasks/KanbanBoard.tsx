import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { taskService } from "@/services/api/taskService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function KanbanBoard({ tasks }: { tasks: any[] }) {
  const queryClient = useQueryClient();

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string, status: string }) => taskService.updateTask(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    updateTaskStatusMutation.mutate({ taskId: draggableId, status: destination.droppableId });
  };

  const columns = {
    todo: {
      name: "To Do",
      items: tasks.filter((task) => task.status === "todo"),
    },
    in_progress: {
      name: "In Progress",
      items: tasks.filter((task) => task.status === "in_progress"),
    },
    done: {
      name: "Done",
      items: tasks.filter((task) => task.status === "done"),
    },
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <Droppable droppableId={columnId} key={columnId}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-muted/40 rounded-lg p-4"
              >
                <h2 className="text-lg font-bold mb-4">{column.name}</h2>
                {column.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mb-4"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>{item.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{item.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
