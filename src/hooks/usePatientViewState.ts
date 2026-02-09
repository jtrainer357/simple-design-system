"use client";

/**
 * usePatientViewState Hook
 * Custom hook for Patient 360 progressive disclosure system
 * Combines store state with computed layout values and transition configs
 */

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePatientViewStore } from "@/src/lib/stores/patient-view-store";
import {
  LAYOUT_DIMENSIONS,
  DEFAULT_TRANSITION,
  type ViewState,
  type LayoutDimensions,
  type TransitionConfig,
  type UsePatientViewStateReturn,
} from "@/src/lib/types/patient-view";

/**
 * Main hook for accessing patient view state with computed layout values
 *
 * @example
 * ```tsx
 * function PatientRoster() {
 *   const { layout, viewState, transitionTo, canGoBack, goBack } = usePatientViewState();
 *
 *   return (
 *     <motion.div
 *       animate={{ width: layout.rosterWidth }}
 *       transition={transition}
 *     >
 *       {layout.rosterVisible && <PatientCards compact={layout.headerCompact} />}
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function usePatientViewState(): UsePatientViewStateReturn {
  // Get all store state and actions using shallow comparison for optimization
  const storeState = usePatientViewStore(
    useShallow((state) => ({
      viewState: state.viewState,
      previousState: state.previousState,
      stateHistory: state.stateHistory,
      selectedVisitId: state.selectedVisitId,
      selectedNoteId: state.selectedNoteId,
      scrollPositions: state.scrollPositions,
      transitionTo: state.transitionTo,
      goBack: state.goBack,
      toggleFullView: state.toggleFullView,
      saveScrollPosition: state.saveScrollPosition,
      getScrollPosition: state.getScrollPosition,
      reset: state.reset,
    }))
  );

  // Compute layout dimensions based on current view state
  const layout: LayoutDimensions = useMemo(() => {
    return LAYOUT_DIMENSIONS[storeState.viewState];
  }, [storeState.viewState]);

  // Memoize transition config (static but memoized for referential equality)
  const transition: TransitionConfig = useMemo(() => {
    return { ...DEFAULT_TRANSITION };
  }, []);

  // Compute derived boolean states
  const isExpanded = storeState.viewState !== "default";
  const isRosterCompact =
    storeState.viewState === "summary" ||
    storeState.viewState === "note" ||
    storeState.viewState === "fullView";
  const canGoBack = storeState.stateHistory.length > 0 || storeState.viewState !== "default";

  return {
    ...storeState,
    layout,
    transition,
    isExpanded,
    isRosterCompact,
    canGoBack,
  };
}

/**
 * Hook for getting layout dimensions only
 * Use this when you only need layout values without actions
 */
export function usePatientViewLayout(): LayoutDimensions {
  const viewState = usePatientViewStore((state) => state.viewState);
  return useMemo(() => LAYOUT_DIMENSIONS[viewState], [viewState]);
}

/**
 * Hook for getting transition configuration
 * Returns a stable reference to transition settings for Framer Motion
 */
export function usePatientViewTransition(): TransitionConfig {
  return useMemo(() => ({ ...DEFAULT_TRANSITION }), []);
}

/**
 * Hook for view state transitions with type-safe API
 * Provides a simplified interface for common navigation patterns
 */
export function usePatientViewNavigation() {
  return usePatientViewStore(
    useShallow((state) => ({
      currentView: state.viewState,

      // Navigation actions
      goToDefault: () => state.transitionTo("default"),
      goToSummary: (visitId: string) => state.transitionTo("summary", visitId),
      goToNote: (noteId: string) => state.transitionTo("note", noteId),
      goToFullView: () => state.transitionTo("fullView"),
      goBack: state.goBack,
      toggleFullView: state.toggleFullView,

      // State checks
      canGoBack: state.stateHistory.length > 0 || state.viewState !== "default",
      isInFullView: state.viewState === "fullView",
      isInSummary: state.viewState === "summary",
      isInNote: state.viewState === "note",
      isInDefault: state.viewState === "default",
    }))
  );
}

/**
 * Hook for managing scroll position persistence
 * Automatically saves and restores scroll position per view state
 */
export function usePatientViewScroll() {
  return usePatientViewStore(
    useShallow((state) => ({
      savePosition: state.saveScrollPosition,
      getPosition: state.getScrollPosition,
      currentPosition: state.scrollPositions[state.viewState],
      allPositions: state.scrollPositions,
    }))
  );
}

/**
 * Hook for accessing selected visit/note context
 */
export function usePatientViewContext() {
  return usePatientViewStore(
    useShallow((state) => ({
      selectedVisitId: state.selectedVisitId,
      selectedNoteId: state.selectedNoteId,
      hasSelectedVisit: state.selectedVisitId !== null,
      hasSelectedNote: state.selectedNoteId !== null,
    }))
  );
}

/**
 * Type guard to check if a string is a valid ViewState
 */
export function isViewState(value: string): value is ViewState {
  return ["default", "summary", "note", "fullView"].includes(value);
}

/**
 * Get Framer Motion animation variants for layout transitions
 */
export function getLayoutAnimationVariants(viewState: ViewState) {
  const layout = LAYOUT_DIMENSIONS[viewState];

  return {
    roster: {
      width: layout.rosterWidth,
      opacity: layout.rosterVisible ? 1 : 0,
    },
    header: {
      height: layout.headerHeight,
    },
    content: {
      marginLeft: layout.rosterVisible ? layout.rosterWidth : 0,
      marginTop: layout.headerHeight,
    },
  };
}

// Re-export types for convenience
export type { ViewState, LayoutDimensions, TransitionConfig } from "@/src/lib/types/patient-view";
