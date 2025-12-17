import { ClientOnly } from "@/components/ClientOnly";
import { SettingsPage } from "@/components/pages/SettingsPage";

export default function Settings() {
  return (
    <ClientOnly>
      <SettingsPage />
    </ClientOnly>
  );
}

