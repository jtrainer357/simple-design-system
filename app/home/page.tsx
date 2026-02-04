"use client";

import * as React from "react";
import { LeftNav } from "./_components/left-nav";
import { HeaderSearch } from "./_components/header-search";
import { PriorityActionsSection } from "./_components/priority-actions-section";
import { TodaysPatientsList } from "./_components/todays-patients-list";
import { MessagesWidget } from "./_components/messages-widget";
import { OutstandingItemsWidget } from "./_components/outstanding-items-widget";
import { BillingUpsellWidget } from "./_components/billing-upsell-widget";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";

export default function HomePage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav />

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        <HeaderSearch />

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <PageTransition>
            <div className="mx-auto flex max-w-[1600px] flex-col gap-6 lg:flex-row">
              {/* Main Content Area */}
              <div className="flex-1 space-y-6">
                <PriorityActionsSection />
                <TodaysPatientsList />
              </div>

              {/* Right Sidebar Widgets */}
              <aside className="w-full space-y-4 lg:w-80">
                <MessagesWidget />
                <OutstandingItemsWidget />
                <BillingUpsellWidget />
              </aside>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
