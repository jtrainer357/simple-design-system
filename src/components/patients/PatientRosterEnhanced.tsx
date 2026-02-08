"use client";

import * as React from "react";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Input } from "@/design-system/components/ui/input";
import { Button } from "@/design-system/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Text } from "@/design-system/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { cn } from "@/design-system/lib/utils";
import { VirtualList } from "@/src/components/ui/VirtualList";

export type PatientStatus = "Active" | "Inactive" | "Discharged";
export type SortField = "name" | "dob" | "status" | "updated";
export type SortOrder = "asc" | "desc";

export interface PatientRosterItem {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  age: number;
  dob: string;
  phone: string;
  email?: string;
  status: PatientStatus;
  avatarSrc?: string;
  updatedAt?: string;
}

export interface PatientRosterEnhancedProps {
  patients: PatientRosterItem[];
  selectedPatientId?: string;
  onPatientSelect?: (patient: PatientRosterItem) => void;
  onAddPatient?: () => void;
  isLoading?: boolean;
  className?: string;
  // Pagination
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  // Server-side controls
  onSearchChange?: (search: string) => void;
  onSortChange?: (field: SortField, order: SortOrder) => void;
  onStatusFilterChange?: (status: PatientStatus | "all") => void;
}

const STATUS_TABS: { value: PatientStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Discharged", label: "Discharged" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function PatientRosterEnhanced({
  patients,
  selectedPatientId,
  onPatientSelect,
  onAddPatient,
  isLoading = false,
  className,
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
}: PatientRosterEnhancedProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PatientStatus | "all">("all");
  const [sortField, setSortField] = React.useState<SortField>("name");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Notify parent of search changes
  React.useEffect(() => {
    onSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleStatusChange = (status: PatientStatus | "all") => {
    setStatusFilter(status);
    onStatusFilterChange?.(status);
  };

  const handleSortChange = (field: SortField) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    onSortChange?.(field, newOrder);
  };

  // Client-side filtering if no server-side handlers
  const displayPatients = React.useMemo(() => {
    let result = [...patients];

    // Client-side search if no server handler
    if (!onSearchChange && searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.phone.includes(query) ||
          p.email?.toLowerCase().includes(query)
      );
    }

    // Client-side status filter if no server handler
    if (!onStatusFilterChange && statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Client-side sort if no server handler
    if (!onSortChange) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "dob":
            comparison = a.dob.localeCompare(b.dob);
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "updated":
            comparison = (a.updatedAt || "").localeCompare(b.updatedAt || "");
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [patients, searchQuery, statusFilter, sortField, sortOrder, onSearchChange, onStatusFilterChange, onSortChange]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const showPagination = totalCount > pageSize;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <Text weight="medium">Patients</Text>
          {totalCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {totalCount}
            </Badge>
          )}
        </div>
        {onAddPatient && (
          <Button size="sm" onClick={onAddPatient} className="h-8">
            + Add
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="border-b p-3">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-lg pl-10"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 border-b px-3 py-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              "min-h-[36px] min-w-[44px]",
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Text size="xs" muted>
          Sort:
        </Text>
        <Select value={sortField} onValueChange={(val) => handleSortChange(val as SortField)}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="dob">Date of Birth</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="updated">Last Updated</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSortChange(sortField)}
          className="h-8 px-2"
        >
          <SortIcon field={sortField} />
          {sortOrder === "asc" ? "A-Z" : "Z-A"}
        </Button>
      </div>

      {/* Patient List */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Text size="sm" muted>
            Loading patients...
          </Text>
        </div>
      ) : displayPatients.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4">
          <Text size="sm" muted className="text-center">
            {searchQuery || statusFilter !== "all"
              ? "No patients match your filters"
              : "No patients yet"}
          </Text>
          {onAddPatient && !searchQuery && statusFilter === "all" && (
            <Button variant="outline" size="sm" onClick={onAddPatient}>
              Add your first patient
            </Button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden px-2">
          <VirtualList
            items={displayPatients}
            estimateSize={72}
            overscan={5}
            gap={4}
            height="100%"
            className="py-2"
            aria-label="Patient list"
            renderItem={(patient) => {
              const initials = patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2);
              const isSelected = selectedPatientId === patient.id;

              return (
                <button
                  type="button"
                  onClick={() => onPatientSelect?.(patient)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all",
                    "min-h-[64px]",
                    "hover:bg-accent/50",
                    "focus-visible:ring-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    isSelected && "bg-accent border-selected-border border"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    {patient.avatarSrc && (
                      <AvatarImage src={patient.avatarSrc} alt={patient.name} />
                    )}
                    <AvatarFallback className="bg-avatar-fallback text-xs font-medium text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground-strong truncate text-sm font-semibold">
                        {patient.name}
                      </span>
                      <Badge
                        variant={
                          patient.status === "Active"
                            ? "default"
                            : patient.status === "Inactive"
                              ? "secondary"
                              : "outline"
                        }
                        className={cn(
                          "shrink-0 rounded px-1.5 py-0 text-[10px]",
                          patient.status === "Discharged" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {patient.status}
                      </Badge>
                    </div>
                    <Text size="xs" muted className="mt-0.5">
                      Age {patient.age} &bull; DOB: {patient.dob}
                    </Text>
                    {patient.phone && (
                      <Text size="xs" muted>
                        {patient.phone}
                      </Text>
                    )}
                  </div>
                </button>
              );
            }}
          />
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between border-t px-3 py-2">
          <Text size="xs" muted>
            Page {page} of {totalPages}
          </Text>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
