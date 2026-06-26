import { Activity } from "lucide-react";
import ModuleTemplate from "../module-template";

export default function TestExecutionPage() {
  return (
    <ModuleTemplate
      title="Test Execution"
      uiPathRole="UiPath Test Cloud runs tests"
      description="This page will show live execution status, passed tests, failed tests, screenshots, logs, and evidence collection."
      icon={Activity}
    />
  );
}
