import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { insertFarmerTaskSchema } from "@shared/schema";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useAuth } from "@/hooks/use-auth";

// Task priority colors
const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

// Extend the schema for form validation
const taskFormSchema = insertFarmerTaskSchema.extend({
  dueDate: z.date({
    required_error: "Please select a due date",
  }),
});

export function TaskManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedPriority, setSelectedPriority] = useState<
    string | undefined
  >();
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >();
  const [activeTab, setActiveTab] = useState("all");

  const {
    tasks,
    isLoadingTasks,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    completeTaskMutation,
  } = useTasks();

  const { user } = useAuth();

  // Task form
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      userId: user?.id,
      title: "",
      description: "",
      priority: "medium",
      dueDate: new Date(),
    },
  });

  // Handler for task creation
  const onSubmit = (values: z.infer<typeof taskFormSchema>) => {
    console.log("onSubmit called with values:", values);

    // Transform the data to match the API expectations
    const taskData = {
      ...values,
      dueDate: values.dueDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
    };

    console.log("Submitting task data:", taskData); // Debug log

    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        console.log("Task created successfully!");
        setIsCreateDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        console.error("Task creation error:", error); // Debug log
      },
    });
  };

  // Filter tasks based on the active tab
  const filteredTasks = () => {
    if (!tasks) return [];

    switch (activeTab) {
      case "calendar":
        return selectedDate
          ? tasks.filter(
              (task) =>
                format(new Date(task.dueDate), "yyyy-MM-dd") ===
                format(selectedDate, "yyyy-MM-dd")
            )
          : tasks;

      case "priority":
        return selectedPriority
          ? tasks.filter((task) => task.priority === selectedPriority)
          : tasks;

      case "range":
        if (!dateRange?.from || !dateRange?.to) return tasks;
        return tasks.filter((task) => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= dateRange.from && taskDate <= dateRange.to;
        });

      case "completed":
        return tasks.filter((task) => task.completed);

      case "pending":
        return tasks.filter((task) => !task.completed);

      default:
        return tasks;
    }
  };

  // Mark a task as complete
  const handleCompleteTask = (id: number) => {
    completeTaskMutation.mutate(id);
  };

  // Delete a task
  const handleDeleteTask = (id: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your schedule. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  console.log("Form submitted, calling handleSubmit...");
                  form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Task description"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field?.value!}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="range">Date Range</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Filter Controls */}
        <div className="mb-6 mt-4">
          {activeTab === "calendar" && (
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-3">Select a date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          )}

          {activeTab === "priority" && (
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-3">Select priority level</h3>
              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {activeTab === "range" && (
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-3">Select date range</h3>
              <div className="flex flex-col space-y-3">
                <div>
                  <p className="text-sm mb-1">Start Date:</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        {dateRange?.from ? (
                          format(dateRange.from, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.from}
                        onSelect={(date) =>
                          setDateRange((prev) => ({
                            from: date || new Date(),
                            to: prev?.to || new Date(),
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <p className="text-sm mb-1">End Date:</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        {dateRange?.to ? (
                          format(dateRange.to, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.to}
                        onSelect={(date) =>
                          setDateRange((prev) => ({
                            from: prev?.from || new Date(),
                            to: date || new Date(),
                          }))
                        }
                        disabled={(date) =>
                          date < (dateRange?.from || new Date())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoadingTasks ? (
            <p>Loading tasks...</p>
          ) : filteredTasks().length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            filteredTasks().map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "overflow-hidden",
                  task.completed && "opacity-75"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle
                      className={cn(
                        "text-lg",
                        task.completed && "line-through"
                      )}
                    >
                      {task.title}
                    </CardTitle>
                    <Badge
                      className={`${
                        priorityColors[
                          task.priority as keyof typeof priorityColors
                        ]
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <CardDescription>
                    Due: {format(new Date(task.dueDate), "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p
                    className={cn("text-sm", task.completed && "line-through")}
                  >
                    {task.description || "No description provided"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center">
                    <Checkbox
                      id={`task-complete-${task.id}`}
                      checked={task.completed as CheckedState}
                      onCheckedChange={() => {
                        if (!task.completed) {
                          handleCompleteTask(task.id);
                        }
                      }}
                      disabled={task?.completed!}
                    />
                    <label
                      htmlFor={`task-complete-${task.id}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {task.completed ? "Completed" : "Mark as complete"}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}
