"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { usePatientViewNavigation, useViewState } from "@/src/lib/stores/patient-view-store";
import type { PatientDetail } from "./types";

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

interface ClinicalNoteViewProps {
  activity: SelectedActivity;
  patientName: string;
  className?: string;
}

// Generate realistic SOAP note content based on session type
function getNoteContent(activity: SelectedActivity, patientName: string) {
  const isSubstanceUse =
    activity.title?.toLowerCase().includes("substance") ||
    activity.diagnosisCodes?.some((c) => c.toLowerCase().includes("substance"));

  if (isSubstanceUse || activity.appointmentType === "Individual Therapy") {
    return {
      chiefComplaint:
        "Follow-up for ongoing individual therapy, mood management, and coping skills development.",
      subjective: `Patient reports: "I've been doing better this week. The techniques we discussed last session really helped when I felt triggered." Patient describes improved sleep quality (6-7 hours/night vs 4-5 previously). Denies any return to substance use. Reports attending 2 support group meetings this week. Mood described as "mostly stable with some anxiety around work deadlines." No suicidal or homicidal ideation. Appetite normal. Energy levels improving.`,
      objective: `Patient arrived on time, appropriately dressed with good hygiene. Alert and oriented x4. Speech normal rate/rhythm/volume. Mood: "better." Affect: congruent, full range, appropriate. Thought process: linear, goal-directed. No evidence of psychosis, delusions, or hallucinations. Insight: good. Judgment: intact. Eye contact appropriate throughout session.`,
      assessment: `${patientName} continues to make progress in treatment. Demonstrates improved coping skills and increased insight into triggers. Sustained recovery maintained. GAD symptoms showing improvement with current interventions. Patient remains engaged and motivated in treatment.`,
      plan: [
        "Continue individual therapy weekly x 4 sessions",
        "Maintain current coping strategies (mindfulness, journaling, sponsor contact)",
        "Continue support group attendance (minimum 2x/week)",
        "Practice grounding techniques discussed today",
        "Review sleep hygiene handout provided",
        "Next appointment scheduled in 1 week",
      ],
      diagnoses: [
        "F10.20 - Alcohol Use Disorder, Moderate, In Sustained Remission",
        "F41.1 - Generalized Anxiety Disorder",
      ],
      vitals: {
        bp: "122/78",
        hr: "72",
        phq9: "8 (mild)",
        gad7: "10 (moderate)",
      },
    };
  }

  // Default therapy note
  return {
    chiefComplaint: "Scheduled follow-up for ongoing psychotherapy and symptom management.",
    subjective: `Patient reports overall improvement since last session. Describes practicing coping techniques discussed previously with moderate success. Sleep and appetite within normal limits. Denies suicidal or homicidal ideation. Reports some ongoing stressors related to work/family but feels better equipped to manage them.`,
    objective: `Patient arrived on time, casually dressed, good hygiene. Alert and oriented x4. Cooperative and engaged throughout session. Mood: "okay." Affect: appropriate, full range. Thought process: linear and goal-directed. No evidence of psychosis. Insight and judgment intact.`,
    assessment: `Patient demonstrates continued engagement in treatment and progress toward therapeutic goals. Current symptoms are well-managed with existing treatment approach.`,
    plan: [
      "Continue current treatment approach",
      "Practice techniques discussed in session",
      "Schedule follow-up appointment",
    ],
    diagnoses: ["F41.1 - Generalized Anxiety Disorder"],
    vitals: {
      phq9: "6 (mild)",
      gad7: "8 (mild)",
    },
  };
}

