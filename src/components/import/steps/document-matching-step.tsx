"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import { FileText, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface DocumentMatch {
  id: string;
  filename: string;
  detectedPatient: string | null;
  confidence: number;
  documentType: string;
}

const EXAMPLE_DOCUMENTS: DocumentMatch[] = [
  {
    id: "1",
    filename: "PatientA_IntakeAssessment_2024.pdf",
    detectedPatient: "Patient A",
    confidence: 97,
    documentType: "Intake Assessment",
  },
  {
    id: "2",
    filename: "PatientB_ProgressNote_20240315.pdf",
    detectedPatient: "Patient B",
    confidence: 95,
    documentType: "Progress Note",
  },
  {
    id: "3",
    filename: "PatientC_TreatmentPlan_2024.pdf",
    detectedPatient: "Patient C",
    confidence: 98,
    documentType: "Treatment Plan",
  },
  {
    id: "4",
    filename: "PatientD_PHQ9_20240401.pdf",
    detectedPatient: "Patient D",
    confidence: 93,
    documentType: "PHQ-9 Screening",
  },
  {
    id: "5",
    filename: "PatientE_GAD7_20240220.pdf",
    detectedPatient: "Patient E",
    confidence: 78,
    documentType: "GAD-7 Screening",
  },
];

const PATIENT_OPTIONS = ["Patient A", "Patient B", "Patient C", "Patient D", "Patient E"];

function getMatchStatus(doc: DocumentMatch) {
  if (!doc.detectedPatient) return "unmatched" as const;
  if (doc.confidence >= 90) return "matched" as const;
  return "review" as const;
}

export function DocumentMatchingStep({ onComplete }: { onComplete: () => void }) {
  const [documents, setDocuments] = React.useState(EXAMPLE_DOCUMENTS);

  const matched = documents.filter((d) => getMatchStatus(d) === "matched").length;
  const review = documents.filter((d) => getMatchStatus(d) === "review").length;
  const unmatched = documents.filter((d) => getMatchStatus(d) === "unmatched").length;

  const handlePatientChange = (docId: string, patient: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, detectedPatient: patient, confidence: 100 } : d))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Document Matching</h2>
        <p className="mt-1 text-sm text-gray-500">
          Documents have been analyzed and auto-matched to patients. Review the matches below before
          confirming.
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-gray-600">{matched} matched</span>
        </span>
        <span className="flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-gray-600">{review} needs review</span>
        </span>
        <span className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-gray-600">{unmatched} unmatched</span>
        </span>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => {
          const status = getMatchStatus(doc);

          return (
            <Card
              key={doc.id}
              className={`flex items-center gap-4 p-4 ${
                status === "review" ? "border-teal-500" : ""
              }`}
            >
              <FileText className="h-5 w-5 shrink-0 text-gray-400" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{doc.filename}</p>
                <p className="text-xs text-gray-500">{doc.documentType}</p>
              </div>

              <div className="flex items-center gap-3">
                {status === "matched" && (
                  <>
                    <span className="text-sm text-gray-600">{doc.detectedPatient}</span>
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                      Matched {doc.confidence}%
                    </Badge>
                  </>
                )}

                {status === "review" && (
                  <>
                    <select
                      className="rounded-md border border-teal-500 bg-white px-2 py-1 text-sm text-gray-900"
                      defaultValue={doc.detectedPatient ?? ""}
                      onChange={(e) => handlePatientChange(doc.id, e.target.value)}
                    >
                      <option value="" disabled>
                        Select patient
                      </option>
                      {PATIENT_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                      Review {doc.confidence}%
                    </Badge>
                  </>
                )}

                {status === "unmatched" && (
                  <>
                    <select
                      className="rounded-md border border-teal-500 bg-white px-2 py-1 text-sm text-gray-900"
                      defaultValue=""
                      onChange={(e) => handlePatientChange(doc.id, e.target.value)}
                    >
                      <option value="" disabled>
                        Select patient
                      </option>
                      {PATIENT_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <Badge className="bg-red-500 text-white hover:bg-red-500">Unmatched</Badge>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={onComplete}>
          Confirm Matches
        </Button>
      </div>
    </div>
  );
}
