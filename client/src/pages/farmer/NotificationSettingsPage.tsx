import { NotificationSettingsForm } from "@/components/NotificationSettings";
import { PageHeader } from "@/components/PageHeader";

export default function NotificationSettingsPage() {
  return (
    <div className="container max-w-4xl py-6">
      <PageHeader
        heading="Notification Settings"
        text="Configure how and when you receive notifications from Greenupp."
      />
      <div className="mt-8">
        <NotificationSettingsForm />
      </div>
    </div>
  );
}