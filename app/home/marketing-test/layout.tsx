import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketing Analysis",
  description: "Provider visibility and competitive landscape analysis",
};

export default function MarketingTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
