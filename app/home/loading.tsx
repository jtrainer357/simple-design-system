import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";

export default function HomeLoading() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />

      {/* Left Nav Skeleton */}
      <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center border-t border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-xl lg:top-0 lg:h-screen lg:w-24 lg:flex-col lg:items-center lg:justify-start lg:border-t-0 lg:border-r lg:py-6">
        <div className="flex gap-2 lg:flex-col lg:gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-12 rounded-full" />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-36">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-40 bg-transparent px-4 py-4 sm:px-6">
          <Skeleton className="h-12 w-full max-w-md rounded-full" />
        </div>

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-2 lg:flex-row">
            {/* Main Card Skeleton */}
            <CardWrapper className="flex-1">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              </div>
            </CardWrapper>

            {/* Sidebar Skeleton */}
            <aside className="flex w-full flex-col gap-2 lg:w-[380px]">
              <CardWrapper>
                <Skeleton className="mb-4 h-6 w-32" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              </CardWrapper>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
