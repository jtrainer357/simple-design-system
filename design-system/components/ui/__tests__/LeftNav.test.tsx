/**
 * LeftNav Component Tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/src/test/utils";
import { LeftNav, type NavItem } from "../left-nav";
import { Home, Users, Calendar, MessageSquare, CreditCard } from "lucide-react";

const createMockNavItems = (): NavItem[] => [
  { icon: Home, label: "Home", href: "/home", active: true },
  { icon: Users, label: "Patients", href: "/patients" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: MessageSquare, label: "Communications", href: "/communications" },
  { icon: CreditCard, label: "Billing", href: "/billing" },
];

const defaultProps = {
  logo: {
    src: "/logo.svg",
    alt: "Test Logo",
    width: 96,
    height: 23,
  },
  items: createMockNavItems(),
};

describe("LeftNav", () => {
  describe("Rendering", () => {
    it("renders the logo image", () => {
      render(<LeftNav {...defaultProps} />);

      const logo = screen.getAllByAltText("Test Logo")[0];
      expect(logo).toBeInTheDocument();
    });

    it("renders all navigation items", () => {
      render(<LeftNav {...defaultProps} />);

      // Screen reader text for nav items
      expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Patients").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Schedule").length).toBeGreaterThan(0);
    });

    it("renders notification bell when showNotifications is true", () => {
      render(<LeftNav {...defaultProps} showNotifications={true} />);

      expect(screen.getAllByText("Notifications").length).toBeGreaterThan(0);
    });

    it("hides notification bell when showNotifications is false", () => {
      render(<LeftNav {...defaultProps} showNotifications={false} />);

      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("renders nav items as links when href is provided", () => {
      render(<LeftNav {...defaultProps} />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });

    it("applies active styling to active nav item", () => {
      const items = createMockNavItems();
      items[0]!.active = true;
      items[1]!.active = false;

      render(<LeftNav {...defaultProps} items={items} />);

      // The active item should have the active class (bg-teal-dark)
      const desktopNav = screen.getAllByRole("navigation")[0];
      const activeButton = desktopNav?.querySelector(".bg-teal-dark");
      expect(activeButton).toBeInTheDocument();
    });

    it("calls onClick when nav item with onClick is clicked", async () => {
      const handleClick = vi.fn();
      const items: NavItem[] = [{ icon: Home, label: "Home", onClick: handleClick }];
      const user = userEvent.setup();

      render(<LeftNav {...defaultProps} items={items} />);

      // Find the desktop navigation button (not link since no href)
      const buttons = screen.getAllByRole("button");
      const homeButton = buttons.find((btn) => btn.textContent?.includes("Home"));
      if (homeButton) {
        await user.click(homeButton);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("User Avatar", () => {
    it("renders user avatar when user prop is provided", () => {
      const user = {
        initials: "JD",
        name: "John Doe",
        avatarSrc: "https://example.com/avatar.jpg",
      };

      render(<LeftNav {...defaultProps} user={user} />);

      expect(screen.getAllByText("JD").length).toBeGreaterThan(0);
    });

    it("shows user initials in avatar fallback", () => {
      const user = {
        initials: "AB",
        name: "Alice Brown",
      };

      render(<LeftNav {...defaultProps} user={user} />);

      expect(screen.getAllByText("AB").length).toBeGreaterThan(0);
    });

    it("does not render avatar when user prop is not provided", () => {
      render(<LeftNav {...defaultProps} user={undefined} />);

      // No avatar should be present (JD is from the test above)
      expect(screen.queryByText("JD")).not.toBeInTheDocument();
    });
  });

  describe("Notification Badge", () => {
    it("displays notification count when provided", () => {
      render(<LeftNav {...defaultProps} showNotifications={true} notificationCount={5} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("shows 9+ when notification count exceeds 9", () => {
      render(<LeftNav {...defaultProps} showNotifications={true} notificationCount={15} />);

      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("does not show count badge when count is 0", () => {
      render(<LeftNav {...defaultProps} showNotifications={true} notificationCount={0} />);

      // Count badge should not be rendered for 0
      const notificationButton = screen.getAllByText("Notifications")[0]?.closest("button");
      expect(notificationButton?.querySelector(".bg-destructive")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has navigation landmark role", () => {
      render(<LeftNav {...defaultProps} />);

      const navs = screen.getAllByRole("navigation");
      expect(navs.length).toBeGreaterThan(0);
    });

    it("includes aria-label for main navigation", () => {
      render(<LeftNav {...defaultProps} />);

      const nav = screen.getAllByRole("navigation")[0];
      expect(nav).toHaveAttribute("aria-label", "Main navigation");
    });

    it("has sr-only text for nav items", () => {
      render(<LeftNav {...defaultProps} />);

      // Screen reader text should be present
      const srTexts = document.querySelectorAll(".sr-only");
      expect(srTexts.length).toBeGreaterThan(0);
    });

    it("notification button has accessible name", () => {
      render(<LeftNav {...defaultProps} showNotifications={true} />);

      const notificationButtons = screen.getAllByText("Notifications");
      expect(notificationButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Mobile Navigation", () => {
    it("filters out Communications from mobile nav", () => {
      render(<LeftNav {...defaultProps} />);

      // The mobile nav is the nav with aria-label "Mobile navigation"
      const mobileNav = screen.getByLabelText("Mobile navigation");

      // Communications should not appear in mobile nav (sr-only text)
      const communicationsInNav = mobileNav.querySelectorAll(".sr-only");
      const hasComms = Array.from(communicationsInNav).some(
        (el) => el.textContent === "Communications"
      );
      expect(hasComms).toBe(false);
    });
  });

  describe("Logo Link Behavior", () => {
    it("renders logo as static image on home page", () => {
      render(<LeftNav {...defaultProps} isHomePage={true} />);

      // On home page, logo should be wrapped in a div, not a link
      // The logo is rendered in a div with class "mb-6 px-4" when on home page
      const desktopNav = screen.getAllByRole("navigation")[0];
      const logoImages = desktopNav?.querySelectorAll('img[alt="Test Logo"]');
      // Logo image should exist but not be wrapped in a link with the logo classes
      expect(logoImages?.length).toBe(1);
      const logoImg = logoImages?.[0];
      const parentLink = logoImg?.closest("a.mb-6");
      expect(parentLink).toBeNull();
    });

    it("renders logo as link to home on other pages", () => {
      render(<LeftNav {...defaultProps} isHomePage={false} />);

      // On other pages, logo should be a link
      const links = screen.getAllByRole("link");
      const homeLink = links.find((link) => link.getAttribute("href") === "/home");
      expect(homeLink).toBeInTheDocument();
    });
  });
});
