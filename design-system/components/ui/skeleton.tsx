import { cn } from "@/design-system/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-muted animate-pulse rounded-md", className)} {...props} />;
}

// Skeleton for metric cards (3 columns)
function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border-card-border-subtle rounded-xl border bg-white p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="mb-2 h-9 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
}

// Skeleton for priority action cards
function PriorityActionCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("border-card-border-subtle rounded-xl border bg-white p-4 sm:p-5", className)}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20" />
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-2 h-5 w-40" />
          <Skeleton className="mb-2 h-4 w-60" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
    </div>
  );
}

// Skeleton for patient list cards
function PatientCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("border-card-border-subtle rounded-lg border bg-white p-3 sm:p-4", className)}
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full sm:h-11 sm:w-11" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <Skeleton className="mt-1 h-3 w-24" />
          <Skeleton className="mt-1 h-3 w-28" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <Skeleton className="h-3 w-32" />
        <div className="flex gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for conversation/message list items
function ConversationCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border-card-border-subtle rounded-lg border bg-white p-3", className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="mt-2 h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for calendar events
function CalendarEventSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border-card-border-subtle rounded-lg border bg-white p-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-1 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for table rows
function TableRowSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 border-b border-gray-100 py-3", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

export {
  Skeleton,
  MetricCardSkeleton,
  PriorityActionCardSkeleton,
  PatientCardSkeleton,
  ConversationCardSkeleton,
  CalendarEventSkeleton,
  TableRowSkeleton,
};
