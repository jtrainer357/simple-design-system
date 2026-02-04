import "@/design-system/styles/globals.css";
import { PageBackground } from "@/design-system/components/ui/page-background";
import { ActionOrchestrationModal } from "@/src/components/orchestration/ActionOrchestrationModal";

export const metadata = {
  title: "HealthAI - Practice Management",
  description: "AI-powered healthcare practice management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageBackground>{children}</PageBackground>
        <ActionOrchestrationModal />
      </body>
    </html>
  );
}
