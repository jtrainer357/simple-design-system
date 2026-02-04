"use client";

import * as React from "react";
import { Progress } from "@/design-system/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const phases = [
  { threshold: 25, message: "Validating patient records..." },
  { threshold: 50, message: "Importing 5 patients..." },
  { threshold: 75, message: "Matching 5 documents..." },
  { threshold: 95, message: "Generating substrate tasks..." },
  { threshold: 100, message: "Finalizing import..." },
];

interface ExecutionStepProps {
  onComplete: () => void;
}

export function ExecutionStep({ onComplete }: ExecutionStepProps) {
  const [progress, setProgress] = React.useState(0);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  React.useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const step = 100 / (duration / interval);
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + step + Math.random() * 0.5, 100);
      setProgress(current);

      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => onCompleteRef.current(), 600);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const currentPhaseIndex = phases.findIndex((p) => progress < p.threshold);
  const activeIndex = currentPhaseIndex === -1 ? phases.length - 1 : currentPhaseIndex;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full text-center"
      >
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Importing Your Data</h2>
        <p className="mb-8 text-sm text-gray-500">This may take a few moments</p>

        <div className="mb-8 w-full">
          <Progress value={progress} className="h-2.5" />
          <p className="mt-1.5 text-right text-xs font-medium text-gray-500 tabular-nums">
            {Math.round(progress)}%
          </p>
        </div>

        <div className="mb-10 space-y-3 text-left">
          {phases.map((phase, i) => {
            const completed = i < activeIndex || progress >= 100;
            const active = i === activeIndex && progress < 100;

            return (
              <motion.div
                key={phase.message}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex items-center gap-2.5"
              >
                <AnimatePresence mode="wait">
                  {completed ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                    </motion.div>
                  ) : active ? (
                    <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" />
                    </motion.div>
                  ) : (
                    <div className="h-4 w-4 shrink-0 rounded-full border border-gray-300" />
                  )}
                </AnimatePresence>
                <span
                  className={
                    completed
                      ? "text-sm text-gray-400 line-through"
                      : active
                        ? "text-sm font-medium text-gray-900"
                        : "text-sm text-gray-400"
                  }
                >
                  {phase.message}
                </span>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-400 italic"
        >
          Do not close this window while the import is in progress.
        </motion.p>
      </motion.div>
    </div>
  );
}
