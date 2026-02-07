/**
 * PatientRoster Component Tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/src/test/utils";
import { PatientRoster, type PatientRosterItem } from "../PatientRoster";

const createMockPatients = (): PatientRosterItem[] => [
  {
    id: "patient-1",
    name: "John Doe",
    age: 45,
    dob: "01/15/1979",
    phone: "555-0101",
    status: "ACTIVE",
  },
  {
    id: "patient-2",
    name: "Jane Smith",
    age: 32,
    dob: "03/22/1992",
    phone: "555-0102",
    status: "ACTIVE",
  },
  {
    id: "patient-3",
    name: "Bob Johnson",
    age: 67,
    dob: "07/08/1957",
    phone: "555-0103",
    status: "INACTIVE",
  },
];

describe("PatientRoster", () => {
  describe("Rendering", () => {
    it("renders all patient names", () => {
      const patients = createMockPatients();
      render(<PatientRoster patients={patients} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("displays patient age and date of birth", () => {
      const patients = createMockPatients();
      render(<PatientRoster patients={patients} />);

      expect(screen.getByText(/Age 45/)).toBeInTheDocument();
      expect(screen.getByText(/01\/15\/1979/)).toBeInTheDocument();
    });

    it("renders avatar with patient initials", () => {
      const patients = [
        {
          id: "patient-1",
          name: "Alice Brown",
          age: 30,
          dob: "01/01/1994",
          phone: "555-0100",
          status: "ACTIVE" as const,
        },
      ];
      render(<PatientRoster patients={patients} />);

      // Avatar fallback should show initials "AB"
      expect(screen.getByText("AB")).toBeInTheDocument();
    });

    it("shows search input placeholder", () => {
      render(<PatientRoster patients={[]} />);

      expect(screen.getByPlaceholderText("Search patients...")).toBeInTheDocument();
    });

    it("displays message when no patients found", () => {
      render(<PatientRoster patients={[]} />);

      expect(screen.getByText("No patients found")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("filters patients by name", async () => {
      const patients = createMockPatients();
      const user = userEvent.setup();
      render(<PatientRoster patients={patients} />);

      const searchInput = screen.getByPlaceholderText("Search patients...");
      // Search for "Doe" to specifically match only John Doe
      await user.type(searchInput, "Doe");

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob Johnson")).not.toBeInTheDocument();
    });

    it("filters patients by phone number", async () => {
      const patients = createMockPatients();
      const user = userEvent.setup();
      render(<PatientRoster patients={patients} />);

      const searchInput = screen.getByPlaceholderText("Search patients...");
      await user.type(searchInput, "0102");

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("is case-insensitive", async () => {
      const patients = createMockPatients();
      const user = userEvent.setup();
      render(<PatientRoster patients={patients} />);

      const searchInput = screen.getByPlaceholderText("Search patients...");
      await user.type(searchInput, "JANE");

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("shows no patients message when search has no results", async () => {
      const patients = createMockPatients();
      const user = userEvent.setup();
      render(<PatientRoster patients={patients} />);

      const searchInput = screen.getByPlaceholderText("Search patients...");
      await user.type(searchInput, "xyz123");

      expect(screen.getByText("No patients found")).toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    it("calls onPatientSelect when a patient is clicked", async () => {
      const patients = createMockPatients();
      const handleSelect = vi.fn();
      const user = userEvent.setup();

      render(<PatientRoster patients={patients} onPatientSelect={handleSelect} />);

      const patientButton = screen.getByText("John Doe").closest("button");
      await user.click(patientButton!);

      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith(patients[0]);
    });

    it("highlights selected patient", () => {
      const patients = createMockPatients();
      render(<PatientRoster patients={patients} selectedPatientId="patient-2" />);

      // The selected patient's button should have the selected class
      const selectedButton = screen.getByText("Jane Smith").closest("button");
      expect(selectedButton?.className).toContain("bg-accent");
    });

    it("does not highlight non-selected patients", () => {
      const patients = createMockPatients();
      render(<PatientRoster patients={patients} selectedPatientId="patient-2" />);

      const nonSelectedButton = screen.getByText("John Doe").closest("button");
      // Non-selected buttons should not have "bg-accent " (with space) or "bg-accent border"
      // They may have "hover:bg-accent/50" which is different
      expect(nonSelectedButton?.className).not.toMatch(/\bbg-accent\b(?!\/)/);
    });
  });

  describe("Accessibility", () => {
    it("patient items are focusable buttons", () => {
      const patients = createMockPatients();
      render(<PatientRoster patients={patients} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(3);
    });

    it("search input is accessible", () => {
      render(<PatientRoster patients={[]} />);

      const searchInput = screen.getByPlaceholderText("Search patients...");
      expect(searchInput).toHaveAttribute("type", "text");
    });

    it("has focus-visible styling on patient buttons", () => {
      const patients = createMockPatients();
      const { container } = render(<PatientRoster patients={patients} />);

      const buttons = container.querySelectorAll("button");
      buttons.forEach((button) => {
        expect(button.className).toContain("focus-visible");
      });
    });
  });

  describe("Props", () => {
    it("applies custom className", () => {
      const { container } = render(<PatientRoster patients={[]} className="custom-roster" />);

      expect(container.firstChild).toHaveClass("custom-roster");
    });

    it("handles empty patients array gracefully", () => {
      render(<PatientRoster patients={[]} />);

      expect(screen.getByText("No patients found")).toBeInTheDocument();
    });
  });
});
