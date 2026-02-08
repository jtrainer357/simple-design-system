import type { Metadata } from "next";
export const metadata: Metadata = { title: { default: "Sign In", template: "%s | Tebra Mental Health" } };
export default function AuthLayout({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-gradient-to-br from-backbone-1 via-white to-growth-1/10">{children}</div>; }
