import "@/design-system/styles/globals.css";
import { PageBackground } from "@/design-system/components/ui/page-background";
import { ActionOrchestrationModal } from "@/src/components/orchestration/ActionOrchestrationModal";
import { VoiceProvider } from "@/src/components/voice";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Tebra Mental Health",
    default: "Tebra Mental Health",
  },
  description: "AI-powered mental health practice management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Skip link for keyboard users - visible only on focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-[oklch(0.562_0.0478_159.1543)]"
        >
          Skip to main content
        </a>
        <VoiceProvider>
          <PageBackground>{children}</PageBackground>
          <ActionOrchestrationModal />
        </VoiceProvider>
      </body>
    </html>
  );
}
