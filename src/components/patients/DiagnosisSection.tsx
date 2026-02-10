"use client";

import { useState, useMemo } from "react";
import { Plus, Star, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/design-system/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/design-system/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/components/ui/card";
import { cn } from "@/design-system/lib/utils";
import type { PatientDiagnosis, DiagnosisStatus } from "@/src/lib/session";
import icd10Data from "@/src/lib/data/icd10-mental-health.json";

interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

interface DiagnosisSectionProps {
  diagnoses: PatientDiagnosis[];
  onAdd: (data: { icd10Code: string; description: string; isPrimary?: boolean }) => Promise<void>;
  onUpdate: (
    id: string,
    data: Partial<{ status: DiagnosisStatus; isPrimary: boolean }>
  ) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

const statusColors: Record<DiagnosisStatus, string> = {
  active: "bg-green-100 text-green-800",
  resolved: "bg-gray-100 text-gray-800",
  in_remission: "bg-blue-100 text-blue-800",
};
const statusLabels: Record<DiagnosisStatus, string> = {
  active: "Active",
  resolved: "Resolved",
  in_remission: "In Remission",
};

export function DiagnosisSection({
  diagnoses,
  onAdd,
  onUpdate,
  onRemove,
  isLoading = false,
  readOnly = false,
}: DiagnosisSectionProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const icd10Codes = icd10Data.codes as ICD10Code[];

  const filteredCodes = useMemo(() => {
    if (!searchQuery) return icd10Codes.slice(0, 20);
    const query = searchQuery.toLowerCase();
    return icd10Codes.filter(
      (code) =>
        code.code.toLowerCase().includes(query) ||
        code.description.toLowerCase().includes(query) ||
        code.category.toLowerCase().includes(query)
    );
  }, [searchQuery, icd10Codes]);

  const groupedCodes = useMemo(() => {
    const groups: Record<string, ICD10Code[]> = {};
    filteredCodes.forEach((code) => {
      if (!groups[code.category]) groups[code.category] = [];
      groups[code.category]!.push(code);
    });
    return groups;
  }, [filteredCodes]);

  const handleAddDiagnosis = async (code: ICD10Code) => {
    await onAdd({
      icd10Code: code.code,
      description: code.description,
      isPrimary: diagnoses.length === 0,
    });
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSetPrimary = async (id: string) => {
    for (const dx of diagnoses) {
      if (dx.isPrimary && dx.id !== id) await onUpdate(dx.id, { isPrimary: false });
    }
    await onUpdate(id, { isPrimary: true });
  };

  const primaryDiagnosis = diagnoses.find((d) => d.isPrimary);
  const otherDiagnoses = diagnoses.filter((d) => !d.isPrimary);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Diagnoses</CardTitle>
            <CardDescription>ICD-10 diagnosis codes</CardDescription>
          </div>
          {!readOnly && (
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Diagnosis
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[calc(100vw-2rem)] max-w-md p-0 sm:w-[400px]"
                align="end"
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search ICD-10 codes..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No diagnosis codes found.</CommandEmpty>
                    {Object.entries(groupedCodes).map(([category, codes]) => (
                      <CommandGroup key={category} heading={category}>
                        {codes.map((code) => (
                          <CommandItem
                            key={code.code}
                            value={code.code}
                            onSelect={() => handleAddDiagnosis(code)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-medium">{code.code}</span>
                              <span className="text-muted-foreground text-sm">
                                {code.description}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {diagnoses.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center text-sm">No diagnoses on file</div>
        ) : (
          <div className="space-y-2">
            {primaryDiagnosis && (
              <div className="border-primary/20 bg-primary/5 rounded-lg border-2 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Star className="text-primary fill-primary h-4 w-4" />
                      <span className="text-primary text-xs font-medium uppercase">
                        Primary Diagnosis
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{primaryDiagnosis.icd10Code}</span>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", statusColors[primaryDiagnosis.status])}
                      >
                        {statusLabels[primaryDiagnosis.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {primaryDiagnosis.description}
                    </p>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <Select
                        value={primaryDiagnosis.status}
                        onValueChange={(value) =>
                          onUpdate(primaryDiagnosis.id, { status: value as DiagnosisStatus })
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 w-[130px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="in_remission">In Remission</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8"
                        onClick={() => onRemove(primaryDiagnosis.id)}
                        disabled={isLoading}
                        aria-label={`Remove diagnosis ${primaryDiagnosis.icd10Code}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {otherDiagnoses.map((diagnosis) => (
              <div
                key={diagnosis.id}
                className="hover:bg-muted/50 rounded-lg border p-3 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{diagnosis.icd10Code}</span>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", statusColors[diagnosis.status])}
                      >
                        {statusLabels[diagnosis.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">{diagnosis.description}</p>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSetPrimary(diagnosis.id)}
                        disabled={isLoading}
                        aria-label={`Set ${diagnosis.icd10Code} as primary diagnosis`}
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                      <Select
                        value={diagnosis.status}
                        onValueChange={(value) =>
                          onUpdate(diagnosis.id, { status: value as DiagnosisStatus })
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 w-[130px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="in_remission">In Remission</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8"
                        onClick={() => onRemove(diagnosis.id)}
                        disabled={isLoading}
                        aria-label={`Remove diagnosis ${diagnosis.icd10Code}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DiagnosisSection;
