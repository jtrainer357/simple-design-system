"use client";

import { Card } from "@/design-system/components/ui/card";
import { motion } from "framer-motion";
import {
  FileText as File,
  HeartPulse as HealthIcon,
  Sheet as GoogleIcon,
  Settings,
} from "lucide-react";

interface SourceSelectionStepProps {
  onSelect: (system: string) => void;
}

const sources = [
  { id: "simplepractice", name: "SimplePractice", icon: HealthIcon, color: "text-teal-600" },
  { id: "therapynotes", name: "TherapyNotes", icon: File, color: "text-emerald-600" },
  { id: "google", name: "Google/Excel", icon: GoogleIcon, color: "text-green-600" },
  { id: "other", name: "Other EHR", icon: Settings, color: "text-gray-500" },
];

export function SourceSelectionStep({ onSelect }: SourceSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Where are you importing from?</h2>
        <p className="text-gray-500">
          We&apos;ll tailor the import experience to your source system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sources.map((source) => (
          <motion.div key={source.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              className="flex cursor-pointer items-center space-x-4 p-6 transition-colors hover:border-teal-500 hover:bg-teal-50/50"
              onClick={() => onSelect(source.id)}
            >
              <div className={`rounded-full bg-gray-100 p-3 ${source.color}`}>
                <source.icon className="h-8 w-8" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">{source.name}</h3>
                <p className="text-sm text-gray-500">Import patients, notes & documents</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
