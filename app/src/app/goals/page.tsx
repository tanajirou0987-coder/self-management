import { ClientOnly } from "@/components/ClientOnly";
import { GoalsPage } from "@/components/pages/GoalsPage";

export default function Goals() {
  return (
    <ClientOnly>
      <GoalsPage />
    </ClientOnly>
  );
}

