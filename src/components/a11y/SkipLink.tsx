"use client";

interface SkipLinkProps {
  /** Target element ID to skip to (without the #) */
  targetId?: string;
  /** Custom label text */
  label?: string;
}

/**
 * Skip link for keyboard users to bypass navigation and jump to main content.
 * Hidden by default, becomes visible when focused.
 */
export function SkipLink({
  targetId = "main-content",
  label = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="focus:ring-growth-2 sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:outline-none"
    >
      {label}
    </a>
  );
}
