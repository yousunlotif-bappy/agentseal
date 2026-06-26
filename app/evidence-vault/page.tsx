import { Vault } from "lucide-react";
import ModuleTemplate from "../module-template";

export default function EvidenceVaultPage() {
  return (
    <ModuleTemplate
      title="Evidence Vault"
      uiPathRole="Audit-ready evidence"
      description="This module will store test reports, screenshots, execution logs, risk decisions, and reviewer approvals for audit readiness."
      icon={Vault}
    />
  );
}
