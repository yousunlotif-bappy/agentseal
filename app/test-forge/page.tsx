import { FlaskConical } from "lucide-react";
import ModuleTemplate from "../module-template";

export default function TestForgePage() {
  return (
    <ModuleTemplate
      title="Test Forge"
      uiPathRole="Agent Builder / coded agent creates tests"
      description="This module will transform business rules into functional, policy, privacy, and tool-safety test cases."
      icon={FlaskConical}
    />
  );
}
