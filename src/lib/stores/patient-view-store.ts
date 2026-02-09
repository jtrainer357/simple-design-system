/**
 * Patient View Store
 * Zustand store for managing Patient 360 progressive disclosure state
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { ViewState, PatientViewStore, ScrollPositions } from "@/src/lib/types/patient-view";
import { isValidTransition } from "@/src/lib/types/patient-view";

/**
 * Initial scroll positions for all states
 */
const initialScrollPositions: ScrollPositions = {
  default: 0,
  summary: 0,
  note: 0,
  fullView: 0,
};

/**
 * Maximum history stack size to prevent memory issues
 */
const MAX_HISTORY_SIZE = 10;

/**
 * Patient View Store
 * Manages view state, navigation history, and scroll positions
 * for the Patient 360 progressive disclosure system
 */
export const usePatientViewStore = create<PatientViewStore>()(
  persist(
    (set, get) => ({
      // Initial state
      viewState: "default" as ViewState,
      previousState: null,
      stateHistory: [],
      selectedVisitId: null,
      selectedNoteId: null,
      scrollPositions: { ...initialScrollPositions },

      /**
       * Transition to a new view state
       * @param state - Target view state
       * @param id - Optional visit or note ID for context
       */
      transitionTo: (state: ViewState, id?: string) => {
        const { viewState: currentState, stateHistory, scrollPositions } = get();

        // Skip if already in target state (unless we have a new ID)
        if (currentState === state && !id) {
          return;
        }

        // Validate transition
        if (!isValidTransition(currentState, state)) {
          console.warn(`Invalid state transition: ${currentState} -> ${state}`);
          return;
        }

        // Build new history stack (limit size)
        const newHistory = [...stateHistory, currentState].slice(-MAX_HISTORY_SIZE);

        // Determine which ID field to update based on target state
        const idUpdates: { selectedVisitId: string | null; selectedNoteId: string | null } = {
          selectedVisitId: get().selectedVisitId,
          selectedNoteId: get().selectedNoteId,
        };

        if (state === "summary" && id) {
          idUpdates.selectedVisitId = id;
        } else if (state === "note" && id) {
          idUpdates.selectedNoteId = id;
        }

        // Clear IDs when going back to default
        if (state === "default") {
          idUpdates.selectedVisitId = null;
          idUpdates.selectedNoteId = null;
        }

        set({
          viewState: state,
          previousState: currentState,
          stateHistory: newHistory,
          ...idUpdates,
          // Reset scroll position for new state
          scrollPositions: {
            ...scrollPositions,
            [state]: 0,
          },
        });
      },

      /**
       * Navigate back to the previous state in history
       */
      goBack: () => {
        const { stateHistory, viewState: currentState, scrollPositions } = get();

        if (stateHistory.length === 0) {
          // No history, go to default
          if (currentState !== "default") {
            set({
              viewState: "default",
              previousState: currentState,
              stateHistory: [],
              selectedVisitId: null,
              selectedNoteId: null,
            });
          }
          return;
        }

        // Pop the last state from history
        const newHistory = [...stateHistory];
        const previousState = newHistory.pop() ?? "default";

        // Clear appropriate IDs based on target state
        const idUpdates: { selectedVisitId: string | null; selectedNoteId: string | null } = {
          selectedVisitId: get().selectedVisitId,
          selectedNoteId: get().selectedNoteId,
        };

        if (previousState === "default") {
          idUpdates.selectedVisitId = null;
          idUpdates.selectedNoteId = null;
        } else if (previousState === "summary") {
          idUpdates.selectedNoteId = null;
        }

        set({
          viewState: previousState,
          previousState: currentState,
          stateHistory: newHistory,
          ...idUpdates,
          // Preserve scroll position when going back
          scrollPositions: {
            ...scrollPositions,
          },
        });
      },

      /**
       * Toggle between current state and fullView
       */
      toggleFullView: () => {
        const { viewState: currentState } = get();

        if (currentState === "fullView") {
          // Go back from fullView
          get().goBack();
        } else {
          // Enter fullView
          get().transitionTo("fullView");
        }
      },

      /**
       * Save scroll position for current state
       * @param position - Scroll position in pixels
       */
      saveScrollPosition: (position: number) => {
        const { viewState, scrollPositions } = get();

        set({
          scrollPositions: {
            ...scrollPositions,
            [viewState]: position,
          },
        });
      },

      /**
       * Get scroll position for current state
       * @returns Scroll position in pixels
       */
      getScrollPosition: () => {
        const { viewState, scrollPositions } = get();
        return scrollPositions[viewState];
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set({
          viewState: "default",
          previousState: null,
          stateHistory: [],
          selectedVisitId: null,
          selectedNoteId: null,
          scrollPositions: { ...initialScrollPositions },
        });
      },
    }),
    {
      name: "patient-view-store",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist these fields
      partialize: (state) => ({
        viewState: state.viewState,
        previousState: state.previousState,
        stateHistory: state.stateHistory,
        selectedVisitId: state.selectedVisitId,
        selectedNoteId: state.selectedNoteId,
        scrollPositions: state.scrollPositions,
      }),
    }
  )
);

// ============================================================================
// Selector Hooks
// These provide optimized subscriptions to specific parts of the state
// ============================================================================

/**
 * Get current view state only
 */
export const useViewState = () => usePatientViewStore((state) => state.viewState);

/**
 * Get navigation-related state and actions
 */
export const usePatientViewNavigation = () =>
  usePatientViewStore(
    useShallow((state) => ({
      viewState: state.viewState,
      previousState: state.previousState,
      canGoBack: state.stateHistory.length > 0 || state.viewState !== "default",
      transitionTo: state.transitionTo,
      goBack: state.goBack,
      toggleFullView: state.toggleFullView,
    }))
  );

/**
 * Get selected IDs for visit/note context
 */
export const useSelectedIds = () =>
  usePatientViewStore(
    useShallow((state) => ({
      selectedVisitId: state.selectedVisitId,
      selectedNoteId: state.selectedNoteId,
    }))
  );

/**
 * Get scroll position utilities
 */
export const useScrollPosition = () =>
  usePatientViewStore(
    useShallow((state) => ({
      saveScrollPosition: state.saveScrollPosition,
      getScrollPosition: state.getScrollPosition,
      currentPosition: state.scrollPositions[state.viewState],
    }))
  );

/**
 * Check if in expanded view (not default)
 */
export const useIsExpanded = () => usePatientViewStore((state) => state.viewState !== "default");

/**
 * Check if roster should be compact
 */
export const useIsRosterCompact = () =>
  usePatientViewStore(
    (state) =>
      state.viewState === "summary" || state.viewState === "note" || state.viewState === "fullView"
  );

/**
 * Get reset function for clearing state
 */
export const usePatientViewReset = () => usePatientViewStore((state) => state.reset);
