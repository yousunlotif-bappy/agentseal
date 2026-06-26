import { Gauge } from "lucide-react";
import ModuleTemplate from "../module-template";

export default function RiskSealPage() {
  return (
    <ModuleTemplate
      title="RiskSeal"
      uiPathRole="Risk scoring workflow"
      description="This module will calculate the final trust score using policy compliance, red-team outcomes, privacy risk, and business impact."
      icon={Gauge}
    />
  );
}
