import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FarmerTask } from "@shared/schema";

export function useTasks() {
  const { toast } = useToast();

  // Fetch all tasks
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery<FarmerTask[]>({
    queryKey: ["/api/tasks"],
    staleTime: 30000, // 30 seconds
  });

  // Create a new task
  const createTaskMutation = useMutation({
    mutationFn: async (task: any) => {
      const res = await apiRequest("POST", "/api/tasks", task);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create task");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update a task
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/tasks/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete a task
  const completeTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/tasks/${id}/complete`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task completed",
        description: "Your task has been marked as completed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to complete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch tasks by date
  const fetchTasksByDate = (date: string) => {
    return useQuery<FarmerTask[]>({
      queryKey: ["/api/tasks/date", date],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/tasks/date/${date}`);
        return res.json();
      },
    });
  };

  // Fetch tasks by date range
  const fetchTasksByDateRange = (startDate: string, endDate: string) => {
    return useQuery<FarmerTask[]>({
      queryKey: ["/api/tasks/range", startDate, endDate],
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/tasks/range/${startDate}/${endDate}`
        );
        return res.json();
      },
    });
  };

  // Fetch tasks by priority
  const fetchTasksByPriority = (priority: string) => {
    return useQuery<FarmerTask[]>({
      queryKey: ["/api/tasks/priority", priority],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/tasks/priority/${priority}`);
        return res.json();
      },
    });
  };

  return {
    tasks,
    isLoadingTasks,
    tasksError,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    completeTaskMutation,
    fetchTasksByDate,
    fetchTasksByDateRange,
    fetchTasksByPriority,
  };
}
