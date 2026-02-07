/**
 * usePatients Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { usePatients, usePatient, usePatientSearch, useHighRiskPatients } from "../use-patients";

// Mock the patients query functions
vi.mock("../patients", () => ({
  getPatients: vi.fn(),
  getPatientById: vi.fn(),
  getPatientAppointments: vi.fn(),
  getPatientOutcomeMeasures: vi.fn(),
  getPatientMessages: vi.fn(),
  getPatientInvoices: vi.fn(),
  getPatientDetails: vi.fn(),
  searchPatients: vi.fn(),
  getHighRiskPatients: vi.fn(),
  getPatientVisitSummaries: vi.fn(),
}));

vi.mock("../priority-actions", () => ({
  getPatientPriorityActions: vi.fn(),
  completeAllPatientActions: vi.fn(),
}));

import { getPatients, getPatientById, searchPatients, getHighRiskPatients } from "../patients";

// Create a wrapper with QueryClientProvider for testing hooks
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePatients Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("usePatients", () => {
    const mockPatients = [
      {
        id: "patient-1",
        first_name: "John",
        last_name: "Doe",
        status: "Active",
      },
      {
        id: "patient-2",
        first_name: "Jane",
        last_name: "Smith",
        status: "Active",
      },
    ];

    it("returns patient data on success", async () => {
      vi.mocked(getPatients).mockResolvedValue(mockPatients);

      const { result } = renderHook(() => usePatients("practice-123"), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPatients);
      expect(getPatients).toHaveBeenCalledWith("practice-123");
    });

    it("handles errors gracefully", async () => {
      const error = new Error("Failed to fetch patients");
      vi.mocked(getPatients).mockRejectedValue(error);

      const { result } = renderHook(() => usePatients("practice-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("uses default practice ID when not provided", async () => {
      vi.mocked(getPatients).mockResolvedValue([]);

      renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getPatients).toHaveBeenCalled();
      });

      // Should be called with the default DEMO_PRACTICE_ID
      const callArg = vi.mocked(getPatients).mock.calls[0]?.[0];
      expect(callArg).toBeDefined();
    });
  });

  describe("usePatient", () => {
    const mockPatient = {
      id: "patient-123",
      first_name: "John",
      last_name: "Doe",
      status: "Active",
    };

    it("returns single patient data on success", async () => {
      vi.mocked(getPatientById).mockResolvedValue(mockPatient);

      const { result } = renderHook(() => usePatient("patient-123", "practice-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPatient);
      expect(getPatientById).toHaveBeenCalledWith("patient-123", "practice-123");
    });

    it("does not fetch when patientId is empty", async () => {
      const { result } = renderHook(() => usePatient("", "practice-123"), {
        wrapper: createWrapper(),
      });

      // Should not fetch with empty ID
      expect(result.current.fetchStatus).toBe("idle");
      expect(getPatientById).not.toHaveBeenCalled();
    });

    it("handles patient not found", async () => {
      vi.mocked(getPatientById).mockResolvedValue(null);

      const { result } = renderHook(() => usePatient("nonexistent", "practice-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe("usePatientSearch", () => {
    const mockSearchResults = [{ id: "patient-1", first_name: "John", last_name: "Doe" }];

    it("searches patients with valid query", async () => {
      vi.mocked(searchPatients).mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => usePatientSearch("john", "practice-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSearchResults);
      expect(searchPatients).toHaveBeenCalledWith("john", "practice-123");
    });

    it("does not search with query less than 2 characters", async () => {
      const { result } = renderHook(() => usePatientSearch("j", "practice-123"), {
        wrapper: createWrapper(),
      });

      // Should not fetch with short query
      expect(result.current.fetchStatus).toBe("idle");
      expect(searchPatients).not.toHaveBeenCalled();
    });

    it("enables search with exactly 2 characters", async () => {
      vi.mocked(searchPatients).mockResolvedValue([]);

      renderHook(() => usePatientSearch("jo", "practice-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(searchPatients).toHaveBeenCalledWith("jo", "practice-123");
      });
    });
  });

  describe("useHighRiskPatients", () => {
    const mockHighRiskPatients = [
      { id: "patient-1", first_name: "Critical", last_name: "Patient", risk_level: "high" },
    ];

    it("returns high-risk patients", async () => {
      vi.mocked(getHighRiskPatients).mockResolvedValue(mockHighRiskPatients);

      const { result } = renderHook(() => useHighRiskPatients("practice-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockHighRiskPatients);
      expect(getHighRiskPatients).toHaveBeenCalledWith("practice-123");
    });

    it("handles empty results", async () => {
      vi.mocked(getHighRiskPatients).mockResolvedValue([]);

      const { result } = renderHook(() => useHighRiskPatients("practice-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });
});
