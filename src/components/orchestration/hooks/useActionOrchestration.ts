/**
 * useActionOrchestration - Zustand Store
 * State management for the AI Action Orchestration Modal
 */

import { create } from "zustand";
import type {
  OrchestrationContext,
  SuggestedAction,
  TaskProgress,
  TaskStatus,
} from "@/src/lib/orchestration/types";

interface OrchestrationState {
  // Modal state
  isOpen: boolean;
  context: OrchestrationContext | null;

  // Actions state (mutable copy for checkbox toggling)
  actions: SuggestedAction[];

  // Execution state
  isExecuting: boolean;
  taskProgress: TaskProgress[];

  // Full-page execution overlay
  showExecutionOverlay: boolean;

  // Track completed patient IDs
  completedPatientIds: string[];

  // Modal controls
  openModal: (context: OrchestrationContext) => void;
  closeModal: () => void;

  // Action controls
  toggleAction: (actionId: string) => void;
  setAllActions: (checked: boolean) => void;

  // Execution controls
  startExecution: () => void;
  updateTaskProgress: (actionId: string, status: TaskStatus) => void;
  completeExecution: () => void;
  resetExecution: () => void;

  // Overlay controls
  showOverlay: () => void;
  hideOverlay: () => void;
  markPatientCompleted: (patientId: string) => void;
}

export const useOrchestrationStore = create<OrchestrationState>((set, get) => ({
  // Initial state
  isOpen: false,
  context: null,
  actions: [],
  isExecuting: false,
  taskProgress: [],
  showExecutionOverlay: false,
  completedPatientIds: [],

  // Open modal with context
  openModal: (context: OrchestrationContext) =>
    set({
      isOpen: true,
      context,
      actions: context.suggestedActions.map((action) => ({ ...action })),
      isExecuting: false,
      taskProgress: [],
    }),

  // Close modal and reset state
  closeModal: () =>
    set({
      isOpen: false,
      context: null,
      actions: [],
      isExecuting: false,
      taskProgress: [],
    }),

  // Toggle individual action checkbox
  toggleAction: (actionId: string) => {
    const { isExecuting, actions } = get();
    if (isExecuting) return; // Prevent toggling during execution

    set({
      actions: actions.map((action) =>
        action.id === actionId ? { ...action, checked: !action.checked } : action
      ),
    });
  },

  // Set all actions to checked/unchecked
  setAllActions: (checked: boolean) => {
    const { isExecuting, actions } = get();
    if (isExecuting) return;

    set({
      actions: actions.map((action) => ({ ...action, checked })),
    });
  },

  // Start execution - initialize task progress for checked actions
  startExecution: () => {
    const { actions } = get();
    const checkedActions = actions.filter((action) => action.checked);

    set({
      isExecuting: true,
      taskProgress: checkedActions.map((action) => ({
        actionId: action.id,
        status: "pending" as TaskStatus,
      })),
    });
  },

  // Update individual task progress
  updateTaskProgress: (actionId: string, status: TaskStatus) => {
    const { taskProgress } = get();

    set({
      taskProgress: taskProgress.map((task) =>
        task.actionId === actionId
          ? {
              ...task,
              status,
              completedAt: status === "completed" ? new Date() : task.completedAt,
            }
          : task
      ),
    });
  },

  // Complete execution
  completeExecution: () => {
    set({ isExecuting: false });
  },

  // Reset execution state (for retry scenarios)
  resetExecution: () => {
    set({
      isExecuting: false,
      taskProgress: [],
    });
  },

  // Show full-page execution overlay
  showOverlay: () => {
    set({ showExecutionOverlay: true });
  },

  // Hide full-page execution overlay
  hideOverlay: () => {
    set({
      showExecutionOverlay: false,
      isExecuting: false,
      taskProgress: [],
    });
  },

  // Mark a patient as having completed actions
  markPatientCompleted: (patientId: string) => {
    const { completedPatientIds } = get();
    if (!completedPatientIds.includes(patientId)) {
      set({ completedPatientIds: [...completedPatientIds, patientId] });
    }
  },
}));

// Selector hooks for optimized re-renders
export const useOrchestrationModal = () =>
  useOrchestrationStore((state) => ({
    isOpen: state.isOpen,
    openModal: state.openModal,
    closeModal: state.closeModal,
  }));

export const useOrchestrationContext = () => useOrchestrationStore((state) => state.context);

export const useOrchestrationActions = () =>
  useOrchestrationStore((state) => ({
    actions: state.actions,
    toggleAction: state.toggleAction,
    setAllActions: state.setAllActions,
  }));

export const useOrchestrationExecution = () =>
  useOrchestrationStore((state) => ({
    isExecuting: state.isExecuting,
    taskProgress: state.taskProgress,
    startExecution: state.startExecution,
    updateTaskProgress: state.updateTaskProgress,
    completeExecution: state.completeExecution,
    resetExecution: state.resetExecution,
  }));

export const useExecutionOverlay = () =>
  useOrchestrationStore((state) => ({
    showExecutionOverlay: state.showExecutionOverlay,
    showOverlay: state.showOverlay,
    hideOverlay: state.hideOverlay,
    taskProgress: state.taskProgress,
    actions: state.actions,
    context: state.context,
    isExecuting: state.isExecuting,
    startExecution: state.startExecution,
    updateTaskProgress: state.updateTaskProgress,
    completeExecution: state.completeExecution,
    markPatientCompleted: state.markPatientCompleted,
  }));

export const useCompletedPatients = () =>
  useOrchestrationStore((state) => state.completedPatientIds);

export const useCheckedActionsCount = () =>
  useOrchestrationStore((state) => state.actions.filter((a) => a.checked).length);
