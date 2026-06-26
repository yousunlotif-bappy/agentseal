import { ShieldCheck } from "lucide-react";
import ModuleTemplate from "../module-template";

export default function ReleaseCertificatePage() {
  return (
    <ModuleTemplate
      title="Release Certificate"
      uiPathRole="Final production seal"
      description="This page will generate the final AgentSeal production certificate after tests, risk scoring, and human approval are complete."
      icon={ShieldCheck}
    />
  );
}
