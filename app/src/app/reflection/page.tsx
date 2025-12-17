import { ClientOnly } from "@/components/ClientOnly";
import { ReflectionPage } from "@/components/pages/ReflectionPage";

export default function Reflection() {
  return (
    <ClientOnly>
      <ReflectionPage />
    </ClientOnly>
  );
}

