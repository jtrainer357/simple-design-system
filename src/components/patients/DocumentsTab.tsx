"use client";

import * as React from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  File,
  FileImage,
  Loader2,
  MoreVertical,
  Eye,
} from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Text } from "@/design-system/components/ui/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/design-system/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/components/ui/alert-dialog";
import { cn } from "@/design-system/lib/utils";
import { toast } from "sonner";

export interface PatientDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
  url?: string;
  category?: "clinical" | "insurance" | "consent" | "other";
}

export interface DocumentsTabProps {
  patientId: string;
  documents: PatientDocument[];
  isLoading?: boolean;
  onUpload?: (files: FileList) => Promise<void>;
  onDownload?: (document: PatientDocument) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  onPreview?: (document: PatientDocument) => void;
  className?: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  gif: FileImage,
  default: File,
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "default";
}

export function DocumentsTab({
  patientId,
  documents,
  isLoading = false,
  onUpload,
  onDownload,
  onDelete,
  onPreview,
  className,
}: DocumentsTabProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<PatientDocument | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onUpload) return;

    setIsUploading(true);
    try {
      await onUpload(files);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = async (doc: PatientDocument) => {
    if (!onDownload) {
      if (doc.url) {
        window.open(doc.url, "_blank");
      }
      return;
    }

    try {
      await onDownload(doc);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      toast.success("Document deleted");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const categorizedDocs = React.useMemo(() => {
    const categories: Record<string, PatientDocument[]> = {
      clinical: [],
      insurance: [],
      consent: [],
      other: [],
    };

    documents.forEach((doc) => {
      const category = doc.category || "other";
      categories[category].push(doc);
    });

    return categories;
  }, [documents]);

  if (isLoading) {
    return (
      <div className={cn("flex h-64 items-center justify-center", className)}>
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Section */}
      <div className="border-muted rounded-lg border-2 border-dashed p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${patientId}`}
        />
        <Upload className="text-muted-foreground mx-auto h-8 w-8" />
        <Text size="sm" className="mt-2">
          Drag and drop files here, or
        </Text>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 min-h-[44px]"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !onUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Browse Files"
          )}
        </Button>
        <Text size="xs" muted className="mt-2">
          Accepted: PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB)
        </Text>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="text-muted-foreground/50 mx-auto h-12 w-12" />
          <Text size="sm" muted className="mt-2">
            No documents uploaded yet
          </Text>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(categorizedDocs).map(([category, docs]) => {
            if (docs.length === 0) return null;

            return (
              <div key={category}>
                <Text size="sm" weight="medium" className="mb-2 capitalize">
                  {category} Documents
                </Text>
                <div className="space-y-2">
                  {docs.map((doc) => {
                    const ext = getFileExtension(doc.name);
                    const IconComponent = FILE_ICONS[ext] || FILE_ICONS.default;

                    return (
                      <div
                        key={doc.id}
                        className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                      >
                        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <IconComponent className="text-muted-foreground h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <Text size="sm" weight="medium" className="truncate">
                            {doc.name}
                          </Text>
                          <Text size="xs" muted>
                            {formatFileSize(doc.size)} &bull; {formatDate(doc.uploadedAt)}
                            {doc.uploadedBy && ` &bull; by ${doc.uploadedBy}`}
                          </Text>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onPreview && (
                              <DropdownMenuItem onClick={() => onPreview(doc)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(doc)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
