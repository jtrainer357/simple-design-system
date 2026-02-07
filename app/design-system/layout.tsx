import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System",
  description: "Tebra Mental Health design system component showcase",
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
