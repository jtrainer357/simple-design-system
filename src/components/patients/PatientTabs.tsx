"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components/ui/tabs";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

const tabTriggerStyles =
  "data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-3 py-2 text-base font-light text-foreground whitespace-nowrap data-[state=active]:bg-transparent data-[state=active]:text-foreground-strong data-[state=active]:shadow-none sm:px-4 sm:text-lg";

interface PatientTabsProps {
  defaultValue?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PatientTabs({ defaultValue = "overview", children, className }: PatientTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className={cn("flex h-full w-full flex-col", className)}>
      <TabsList className="mb-4 h-auto w-full justify-start gap-0 overflow-x-auto bg-transparent p-0 sm:mb-6">
        <TabsTrigger value="overview" className={tabTriggerStyles}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="appointments" className={tabTriggerStyles}>
          Appointments
        </TabsTrigger>
        <TabsTrigger value="medical-records" className={tabTriggerStyles}>
          Medical Records
        </TabsTrigger>
        <TabsTrigger value="messages" className={tabTriggerStyles}>
          Messages
        </TabsTrigger>
        <TabsTrigger value="billing" className={tabTriggerStyles}>
          Billing
        </TabsTrigger>
        <TabsTrigger value="reviews" className={tabTriggerStyles}>
          Reviews
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
}

// Re-export TabsContent for convenience
export { TabsContent };

// Placeholder content components for non-overview tabs
export function AppointmentsTabContent({ className }: { className?: string }) {
  return (
    <TabsContent value="appointments" className={cn("mt-0", className)}>
      <Text size="sm" muted className="py-8 text-center">
        Appointments will be displayed here
      </Text>
    </TabsContent>
  );
}

export function MedicalRecordsTabContent({ className }: { className?: string }) {
  return (
    <TabsContent value="medical-records" className={cn("mt-0", className)}>
      <Text size="sm" muted className="py-8 text-center">
        Medical records will be displayed here
      </Text>
    </TabsContent>
  );
}

export function MessagesTabContent({ className }: { className?: string }) {
  return (
    <TabsContent value="messages" className={cn("mt-0", className)}>
      <Text size="sm" muted className="py-8 text-center">
        Messages will be displayed here
      </Text>
    </TabsContent>
  );
}

export function BillingTabContent({ className }: { className?: string }) {
  return (
    <TabsContent value="billing" className={cn("mt-0", className)}>
      <Text size="sm" muted className="py-8 text-center">
        Billing information will be displayed here
      </Text>
    </TabsContent>
  );
}

export function ReviewsTabContent({ className }: { className?: string }) {
  return (
    <TabsContent value="reviews" className={cn("mt-0", className)}>
      <Text size="sm" muted className="py-8 text-center">
        Patient reviews will be displayed here
      </Text>
    </TabsContent>
  );
}

export type { PatientTabsProps };
