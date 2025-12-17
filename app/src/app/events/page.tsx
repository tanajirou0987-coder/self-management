import { ClientOnly } from "@/components/ClientOnly";
import { EventsPage } from "@/components/pages/EventsPage";

export default function Events() {
  return (
    <ClientOnly>
      <EventsPage />
    </ClientOnly>
  );
}

