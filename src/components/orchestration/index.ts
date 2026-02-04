/**
 * Action Orchestration Module
 * AI-powered clinical action orchestration with human-in-the-loop workflow
 */

// Main modal component
export { ActionOrchestrationModal } from "./ActionOrchestrationModal";

// Section components
export { LabResultsSection } from "./LabResultsSection";
export { SuggestedActionsSection } from "./SuggestedActionsSection";
export { CurrentMedicationsSection } from "./CurrentMedicationsSection";
export { TaskProgressTracker } from "./TaskProgressTracker";

// Hooks and state management
export {
  useOrchestrationStore,
  useOrchestrationModal,
  useOrchestrationContext,
  useOrchestrationActions,
  useOrchestrationExecution,
  useCheckedActionsCount,
} from "./hooks/useActionOrchestration";

// Types
export type {
  OrchestrationContext,
  Patient,
  Trigger,
  LabResult,
  Medication,
  ClinicalData,
  SuggestedAction,
  TaskProgress,
  ExecutionResult,
  TriggerType,
  UrgencyLevel,
  ActionType,
  TaskStatus,
  LabStatus,
  TrendDirection,
} from "@/src/lib/orchestration/types";

// Demo data
export { demoContext } from "@/src/lib/orchestration/types";

// Utilities
export { executeActions, allActionsSuccessful } from "@/src/lib/orchestration/executeActions";
