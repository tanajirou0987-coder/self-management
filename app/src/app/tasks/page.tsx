import { ClientOnly } from "@/components/ClientOnly";
import { TasksPage } from "@/components/pages/TasksPage";

export default function Tasks() {
  return (
    <ClientOnly>
      <TasksPage />
    </ClientOnly>
  );
}

