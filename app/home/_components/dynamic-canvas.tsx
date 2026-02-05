"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PriorityActionsSection } from "./priority-actions-section";
import { TodaysPatientsList } from "./todays-patients-list";
import { PatientCanvasDetail } from "./patient-canvas-detail";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";

type CanvasView = "actions" | "patient-detail";

interface DynamicCanvasProps {
  className?: string;
}

// Cards: slide in from left, slide out to left
const cardsVariants = {
  initial: { x: "-100%", opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

// Detail: slide in from right, slide out to right
const detailVariants = {
  initial: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};

// Smooth ease transition (no bounce)
const transition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1] as const,
};

export function DynamicCanvas({ className }: DynamicCanvasProps) {
  const [view, setView] = React.useState<CanvasView>("actions");
  const [selectedContext, setSelectedContext] = React.useState<OrchestrationContext | null>(null);

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

  return (
    <div className={className + " overflow-auto"}>
      {/* Animated content area - only swaps cards/detail, auto height */}
      {/* Use padding to allow room for shadows, negative margin to maintain layout */}
      <div className="relative -mx-4 -my-2 px-4 py-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {view === "actions" ? (
            <motion.div
              key="cards"
              initial="initial"
              animate="visible"
              exit="exit"
              variants={cardsVariants}
              transition={transition}
            >
              <PriorityActionsSection onSelectPatient={handleSelectPatient} />
            </motion.div>
          ) : (
            <motion.div
              key="patient-detail"
              initial="initial"
              animate="visible"
              exit="exit"
              variants={detailVariants}
              transition={transition}
            >
              {selectedContext && (
                <PatientCanvasDetail
                  context={selectedContext}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Today's Patients - always visible below */}
      <TodaysPatientsList className="mt-6 pb-4" />
    </div>
  );
}
