import "@/design-system/styles/globals.css";
import { PageBackground } from "@/design-system/components/ui/page-background";
import { ActionOrchestrationModal } from "@/src/components/orchestration/ActionOrchestrationModal";
import { VoiceProvider } from "@/src/components/voice";

export const metadata = {
  title: "HealthAI - Practice Management",
  description: "AI-powered healthcare practice management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VoiceProvider>
          <PageBackground>{children}</PageBackground>
          <ActionOrchestrationModal />
        </VoiceProvider>
      </body>
    </html>
  );
}
