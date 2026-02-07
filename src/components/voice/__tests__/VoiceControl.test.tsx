/**
 * VoiceControl Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent, waitFor } from "@/src/test/utils";
import { VoiceControl } from "../VoiceControl";

// Mock the voice engine module
vi.mock("@/src/lib/voice/voice-engine", () => ({
  voiceEngine: {
    isSupported: vi.fn(() => true),
    isUserActivated: vi.fn(() => false),
    start: vi.fn(() => true),
    stop: vi.fn(),
  },
}));

import { voiceEngine } from "@/src/lib/voice/voice-engine";

describe("VoiceControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(voiceEngine.isSupported).mockReturnValue(true);
    vi.mocked(voiceEngine.isUserActivated).mockReturnValue(false);
    vi.mocked(voiceEngine.start).mockReturnValue(true);
  });

  describe("Rendering", () => {
    it("renders the voice control button when supported", () => {
      render(<VoiceControl />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("does not render when voice is not supported", () => {
      vi.mocked(voiceEngine.isSupported).mockReturnValue(false);

      const { container } = render(<VoiceControl />);

      expect(container.firstChild).toBeNull();
    });

    it("has correct aria-label when not listening", () => {
      render(<VoiceControl />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Click to enable voice commands");
    });
  });

  describe("Size Variants", () => {
    it("renders small size correctly", () => {
      render(<VoiceControl size="sm" />);

      const button = screen.getByRole("button");
      expect(button.className).toContain("h-8");
      expect(button.className).toContain("w-8");
    });

    it("renders medium size by default", () => {
      render(<VoiceControl />);

      const button = screen.getByRole("button");
      expect(button.className).toContain("h-10");
      expect(button.className).toContain("w-10");
    });

    it("renders large size correctly", () => {
      render(<VoiceControl size="lg" />);

      const button = screen.getByRole("button");
      expect(button.className).toContain("h-12");
      expect(button.className).toContain("w-12");
    });
  });

  describe("Toggle Behavior", () => {
    it("starts listening when clicked", async () => {
      const user = userEvent.setup();
      render(<VoiceControl />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(voiceEngine.start).toHaveBeenCalled();
    });

    it("stops listening when clicked while active", async () => {
      const user = userEvent.setup();
      render(<VoiceControl />);

      const button = screen.getByRole("button");

      // First click to start
      await user.click(button);
      // Second click to stop
      await user.click(button);

      expect(voiceEngine.stop).toHaveBeenCalled();
    });

    it("updates aria-pressed when toggled", async () => {
      const user = userEvent.setup();
      render(<VoiceControl />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "false");

      await user.click(button);

      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Callbacks", () => {
    it("calls onListeningChange when toggled on", async () => {
      const handleListeningChange = vi.fn();
      const user = userEvent.setup();

      render(<VoiceControl onListeningChange={handleListeningChange} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(handleListeningChange).toHaveBeenCalledWith(true);
      });
    });

    it("calls onListeningChange when toggled off", async () => {
      const handleListeningChange = vi.fn();
      const user = userEvent.setup();

      render(<VoiceControl onListeningChange={handleListeningChange} />);

      const button = screen.getByRole("button");
      await user.click(button);
      await user.click(button);

      await waitFor(() => {
        expect(handleListeningChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Visual States", () => {
    it("shows transparent background when not listening", () => {
      render(<VoiceControl />);

      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-transparent");
    });

    it("shows primary background when listening", async () => {
      const user = userEvent.setup();
      render(<VoiceControl />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(button.className).toContain("bg-primary");
    });

    it("contains mic icon", () => {
      render(<VoiceControl />);

      // The button should contain an SVG (Lucide icon)
      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Keyboard Interaction", () => {
    it("responds to Escape key to stop listening", async () => {
      const user = userEvent.setup();
      render(<VoiceControl />);

      const button = screen.getByRole("button");
      await user.click(button); // Start listening

      // Press Escape
      await user.keyboard("{Escape}");

      expect(voiceEngine.stop).toHaveBeenCalled();
    });
  });

  describe("User Activation Persistence", () => {
    it("restores listening state if user had it activated", () => {
      vi.mocked(voiceEngine.isUserActivated).mockReturnValue(true);

      render(<VoiceControl />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(<VoiceControl className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
