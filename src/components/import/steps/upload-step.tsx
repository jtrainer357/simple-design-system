"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Upload, File, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/design-system/lib/utils";
import type { UploadedFile } from "../import-wizard";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("UploadStep");

interface UploadStepProps {
  sourceSystem: string;
  onComplete: (batchId: string, files: UploadedFile[]) => void;
}

interface UploadFile {
  file: File;
  type: "roster" | "documents" | "appointments";
  status: "pending" | "uploading" | "complete" | "error";
  progress: number;
}

export function UploadStep({ sourceSystem, onComplete }: UploadStepProps) {
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles: File[]) => {
    const processed = newFiles.map((file) => {
      let type: "roster" | "documents" | "appointments" = "documents";
      if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx")) type = "roster";
      if (file.name.endsWith(".ics")) type = "appointments";

      return { file, type, status: "pending", progress: 0 } as UploadFile;
    });
    setFiles((prev) => [...prev, ...processed]);
  };

  const startUpload = async () => {
    const uploadingFiles = [...files];
    const tempBatchId = crypto.randomUUID();

    let successCount = 0;

    for (let i = 0; i < uploadingFiles.length; i++) {
      const f = uploadingFiles[i];
      if (!f || f.status === "complete") {
        successCount++;
        continue;
      }

      setFiles((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "uploading" } : item))
      );

      try {
        // For hackathon demo, simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

        setFiles((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "complete", progress: 100 } : item
          )
        );
        successCount++;
      } catch (err) {
        log.error("Upload error", err, { fileName: f.file.name });
        setFiles((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: "error" } : item))
        );
        toast.error(`Failed to upload ${f.file.name}`);
      }
    }

    if (successCount === uploadingFiles.length && successCount > 0) {
      onComplete(
        tempBatchId,
        uploadingFiles.map((f) => ({ name: f.file.name, type: f.type }))
      );
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Upload your files</h2>
        <p className="text-gray-500">
          Importing from{" "}
          <span className="font-semibold text-teal-600 capitalize">{sourceSystem}</span>. We accept
          CSV, XLSX, PDF, and ZIP.
        </p>
      </div>

      <div
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          isDragging ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-teal-500",
          files.length > 0 ? "py-6" : "py-16"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          aria-label="Select files to import"
          className="hidden"
          multiple
          onChange={handleFileSelect}
          accept=".csv,.xlsx,.xls,.pdf,.zip,.ics"
        />

        {files.length === 0 ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Upload className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">Max file size 500MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Add more files
            </Button>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, idx) => (
            <Card
              key={idx}
              className="flex flex-col justify-between gap-3 p-3 sm:flex-row sm:items-center sm:p-4"
            >
              <div className="flex min-w-0 items-center space-x-3 sm:space-x-4">
                <div className="shrink-0 rounded-lg bg-gray-100 p-2 text-gray-500">
                  <File className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{file.file.name}</p>
                  <p className="text-xs text-gray-500 uppercase">
                    {file.type} &bull; {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center space-x-3 self-end sm:self-auto">
                {file.status === "uploading" && (
                  <div className="animate-pulse text-xs text-teal-600">Uploading...</div>
                )}
                {file.status === "complete" && (
                  <CheckCircle2Icon className="h-5 w-5 text-emerald-600" />
                )}
                {file.status === "error" && <AlertCircleIcon className="h-5 w-5 text-red-500" />}
                {file.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400"
                    onClick={() => removeFile(idx)}
                  >
                    <span className="sr-only">Remove</span>
                    &times;
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          className="bg-teal-600 hover:bg-teal-700"
          size="lg"
          onClick={startUpload}
          disabled={files.length === 0 || files.some((f) => f.status === "uploading")}
        >
          {files.some((f) => f.status === "uploading") ? "Uploading..." : "Process Import"}
        </Button>
      </div>
    </div>
  );
}
