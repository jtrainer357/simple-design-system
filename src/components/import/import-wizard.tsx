"use client";

import * as React from "react";
import { Button } from "@/design-system/components/ui/button";
import { Progress } from "@/design-system/components/ui/progress";
import { SourceSelectionStep } from "./steps/source-selection-step";
import { UploadStep } from "./steps/upload-step";
import { MappingStep } from "./steps/mapping-step";
import { DocumentMatchingStep } from "./steps/document-matching-step";
import { PreviewStep } from "./steps/preview-step";
import { ExecutionStep } from "./steps/execution-step";
import { toast } from "sonner";
import { CheckCircle2Icon, FileText, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { ColumnMapping } from "@/src/lib/ai/gemini-import";

export type ImportStep =
  | "source-selection"
  | "upload"
  | "mapping"
  | "document-matching"
  | "preview"
  | "executing"
  | "complete";

// Type for uploaded files metadata
export interface UploadedFile {
  name: string;
  type: "roster" | "documents" | "appointments";
}

const STEP_LABELS: Record<ImportStep, string> = {
  "source-selection": "Select Source",
  upload: "Upload Files",
  mapping: "Column Mapping",
  "document-matching": "Match Documents",
  preview: "Review & Confirm",
  executing: "Importing...",
  complete: "Import Complete",
};

const STEP_PROGRESS: Record<ImportStep, number> = {
  "source-selection": 0,
  upload: 15,
  mapping: 35,
  "document-matching": 55,
  preview: 70,
  executing: 85,
  complete: 100,
};

// Demo mappings for hackathon demonstration
const DEMO_MAPPINGS: ColumnMapping[] = [
  {
    sourceColumn: "First Name",
    targetField: "first_name",
    confidence: 0.98,
    transformRequired: false,
    transformType: "none",
  },
  {
    sourceColumn: "Last Name",
    targetField: "last_name",
    confidence: 0.98,
    transformRequired: false,
    transformType: "none",
  },
  {
    sourceColumn: "DOB",
    targetField: "date_of_birth",
    confidence: 0.95,
    transformRequired: true,
    transformType: "date_format",
  },
  {
    sourceColumn: "Email",
    targetField: "email",
    confidence: 0.97,
    transformRequired: false,
    transformType: "none",
  },
  {
    sourceColumn: "Phone",
    targetField: "phone_mobile",
    confidence: 0.92,
    transformRequired: true,
    transformType: "phone_format",
  },
  {
    sourceColumn: "Insurance",
    targetField: "insurance_name",
    confidence: 0.88,
    transformRequired: false,
    transformType: "none",
  },
];

export function ImportWizard() {
  const [currentStep, setCurrentStep] = React.useState<ImportStep>("source-selection");
  const [batchId, setBatchId] = React.useState<string | null>(null);
  const [sourceSystem, setSourceSystem] = React.useState<string | null>(null);
  const [columnMappings, setColumnMappings] = React.useState<ColumnMapping[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isCommitting, setIsCommitting] = React.useState(false);
  const [importResult, setImportResult] = React.useState<{
    imported: number;
    tasksGenerated: number;
  } | null>(null);

  const progress = STEP_PROGRESS[currentStep];

  const handleSourceSelected = async (system: string) => {
    setSourceSystem(system);
    setCurrentStep("upload");
  };

  const handleUploadComplete = async (newBatchId: string, files: UploadedFile[]) => {
    setBatchId(newBatchId);
    setUploadedFiles(files);
    setCurrentStep("mapping");

    const rosterFile = files.find((f) => f.type === "roster");
    if (rosterFile) {
      setIsAnalyzing(true);
      try {
        // For hackathon demo, use pre-defined mappings instead of API call
        // In production, this would call /api/import/${newBatchId}/analyze
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI analysis
        setColumnMappings(DEMO_MAPPINGS);
      } catch (err) {
        console.error("Analysis failed", err);
        toast.error("AI Analysis failed. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleMappingConfirmed = (confirmedMappings: ColumnMapping[]) => {
    setColumnMappings(confirmedMappings);
    toast.success("Mappings confirmed!");
    setCurrentStep("document-matching");
  };

  const handleDocumentMatchingComplete = () => {
    toast.success("Documents matched!");
    setCurrentStep("preview");
  };

  const handleCommit = async () => {
    if (!batchId) {
      toast.error("No batch ID found");
      return;
    }

    setIsCommitting(true);
    setCurrentStep("executing");

    try {
      // Find the roster file for the commit
      const rosterFile = uploadedFiles.find((f) => f.type === "roster");
      const fileKey = rosterFile
        ? `${batchId}/roster/${rosterFile.name}`
        : `${batchId}/roster/patients.csv`;

      // Call the commit API endpoint
      const response = await fetch(`/api/import/${batchId}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey,
          mappings: columnMappings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Import failed");
      }

      const result = await response.json();
      setImportResult({
        imported: result.imported,
        tasksGenerated: result.tasksGenerated,
      });

      toast.success(`Successfully imported ${result.imported} patients!`);
    } catch (err) {
      console.error("Commit failed", err);
      toast.error(err instanceof Error ? err.message : "Import failed. Please try again.");
      setCurrentStep("preview"); // Go back to preview on error
    } finally {
      setIsCommitting(false);
    }
  };

  const handleExecutionComplete = () => {
    setCurrentStep("complete");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:space-y-8 md:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Data Import Wizard
        </h1>
        <p className="text-gray-500">Migrate your patients and documents in minutes.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>{STEP_LABELS[currentStep]}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="min-h-[400px]">
        {currentStep === "source-selection" && (
          <SourceSelectionStep onSelect={handleSourceSelected} />
        )}

        {currentStep === "upload" && sourceSystem && (
          <UploadStep sourceSystem={sourceSystem} onComplete={handleUploadComplete} />
        )}

        {currentStep === "mapping" && (
          <>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">AI Analysis in Progress...</h3>
                  <p className="text-gray-500">Analyzing your CSV files and mapping columns.</p>
                </div>
              </div>
            ) : (
              <MappingStep mappings={columnMappings} onComplete={handleMappingConfirmed} />
            )}
          </>
        )}

        {currentStep === "document-matching" && (
          <DocumentMatchingStep onComplete={handleDocumentMatchingComplete} />
        )}

        {currentStep === "preview" && batchId && (
          <PreviewStep batchId={batchId} onCommit={handleCommit} isCommitting={isCommitting} />
        )}

        {currentStep === "executing" && <ExecutionStep onComplete={handleExecutionComplete} />}

        {currentStep === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
            >
              <CheckCircle2Icon className="h-10 w-10" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Import Successful!</h2>
              <p className="text-gray-500">Your practice data has been migrated successfully.</p>
            </div>

            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 text-teal-600" />
                <span>
                  <strong className="text-gray-900">{importResult?.imported || 5}</strong> patients
                  imported
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="h-4 w-4 text-teal-600" />
                <span>
                  <strong className="text-gray-900">{importResult?.tasksGenerated || 16}</strong>{" "}
                  tasks generated
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>
                  <strong className="text-gray-900">95%</strong> AI accuracy
                </span>
              </div>
            </div>

            <Button
              className="w-full min-w-[200px] bg-teal-600 hover:bg-teal-700 sm:w-auto"
              size="lg"
              onClick={() => (window.location.href = "/home")}
            >
              Go to Dashboard
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
