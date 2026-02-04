"use client";

import * as React from "react";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Button } from "@/design-system/components/ui/button";
import { Star, Search, MapPin, Sparkles, ArrowRight, ExternalLink } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor?: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-[#195B63]",
}: MetricCardProps) {
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
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#195B63]/10">
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </CardWrapper>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function MarketingPage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="marketing" />

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        <HeaderSearch />

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <PageTransition>
            <div className="mx-auto max-w-[1600px]">
              {/* Page Header */}
              <div className="mb-6">
                <Heading level={1} className="text-2xl font-bold">
                  Marketing & Reputation
                </Heading>
                <Text muted>Monitor your online presence and patient acquisition</Text>
              </div>

              {/* Metrics Grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Review Score Card - Special styling */}
                <CardWrapper className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Text size="sm" muted className="mb-1">
                        Review Score
                      </Text>
                      <div className="mb-2 flex items-baseline gap-2">
                        <Heading level={2} className="text-3xl font-bold">
                          4.8
                        </Heading>
                        <StarRating rating={4.8} />
                      </div>
                      <Text size="sm" muted>
                        142 Reviews
                      </Text>
                    </div>
                  </div>
                </CardWrapper>

                <MetricCard
                  title="SEO Visibility"
                  value="87%"
                  subtitle="Search Ranking Score"
                  icon={Search}
                />
                <MetricCard
                  title="Geographic Reach"
                  value="12"
                  subtitle="ZIP Codes"
                  icon={MapPin}
                />
                <MetricCard
                  title="AI Optimization"
                  value="3"
                  subtitle="AI Overview Appearances"
                  icon={Sparkles}
                  iconColor="text-purple-600"
                />
              </div>

              {/* Upsell Banner - Teal Gradient */}
              <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] p-8 text-white">
                <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      <Text className="text-sm font-medium tracking-wider text-white/90 uppercase">
                        Premium Feature
                      </Text>
                    </div>
                    <Heading level={3} className="mb-2 text-2xl font-bold text-white">
                      Unlock Active Reputation Management
                    </Heading>
                    <Text className="max-w-xl text-white/80">
                      Automatically request reviews from satisfied patients, respond to feedback,
                      monitor your online presence across platforms, and improve your search
                      visibility with AI-powered optimization.
                    </Text>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="secondary"
                      className="gap-2 bg-white text-[#0D9488] hover:bg-white/90"
                    >
                      Upgrade Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2 border border-white/30 text-white hover:bg-white/10"
                    >
                      Learn More
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Info Cards */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <CardWrapper className="p-6">
                  <Heading level={4} className="mb-4 text-lg font-semibold">
                    Recent Reviews
                  </Heading>
                  <div className="space-y-4">
                    {[
                      {
                        name: "John D.",
                        rating: 5,
                        text: "Dr. Chen is amazing! Very thorough and caring.",
                        date: "2 days ago",
                      },
                      {
                        name: "Maria S.",
                        rating: 5,
                        text: "Easy scheduling and minimal wait time.",
                        date: "1 week ago",
                      },
                      {
                        name: "Robert K.",
                        rating: 4,
                        text: "Great experience overall, would recommend.",
                        date: "2 weeks ago",
                      },
                    ].map((review, i) => (
                      <div key={i} className="border-border/50 border-b pb-3 last:border-0">
                        <div className="mb-1 flex items-center justify-between">
                          <Text className="font-medium">{review.name}</Text>
                          <Text size="xs" muted>
                            {review.date}
                          </Text>
                        </div>
                        <StarRating rating={review.rating} />
                        <Text size="sm" muted className="mt-1">
                          {review.text}
                        </Text>
                      </div>
                    ))}
                  </div>
                </CardWrapper>

                <CardWrapper className="p-6">
                  <Heading level={4} className="mb-4 text-lg font-semibold">
                    Platform Performance
                  </Heading>
                  <div className="space-y-4">
                    {[
                      { platform: "Google Business", reviews: 89, rating: 4.9 },
                      { platform: "Healthgrades", reviews: 32, rating: 4.7 },
                      { platform: "Zocdoc", reviews: 21, rating: 4.8 },
                    ].map((platform, i) => (
                      <div
                        key={i}
                        className="border-border/50 flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div>
                          <Text className="font-medium">{platform.platform}</Text>
                          <Text size="sm" muted>
                            {platform.reviews} reviews
                          </Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Text className="font-semibold">{platform.rating}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardWrapper>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
