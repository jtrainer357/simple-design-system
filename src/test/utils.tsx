/**
 * Test Utilities
 * Custom render function with providers and helper utilities
 */

import * as React from "react";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Re-export everything from testing-library
export * from "@testing-library/react";
export { userEvent };

/**
 * AllProviders - Wrapper with all necessary providers for testing
 * Add providers here as needed (e.g., ThemeProvider, QueryClientProvider)
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Custom render function with providers
 */
function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Render with user event setup
 * Returns both render result and user event instance
 */
function renderWithUser(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return {
    user: userEvent.setup(),
    ...customRender(ui, options),
  };
}

// Export custom render as default render
export { customRender as render, renderWithUser };

/**
 * Helper to wait for async operations
 */
export async function waitForAsync(ms = 0): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock patient data for testing
 */
export function createMockPatient(overrides = {}) {
  return {
    id: "patient-123",
    practice_id: "practice-456",
    external_id: "EXT-001",
    first_name: "John",
    last_name: "Doe",
    date_of_birth: "1990-01-15",
    gender: "Male",
    email: "john.doe@example.com",
    phone: "555-1234",
    status: "Active",
    risk_level: "low",
    diagnosis: "Anxiety",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

/**
 * Create mock priority action data for testing
 */
export function createMockPriorityAction(overrides = {}) {
  return {
    id: "action-123",
    title: "Follow up with patient",
    description: "Patient needs medication review",
    urgency: "high" as const,
    timeframe: "Today" as const,
    confidence: 85,
    icon: "pill" as const,
    patientId: "patient-123",
    suggestedActions: ["Review medication", "Schedule appointment"],
    ...overrides,
  };
}

/**
 * Create mock appointment data for testing
 */
export function createMockAppointment(overrides = {}) {
  return {
    id: "apt-123",
    practice_id: "practice-456",
    patient_id: "patient-123",
    provider_id: "provider-789",
    date: "2024-02-06",
    start_time: "09:00:00",
    end_time: "10:00:00",
    appointment_type: "Follow-up",
    status: "Scheduled",
    notes: null,
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

/**
 * Create mock patient roster item for testing
 */
export function createMockPatientRosterItem(overrides = {}) {
  return {
    id: "patient-123",
    name: "John Doe",
    age: 34,
    dob: "01/15/1990",
    phone: "555-1234",
    status: "ACTIVE" as const,
    avatarSrc: undefined,
    ...overrides,
  };
}
