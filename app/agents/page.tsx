import { Bot } from "lucide-react";
import ModuleTemplate from "../module-template";

export default function AgentsPage() {
  return (
    <ModuleTemplate
      title="Agents"
      uiPathRole="Agent inventory and governance profile"
      description="This page will show all submitted AI agents, their owners, models, versions, risk levels, and release status."
      icon={Bot}
    />
  );
}
