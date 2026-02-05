"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PriorityActionsSection, TodaysActionsHeader } from "./priority-actions-section";
import { TodaysPatientsList } from "./todays-patients-list";
import { PatientCanvasDetail } from "./patient-canvas-detail";
import { getTodayAppointments } from "@/src/lib/queries/appointments";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";

type CanvasView = "actions" | "patient-detail";

interface DynamicCanvasProps {
  className?: string;
}

// Slide distance for the animation
const SLIDE_DISTANCE = 30;

// Smooth easing curve
const smoothEasing = [0.4, 0, 0.2, 1] as const;

// Transition settings
const transition = {
  duration: 0.3,
  ease: smoothEasing,
};

export function DynamicCanvas({ className }: DynamicCanvasProps) {
  const [view, setView] = React.useState<CanvasView>("actions");
  const [selectedContext, setSelectedContext] = React.useState<OrchestrationContext | null>(null);
  const [appointmentCount, setAppointmentCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadAppointmentCount() {
      try {
        const appointments = await getTodayAppointments();
        setAppointmentCount(appointments.length);
      } catch (err) {
        console.error("Failed to load appointment count:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAppointmentCount();
  }, []);

  const handleSelectPatient = (context: OrchestrationContext) => {
    setSelectedContext(context);
    setView("patient-detail");
  };

  const handleCancel = () => {
    setView("actions");
  };

  const handleComplete = () => {
    setView("actions");
  };

  const isActions = view === "actions";

  return (
    <div className={className + " -m-6 flex flex-col p-6"}>
      {/* Fixed Header */}
      <div className="mb-14 shrink-0">
        <TodaysActionsHeader appointmentCount={appointmentCount} isLoading={isLoading} />
      </div>

      {/* Scrollable Content - px-3 allows shadows to show */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        {/* Grid container - both views exist, one is visible */}
        <div className="grid">
          {/* Actions View */}
          <motion.div
            className="col-start-1 row-start-1"
            initial={false}
            animate={{
              opacity: isActions ? 1 : 0,
              x: isActions ? 0 : -SLIDE_DISTANCE,
              pointerEvents: isActions ? "auto" : "none",
            }}
            transition={transition}
            style={{
              visibility: isActions ? "visible" : "hidden",
              zIndex: isActions ? 1 : 0,
            }}
          >
            <PriorityActionsSection onSelectPatient={handleSelectPatient} hideHeader />
          </motion.div>

          {/* Detail View */}
          <motion.div
            className="col-start-1 row-start-1"
            initial={false}
            animate={{
              opacity: isActions ? 0 : 1,
              x: isActions ? SLIDE_DISTANCE : 0,
              pointerEvents: isActions ? "none" : "auto",
            }}
            transition={transition}
            style={{
              visibility: isActions ? "hidden" : "visible",
              zIndex: isActions ? 0 : 1,
            }}
          >
            {selectedContext && (
              <PatientCanvasDetail
                context={selectedContext}
                onCancel={handleCancel}
                onComplete={handleComplete}
              />
            )}
          </motion.div>
        </div>

        {/* Today's Patients */}
        <div className="mt-10 pb-4">
          <TodaysPatientsList onSelectPatient={handleSelectPatient} />
        </div>
      </div>
    </div>
  );
}
