"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/design-system/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { ScrollArea } from "@/design-system/components/ui/scroll-area";

export type PatientStatus = "ACTIVE" | "INACTIVE" | "NEW";

export interface PatientRosterItem {
  id: string;
  name: string;
  age: number;
  dob: string;
  phone: string;
  status: PatientStatus;
  avatarSrc?: string;
}

interface PatientRosterProps {
  patients: PatientRosterItem[];
  selectedPatientId?: string;
  onPatientSelect?: (patient: PatientRosterItem) => void;
  className?: string;
}

export function PatientRoster({
  patients,
  selectedPatientId,
  onPatientSelect,
  className,
}: PatientRosterProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredPatients = React.useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(query) || p.phone.includes(query));
  }, [patients, searchQuery]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg bg-white/50 pl-10"
          />
        </div>
      </div>

      {/* Patient List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {filteredPatients.map((patient) => {
            const initials = patient.name
              .split(" ")
              .map((n) => n[0])
              .join("");
            const isSelected = selectedPatientId === patient.id;

            return (
              <button
                key={patient.id}
                type="button"
                onClick={() => onPatientSelect?.(patient)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all",
                  "hover:bg-accent/50",
                  "focus-visible:ring-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  isSelected && "bg-accent border-selected-border border"
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  {patient.avatarSrc && <AvatarImage src={patient.avatarSrc} alt={patient.name} />}
                  <AvatarFallback className="bg-avatar-fallback text-xs font-medium text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground-strong truncate text-sm font-semibold">
                      {patient.name}
                    </span>
                  </div>
                  <Text size="xs" muted className="mt-0.5">
                    Age {patient.age} &bull; {patient.dob}
                  </Text>
                </div>
              </button>
            );
          })}
          {filteredPatients.length === 0 && (
            <Text size="sm" muted className="py-8 text-center">
              No patients found
            </Text>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export type { PatientRosterProps };
