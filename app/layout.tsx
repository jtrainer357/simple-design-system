import "@/design-system/styles/globals.css";
import { PageBackground } from "@/design-system/components/ui/page-background";

export const metadata = {
  title: "HealthAI - Practice Management",
  description: "AI-powered healthcare practice management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageBackground>{children}</PageBackground>
      </body>
    </html>
  );
}
