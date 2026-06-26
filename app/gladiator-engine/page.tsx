import { Swords } from "lucide-react";
import ModuleTemplate from "../module-template";

export default function GladiatorEnginePage() {
  return (
    <ModuleTemplate
      title="Gladiator Engine"
      uiPathRole="Red-team agent creates adversarial prompts"
      description="This module will generate prompt-injection, jailbreak, data-exposure, hallucination, and forbidden-action attacks."
      icon={Swords}
    />
  );
}
