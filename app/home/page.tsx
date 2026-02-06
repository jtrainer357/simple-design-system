"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LeftNav } from "./_components/left-nav";
import { HeaderSearch } from "./_components/header-search";
import { DynamicCanvas } from "./_components/dynamic-canvas";
import { MessagesWidget } from "./_components/messages-widget";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { BillingUpsellWidget } from "./_components/billing-upsell-widget";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { WelcomeModal } from "./_components/welcome-modal";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setupComplete = searchParams.get("setup_complete") === "true";
  const [showWelcome, setShowWelcome] = React.useState(false);

  // Show welcome modal if setup_complete is in URL
  React.useEffect(() => {
    if (setupComplete) {
      setShowWelcome(true);
      // Clean up URL by removing the query parameter
      router.replace("/home", { scroll: false });
    }
  }, [setupComplete, router]);

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />
      <WelcomeModal open={showWelcome} onOpenChange={setShowWelcome} />

      {/* Left Nav */}
      <LeftNav />

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        <HeaderSearch />

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <PageTransition>
            <div className="mx-auto flex max-w-[1600px] flex-col gap-2 lg:h-[calc(100vh-8.5rem)] lg:flex-row">
              {/* Main Content Area - Unified Card with Dynamic Canvas */}
              <CardWrapper className="flex min-h-0 flex-1 flex-col overflow-visible">
                <DynamicCanvas className="flex min-h-0 flex-1 flex-col" />
              </CardWrapper>

              {/* Right Sidebar Widgets */}
              <aside className="flex w-full shrink-0 flex-col gap-2 overflow-auto lg:w-[380px]">
                <MessagesWidget />
                {/* <OutstandingItemsWidget /> */}
                <BillingUpsellWidget />
              </aside>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
