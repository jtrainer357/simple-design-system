"use client";

import * as React from "react";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Button } from "@/design-system/components/ui/button";
import { DollarSign, CreditCard, Clock, Lock, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { getBillingSummary, type BillingSummary } from "@/src/lib/queries/billing";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, trendUp }: MetricCardProps) {
  return (
    <CardWrapper className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Text size="sm" muted className="mb-1">
            {title}
          </Text>
          <Heading level={2} className="mb-1 text-3xl font-bold">
            {value}
          </Heading>
          <Text size="sm" muted>
            {subtitle}
          </Text>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp
                className={`h-4 w-4 ${trendUp ? "text-green-600" : "rotate-180 text-red-500"}`}
              />
              <Text size="xs" className={trendUp ? "text-green-600" : "text-red-500"}>
                {trend}
              </Text>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#195B63]/10">
          <Icon className="h-6 w-6 text-[#195B63]" />
        </div>
      </div>
    </CardWrapper>
  );
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BillingPage() {
  const [summary, setSummary] = React.useState<BillingSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Load billing summary from Supabase
  React.useEffect(() => {
    async function loadBilling() {
      try {
        setLoading(true);
        const data = await getBillingSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load billing:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBilling();
  }, []);

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="billing" />

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        <HeaderSearch />

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <PageTransition>
            <div className="mx-auto max-w-[1600px]">
              {/* Page Header */}
              <div className="mb-6">
                <Heading level={1} className="text-2xl font-bold">
                  Billing Overview
                </Heading>
                <Text muted>Track your practice revenue and collections (6-month history)</Text>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                    <Text size="sm" muted>
                      Loading billing data...
                    </Text>
                  </div>
                </div>
              ) : (
                <>
                  {/* Metrics Grid */}
                  <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <MetricCard
                      title="Total Charged"
                      value={formatCurrency(summary?.totalCharged || 0)}
                      subtitle={`${summary?.invoiceCount || 0} Invoices (6 months)`}
                      icon={DollarSign}
                      trend={`${summary?.paidCount || 0} paid, ${summary?.pendingCount || 0} pending`}
                      trendUp={true}
                    />
                    <MetricCard
                      title="Collections"
                      value={formatCurrency(summary?.totalCollected || 0)}
                      subtitle={`${summary?.collectionRate || 0}% Collection Rate`}
                      icon={CreditCard}
                      trend={
                        summary?.collectionRate && summary.collectionRate >= 80
                          ? "Above industry average"
                          : "Below target"
                      }
                      trendUp={(summary?.collectionRate || 0) >= 80}
                    />
                    <MetricCard
                      title="Outstanding AR"
                      value={formatCurrency(summary?.outstandingAR || 0)}
                      subtitle="Balance Due"
                      icon={Clock}
                      trend={
                        summary?.outstandingAR && summary.outstandingAR > 0
                          ? "Requires follow-up"
                          : "All collected"
                      }
                      trendUp={(summary?.outstandingAR || 0) === 0}
                    />
                  </div>
                </>
              )}

              {/* Coming Soon Card */}
              <CardWrapper className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Lock className="h-10 w-10 text-gray-400" />
                  </div>
                  <Heading level={3} className="mb-2 text-xl font-semibold">
                    Full Billing Features Coming Soon
                  </Heading>
                  <Text muted className="mb-6 max-w-md">
                    Advanced billing features including insurance claims processing, patient
                    statements, payment plans, and automated collections are currently in
                    development.
                  </Text>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="outline" disabled>
                      Claims Management
                    </Button>
                    <Button variant="outline" disabled>
                      Patient Statements
                    </Button>
                    <Button variant="outline" disabled>
                      Payment Plans
                    </Button>
                  </div>
                </div>
              </CardWrapper>

              {/* Upsell Banner */}
              <div className="mt-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#195B63] to-[#2D8A95] p-6 text-white">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <div>
                    <Heading level={4} className="mb-1 text-lg font-semibold text-white">
                      Upgrade to Tebra Complete
                    </Heading>
                    <Text className="text-white/80">
                      Get full billing, claims processing, and revenue cycle management
                    </Text>
                  </div>
                  <Button
                    variant="secondary"
                    className="gap-2 bg-white text-[#195B63] hover:bg-white/90"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
