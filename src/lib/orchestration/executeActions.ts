/**
 * executeActions - Action Execution Utility
 * Simulates executing clinical actions sequentially with realistic delays
 */

import type { SuggestedAction, ExecutionResult, TaskStatus } from "./types";

// Simulated delay for each action type (in milliseconds)
const ACTION_DELAYS: Record<string, number> = {
  message: 800,
  order: 1200,
  medication: 1000,
  task: 600,
  document: 900,
};

/**
 * Execute a single action with simulated delay
 */
async function executeAction(action: SuggestedAction): Promise<ExecutionResult> {
  const delay = ACTION_DELAYS[action.type] || 800;

  // Simulate network request / processing time
  await new Promise((resolve) => setTimeout(resolve, delay));

  // In production, this would make actual API calls
  // For demo purposes, always succeed
  return {
    actionId: action.id,
    success: true,
  };
}

/**
 * Execute all checked actions sequentially
 * Calls onProgress callback after each action completes
 */
export async function executeActions(
  actions: SuggestedAction[],
  onProgress: (actionId: string, status: TaskStatus) => void
): Promise<ExecutionResult[]> {
  const checkedActions = actions.filter((action) => action.checked);
  const results: ExecutionResult[] = [];

  for (const action of checkedActions) {
    // Mark action as executing
    onProgress(action.id, "executing");

    try {
      const result = await executeAction(action);
      results.push(result);

      // Mark action as completed or failed
      onProgress(action.id, result.success ? "completed" : "failed");
    } catch (error) {
      results.push({
        actionId: action.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      onProgress(action.id, "failed");
    }
  }

  return results;
}

/**
 * Check if all actions completed successfully
 */
export function allActionsSuccessful(results: ExecutionResult[]): boolean {
  return results.every((result) => result.success);
}
