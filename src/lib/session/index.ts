/**
 * Session Module Public API
 * @module session
 */

export * from "./types";

export { useSessionTimer } from "./use-session-timer";
export { useAutoSave, getAutoSaveStatusIndicator } from "./use-auto-save";
export type { AutoSaveStatus } from "./use-auto-save";

export {
  NOTE_TEMPLATES,
  getNoteTemplate,
  compileNoteTemplate,
  PROGRESS_NOTE_TEMPLATE,
  INITIAL_EVALUATION_TEMPLATE,
  CRISIS_NOTE_TEMPLATE,
  TREATMENT_PLAN_TEMPLATE,
} from "./note-templates";
export type { NoteTemplate } from "./note-templates";
