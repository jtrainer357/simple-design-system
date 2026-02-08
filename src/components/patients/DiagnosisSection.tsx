"use client";

import { useState, useMemo } from "react";
import { Plus, Star, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PatientDiagnosis, DiagnosisStatus } from "@/lib/session";
import icd10Data from "@/lib/data/icd10-mental-health.json";

interface ICD10Code { code: string; description: string; category: string; }

interface DiagnosisSectionProps {
  diagnoses: PatientDiagnosis[];
  onAdd: (data: { icd10Code: string; description: string; isPrimary?: boolean }) => Promise<void>;
  onUpdate: (id: string, data: Partial<{ status: DiagnosisStatus; isPrimary: boolean }>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

const statusColors: Record<DiagnosisStatus, string> = { active: "bg-green-100 text-green-800", resolved: "bg-gray-100 text-gray-800", in_remission: "bg-blue-100 text-blue-800" };
const statusLabels: Record<DiagnosisStatus, string> = { active: "Active", resolved: "Resolved", in_remission: "In Remission" };

export function DiagnosisSection({ diagnoses, onAdd, onUpdate, onRemove, isLoading = false, readOnly = false }: DiagnosisSectionProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const icd10Codes = icd10Data.codes as ICD10Code[];

  const filteredCodes = useMemo(() => {
    if (!searchQuery) return icd10Codes.slice(0, 20);
    const query = searchQuery.toLowerCase();
    return icd10Codes.filter((code) => code.code.toLowerCase().includes(query) || code.description.toLowerCase().includes(query) || code.category.toLowerCase().includes(query));
  }, [searchQuery, icd10Codes]);

  const groupedCodes = useMemo(() => {
    const groups: Record<string, ICD10Code[]> = {};
    filteredCodes.forEach((code) => { if (!groups[code.category]) groups[code.category] = []; groups[code.category].push(code); });
    return groups;
  }, [filteredCodes]);

  const handleAddDiagnosis = async (code: ICD10Code) => {
    await onAdd({ icd10Code: code.code, description: code.description, isPrimary: diagnoses.length === 0 });
    setSearchOpen(false); setSearchQuery("");
  };

  const handleSetPrimary = async (id: string) => {
    for (const dx of diagnoses) { if (dx.isPrimary && dx.id !== id) await onUpdate(dx.id, { isPrimary: false }); }
    await onUpdate(id, { isPrimary: true });
  };

  const primaryDiagnosis = diagnoses.find((d) => d.isPrimary);
  const otherDiagnoses = diagnoses.filter((d) => !d.isPrimary);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div><CardTitle className="text-lg">Diagnoses</CardTitle><CardDescription>ICD-10 diagnosis codes</CardDescription></div>
          {!readOnly && (
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Add Diagnosis</Button></PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="end">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search ICD-10 codes..." value={searchQuery} onValueChange={setSearchQuery} />
                  <CommandList>
                    <CommandEmpty>No diagnosis codes found.</CommandEmpty>
                    {Object.entries(groupedCodes).map(([category, codes]) => (
                      <CommandGroup key={category} heading={category}>
                        {codes.map((code) => (
                          <CommandItem key={code.code} value={code.code} onSelect={() => handleAddDiagnosis(code)} className="cursor-pointer">
                            <div className="flex flex-col"><span className="font-mono text-sm font-medium">{code.code}</span><span className="text-sm text-muted-foreground">{code.description}</span></div>
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
        {diagnoses.length === 0 ? <div className="text-sm text-muted-foreground text-center py-4">No diagnoses on file</div> : (
          <div className="space-y-2">
            {primaryDiagnosis && (
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-primary fill-primary" /><span className="text-xs font-medium text-primary uppercase">Primary Diagnosis</span></div>
                    <div className="flex items-center gap-2"><span className="font-mono font-medium">{primaryDiagnosis.icd10Code}</span><Badge variant="secondary" className={cn("text-xs", statusColors[primaryDiagnosis.status])}>{statusLabels[primaryDiagnosis.status]}</Badge></div>
                    <p className="text-sm text-muted-foreground mt-1">{primaryDiagnosis.description}</p>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <Select value={primaryDiagnosis.status} onValueChange={(value) => onUpdate(primaryDiagnosis.id, { status: value as DiagnosisStatus })} disabled={isLoading}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="in_remission">In Remission</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(primaryDiagnosis.id)} disabled={isLoading}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {otherDiagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="font-mono font-medium">{diagnosis.icd10Code}</span><Badge variant="secondary" className={cn("text-xs", statusColors[diagnosis.status])}>{statusLabels[diagnosis.status]}</Badge></div>
                    <p className="text-sm text-muted-foreground mt-1">{diagnosis.description}</p>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSetPrimary(diagnosis.id)} disabled={isLoading} title="Set as primary"><StarOff className="h-4 w-4" /></Button>
                      <Select value={diagnosis.status} onValueChange={(value) => onUpdate(diagnosis.id, { status: value as DiagnosisStatus })} disabled={isLoading}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="in_remission">In Remission</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(diagnosis.id)} disabled={isLoading}><Trash2 className="h-4 w-4" /></Button>
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
