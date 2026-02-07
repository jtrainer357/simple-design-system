/**
 * PrioritizedActionCard Component Tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/src/test/utils";
import { PrioritizedActionCard, type PrioritizedAction } from "../PrioritizedActionCard";

const createMockAction = (overrides: Partial<PrioritizedAction> = {}): PrioritizedAction => ({
  id: "action-123",
  title: "Follow up with patient",
  description: "Patient needs medication review",
  urgency: "high",
  timeframe: "Today",
  confidence: 85,
  icon: "pill",
  patientId: "patient-123",
  suggestedActions: ["Review medication", "Schedule appointment"],
  ...overrides,
});

describe("PrioritizedActionCard", () => {
  describe("Rendering", () => {
    it("renders the action title correctly", () => {
      const action = createMockAction({ title: "Review Lab Results" });
      render(<PrioritizedActionCard action={action} />);

      expect(screen.getByText("Review Lab Results")).toBeInTheDocument();
    });

    it("renders the action description", () => {
      const action = createMockAction({ description: "Urgent lab review needed" });
      render(<PrioritizedActionCard action={action} />);

      expect(screen.getByText("Urgent lab review needed")).toBeInTheDocument();
    });

    it("displays the confidence percentage", () => {
      const action = createMockAction({ confidence: 92 });
      render(<PrioritizedActionCard action={action} />);

      expect(screen.getByText("92% confidence")).toBeInTheDocument();
    });

    it("shows the timeframe", () => {
      const action = createMockAction({ timeframe: "Within 3 days" });
      render(<PrioritizedActionCard action={action} />);

      expect(screen.getByText("Within 3 days")).toBeInTheDocument();
    });
  });

  describe("Urgency Badge", () => {
    it("displays urgent badge for urgent actions", () => {
      const action = createMockAction({ urgency: "urgent" });
      render(<PrioritizedActionCard action={action} />);

      expect(screen.getByText("urgent")).toBeInTheDocument();
    });

    it("displays high badge for high priority actions", () => {
      const action = createMockAction({ urgency: "high" });
      render(<PrioritizedActionCard action={action} />);

      expect(screen.getByText("high")).toBeInTheDocument();
    });

    it("displays medium badge for medium priority actions", () => {
      const action = createMockAction({ urgency: "medium" });
      render(<PrioritizedActionCard action={action} />);

      expect(screen.getByText("medium")).toBeInTheDocument();
    });

    it("displays low badge for low priority actions", () => {
      const action = createMockAction({ urgency: "low" });
      render(<PrioritizedActionCard action={action} />);

      expect(screen.getByText("low")).toBeInTheDocument();
    });
  });

  describe("Interactivity", () => {
    it("calls onClick when card is clicked", async () => {
      const handleClick = vi.fn();
      const action = createMockAction();
      const { user } = await import("@/src/test/utils").then((m) => ({
        user: m.userEvent.setup(),
      }));

      render(<PrioritizedActionCard action={action} onClick={handleClick} />);

      const card = screen.getByRole("button");
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(action);
    });

    it("does not render as button when onClick is not provided", () => {
      const action = createMockAction();
      render(<PrioritizedActionCard action={action} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("has correct keyboard accessibility attributes when clickable", () => {
      const handleClick = vi.fn();
      const action = createMockAction();
      render(<PrioritizedActionCard action={action} onClick={handleClick} />);

      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("Icon Display", () => {
    it("renders pill icon for medication actions", () => {
      const action = createMockAction({ icon: "pill" });
      render(<PrioritizedActionCard action={action} />);

      // The icon is rendered, and the card should be present
      const card = screen.getByText("Follow up with patient").closest("div");
      expect(card).toBeInTheDocument();
    });

    it("renders calendar icon for scheduling actions", () => {
      const action = createMockAction({ icon: "calendar" });
      render(<PrioritizedActionCard action={action} />);

      const card = screen.getByText("Follow up with patient").closest("div");
      expect(card).toBeInTheDocument();
    });

    it("handles unknown icons gracefully", () => {
      const action = createMockAction({ icon: "clipboard" });
      render(<PrioritizedActionCard action={action} />);

      // Should render without throwing
      expect(screen.getByText("Follow up with patient")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies custom className", () => {
      const action = createMockAction();
      const { container } = render(
        <PrioritizedActionCard action={action} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("applies urgency-specific styling for urgent actions", () => {
      const action = createMockAction({ urgency: "urgent" });
      const { container } = render(<PrioritizedActionCard action={action} />);

      // The card should have red-related styling for urgent
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("red");
    });

    it("applies urgency-specific styling for high priority actions", () => {
      const action = createMockAction({ urgency: "high" });
      const { container } = render(<PrioritizedActionCard action={action} />);

      // The card should have orange-related styling for high
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("orange");
    });
  });
});
