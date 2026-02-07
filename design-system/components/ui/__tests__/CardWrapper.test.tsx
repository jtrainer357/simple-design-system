/**
 * CardWrapper Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@/src/test/utils";
import { CardWrapper } from "../card-wrapper";

describe("CardWrapper", () => {
  describe("Rendering", () => {
    it("renders children correctly", () => {
      render(
        <CardWrapper>
          <p>Test content</p>
        </CardWrapper>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("renders multiple children", () => {
      render(
        <CardWrapper>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </CardWrapper>
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    it("renders nested components", () => {
      render(
        <CardWrapper>
          <div>
            <span>Nested content</span>
          </div>
        </CardWrapper>
      );

      expect(screen.getByText("Nested content")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has base glassmorphism styles", () => {
      const { container } = render(
        <CardWrapper>
          <p>Content</p>
        </CardWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("rounded-xl");
      expect(wrapper.className).toContain("backdrop-blur");
    });

    it("applies default padding", () => {
      const { container } = render(
        <CardWrapper>
          <p>Content</p>
        </CardWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("p-6");
    });

    it("has border styling", () => {
      const { container } = render(
        <CardWrapper>
          <p>Content</p>
        </CardWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("border");
    });

    it("has white background with transparency", () => {
      const { container } = render(
        <CardWrapper>
          <p>Content</p>
        </CardWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("bg-white/50");
    });
  });

  describe("Custom className", () => {
    it("applies custom className", () => {
      const { container } = render(
        <CardWrapper className="custom-class">
          <p>Content</p>
        </CardWrapper>
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("merges custom className with base styles", () => {
      const { container } = render(
        <CardWrapper className="my-custom-padding">
          <p>Content</p>
        </CardWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("my-custom-padding");
      expect(wrapper.className).toContain("rounded-xl");
    });

    it("allows overriding styles with custom className", () => {
      const { container } = render(
        <CardWrapper className="p-2">
          <p>Content</p>
        </CardWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      // Both classes will be present; Tailwind's merge handles specificity
      expect(wrapper.className).toContain("p-2");
    });
  });

  describe("Semantic Structure", () => {
    it("renders as a div element", () => {
      const { container } = render(
        <CardWrapper>
          <p>Content</p>
        </CardWrapper>
      );

      expect(container.firstChild?.nodeName).toBe("DIV");
    });

    it("preserves children's semantic elements", () => {
      render(
        <CardWrapper>
          <article>Article content</article>
        </CardWrapper>
      );

      expect(screen.getByRole("article")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("does not interfere with child accessibility attributes", () => {
      render(
        <CardWrapper>
          <button aria-label="Close dialog">X</button>
        </CardWrapper>
      );

      const button = screen.getByRole("button", { name: "Close dialog" });
      expect(button).toBeInTheDocument();
    });

    it("allows children with roles to be findable", () => {
      render(
        <CardWrapper>
          <nav>
            <ul>
              <li>Item 1</li>
            </ul>
          </nav>
        </CardWrapper>
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });
});
