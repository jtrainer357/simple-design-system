"use client";

import * as React from "react";
import { LeftNav } from "./_components/left-nav";
import { HeaderSearch } from "./_components/header-search";
import { ScheduleSection } from "./_components/schedule-section";
import { SidebarWidgets } from "./_components/sidebar-widgets";
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
            <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-2">
              {/* Main Center Column */}
              <div className="lg:sticky lg:top-24 lg:col-span-8 lg:h-[calc(100vh-8.5rem)] xl:col-span-8">
                <ScheduleSection />
              </div>

              {/* Right Sidebar Widgets */}
              <div className="lg:sticky lg:top-24 lg:col-span-4 lg:h-[calc(100vh-8.5rem)] xl:col-span-4">
                <SidebarWidgets />
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
