import { UserCheck } from "lucide-react";
import ModuleTemplate from "../module-template";

export default function HumanSealGatePage() {
  return (
    <ModuleTemplate
      title="Human Seal Gate"
      uiPathRole="Human Task approval"
      description="This page will let reviewers approve, reject, or request changes before an AI agent is released into production."
      icon={UserCheck}
    />
  );
}