export function ClinicalNoteView({ activity, patientName, className }: ClinicalNoteViewProps) {
  const note = getNoteContent(activity, patientName);
  const viewState = useViewState();
  const { goBack, toggleFullView } = usePatientViewNavigation();
  const isFullView = viewState === "fullView";

  // Handle ESC key to exit full view
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullView) {
        event.preventDefault();
        toggleFullView();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullView, toggleFullView]);

  // Animation variants for full view transition
  const containerVariants = {
    normal: {
      opacity: 1,
      scale: 1,
    },
    fullView: {
      opacity: 1,
      scale: 1,
    },
  };

  return (
    <motion.div
      className={cn("flex h-full flex-col", className)}
      variants={containerVariants}
      initial="normal"
      animate={isFullView ? "fullView" : "normal"}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className="border-border/30 mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            aria-label="Go back to visit summary"
            className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <Heading level={4} className="text-lg font-semibold sm:text-xl">
              Clinical Note
            </Heading>
            <Text size="sm" muted className="mt-0.5">
              {activity.title} · {activity.date}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
          >
            Signed & Locked
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullView}
            className="border-border/50 hover:border-primary/30 hover:bg-primary/5 gap-2 transition-all"
            aria-label={isFullView ? "Exit full view" : "Enter full view"}
          >
            {isFullView ? (
              <>
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Exit Full View</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Full View</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Note Content */}
      <div
        className={cn(
          "flex-1 space-y-5 overflow-y-auto",
          isFullView && "mx-auto w-full max-w-4xl px-4"
        )}
      >
        {/* Patient & Session Info */}
        <Card className="border-border/40 from-muted/40 to-muted/20 overflow-hidden bg-gradient-to-br p-0 shadow-sm">
          <div className="divide-border/30 grid grid-cols-2 divide-x sm:grid-cols-4">
            <div className="p-4">
              <Text
                size="xs"
                muted
                className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                Patient
              </Text>
              <Text size="sm" className="font-semibold">
                {patientName}
              </Text>
            </div>
            <div className="p-4">
              <Text
                size="xs"
                muted
                className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                Date of Service
              </Text>
              <Text size="sm" className="font-semibold">
                {activity.date}
              </Text>
            </div>
            <div className="p-4">
              <Text
                size="xs"
                muted
                className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                Provider
              </Text>
              <Text size="sm" className="font-semibold">
                {activity.provider || "Dr. Demo"}
              </Text>
            </div>
            <div className="p-4">
              <Text
                size="xs"
                muted
                className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                Duration
              </Text>
              <Text size="sm" className="font-semibold">
                {activity.duration || "60 min"}
              </Text>
            </div>
          </div>
        </Card>

        {/* Vitals / Assessments */}
        {note.vitals && (
          <section>
            <Text
              size="xs"
              className="text-muted-foreground mb-3 font-bold tracking-wider uppercase"
            >
              Clinical Measures
            </Text>
            <Card className="border-border/40 bg-white/60 p-4 shadow-sm">
              <div className="flex flex-wrap gap-4">
                {note.vitals.bp && (
                  <div className="bg-muted/50 flex items-center gap-2.5 rounded-lg px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
                      <Text size="xs" className="font-bold text-rose-600">
                        BP
                      </Text>
                    </div>
                    <Text size="sm" className="font-medium">
                      {note.vitals.bp} mmHg
                    </Text>
                  </div>
                )}
                {note.vitals.hr && (
                  <div className="bg-muted/50 flex items-center gap-2.5 rounded-lg px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                      <Text size="xs" className="font-bold text-red-600">
                        HR
                      </Text>
                    </div>
                    <Text size="sm" className="font-medium">
                      {note.vitals.hr} bpm
                    </Text>
                  </div>
                )}
                {note.vitals.phq9 && (
                  <div className="bg-muted/50 flex items-center gap-2.5 rounded-lg px-3 py-2">
                    <div className="flex h-8 items-center justify-center rounded-lg bg-blue-100 px-2.5">
                      <Text size="xs" className="font-bold text-blue-600">
                        PHQ-9
                      </Text>
                    </div>
                    <Text size="sm" className="font-medium">
                      {note.vitals.phq9}
                    </Text>
                  </div>
                )}
                {note.vitals.gad7 && (
                  <div className="bg-muted/50 flex items-center gap-2.5 rounded-lg px-3 py-2">
                    <div className="flex h-8 items-center justify-center rounded-lg bg-teal-100 px-2.5">
                      <Text size="xs" className="font-bold text-teal-600">
                        GAD-7
                      </Text>
                    </div>
                    <Text size="sm" className="font-medium">
                      {note.vitals.gad7}
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          </section>
        )}

        {/* Chief Complaint */}
        <section>
          <Text size="xs" className="text-muted-foreground mb-3 font-bold tracking-wider uppercase">
            Chief Complaint
          </Text>
          <Text size="sm" className="text-foreground/80 leading-relaxed">
            {note.chiefComplaint}
          </Text>
        </section>

        {/* Subjective */}
        <section>
          <Text size="xs" className="text-muted-foreground mb-3 font-bold tracking-wider uppercase">
            Subjective
          </Text>
          <Card className="border-border/40 bg-white/60 p-5 shadow-sm">
            <Text size="sm" className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {note.subjective}
            </Text>
          </Card>
        </section>

        {/* Objective */}
        <section>
          <Text size="xs" className="text-muted-foreground mb-3 font-bold tracking-wider uppercase">
            Objective
          </Text>
          <Card className="border-border/40 bg-white/60 p-5 shadow-sm">
            <Text size="sm" className="text-foreground/80 leading-relaxed">
              {note.objective}
            </Text>
          </Card>
        </section>

        {/* Assessment */}
        <section>
          <Text size="xs" className="text-muted-foreground mb-3 font-bold tracking-wider uppercase">
            Assessment
          </Text>
          <Card className="border-border/40 bg-white/60 p-5 shadow-sm">
            <Text size="sm" className="text-foreground/80 mb-4 leading-relaxed">
              {note.assessment}
            </Text>
            <div className="border-border/30 border-t pt-4">
              <Text
                size="xs"
                className="text-muted-foreground mb-2 font-semibold tracking-wider uppercase"
              >
                Diagnoses
              </Text>
              <div className="space-y-1.5">
                {note.diagnoses.map((dx, i) => (
                  <div key={i} className="bg-muted/40 rounded-lg px-3 py-2">
                    <Text size="sm" className="text-foreground/70 font-mono text-xs">
                      {dx}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Plan */}
        <section>
          <Text size="xs" className="text-muted-foreground mb-3 font-bold tracking-wider uppercase">
            Plan
          </Text>
          <Card className="border-border/40 bg-white/60 p-5 shadow-sm">
            <ul className="space-y-3">
              {note.plan.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {i + 1}
                  </span>
                  <Text size="sm" className="text-foreground/80 pt-0.5">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Signature */}
        <Card className="border-border/40 overflow-hidden bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 p-0 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div>
              <Text size="sm" className="font-semibold">
                Electronically signed by {activity.provider || "Dr. Demo"}
              </Text>
              <Text size="xs" muted className="mt-0.5">
                {activity.date} at 4:32 PM
              </Text>
            </div>
            <Badge className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Verified
            </Badge>
          </div>
        </Card>

        {/* ESC key hint when in full view */}
        <AnimatePresence>
          {isFullView && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-2 rounded-full bg-stone-800/90 px-4 py-2 text-white shadow-lg">
                <kbd className="rounded bg-stone-700 px-2 py-0.5 font-mono text-xs">ESC</kbd>
                <Text size="sm" className="text-stone-200">
                  to exit full view
                </Text>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
