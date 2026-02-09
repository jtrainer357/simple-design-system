/**
 * Type Definitions
 * Centralized type exports
 */

// Patient View Types - Progressive Disclosure
export type {
  ViewState,
  LayoutDimensions,
  LayoutConfig,
  TransitionConfig,
  StateTransition,
  ScrollPositions,
  PatientViewState,
  PatientViewActions,
  PatientViewStore,
  UsePatientViewStateReturn,
} from "./patient-view";

export {
  LAYOUT_DIMENSIONS,
  DEFAULT_TRANSITION,
  VALID_TRANSITIONS,
  isValidTransition,
} from "./patient-view";
