import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskManager } from "@/components/farmer/TaskManager";

export default function TasksPage() {
  return (
    <DashboardLayout
      title="Task Management"
      description="Organize and track all your farming tasks and reminders"
    >
      <TaskManager />
    </DashboardLayout>
  );
}