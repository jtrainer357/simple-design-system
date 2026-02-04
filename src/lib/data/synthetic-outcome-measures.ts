/**
 * Outcome Measures (PHQ-9, GAD-7, PCL-5) with realistic trends
 * This data enables REAL substrate intelligence analysis
 */

import { SYNTHETIC_PATIENTS } from "./synthetic-patients";

export interface OutcomeMeasure {
  id: string;
  patient_id: string;
  measure_type: "PHQ-9" | "GAD-7" | "PCL-5";
  score: number;
  max_score: number;
  measurement_date: string;
  administered_by: string;
}

// Seeded random for consistency
let seed = 54321;
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function generateOutcomeMeasures(): OutcomeMeasure[] {
  const measures: OutcomeMeasure[] = [];
  let measureId = 1;

  SYNTHETIC_PATIENTS.forEach((patient) => {
    // Generate 3-6 measurements per patient over their treatment period
    const treatmentStart = new Date(patient.treatment_start_date);
    const now = new Date();
    const monthsInTreatment = Math.floor(
      (now.getTime() - treatmentStart.getTime()) / (30 * 24 * 60 * 60 * 1000)
    );
    const numMeasurements = Math.min(6, Math.max(3, monthsInTreatment));

    // Determine trajectory based on risk level
    let phq9Start: number, gad7Start: number;
    let phq9Trend: number, gad7Trend: number; // negative = improving

    if (patient.risk_level === "high") {
      phq9Start = 18 + Math.floor(seededRandom() * 6); // 18-23
      gad7Start = 15 + Math.floor(seededRandom() * 5); // 15-19
      phq9Trend = seededRandom() > 0.3 ? -1 : 1; // 70% improving, 30% worsening
      gad7Trend = seededRandom() > 0.3 ? -1 : 1;
    } else if (patient.risk_level === "medium") {
      phq9Start = 12 + Math.floor(seededRandom() * 5); // 12-16
      gad7Start = 10 + Math.floor(seededRandom() * 5); // 10-14
      phq9Trend = seededRandom() > 0.2 ? -1 : 0.5; // 80% improving
      gad7Trend = seededRandom() > 0.2 ? -1 : 0.5;
    } else {
      phq9Start = 6 + Math.floor(seededRandom() * 5); // 6-10
      gad7Start = 5 + Math.floor(seededRandom() * 5); // 5-9
      phq9Trend = -0.5; // Gradual improvement
      gad7Trend = -0.5;
    }

    for (let i = 0; i < numMeasurements; i++) {
      const measureDate = new Date(treatmentStart);
      measureDate.setMonth(
        measureDate.getMonth() + Math.floor((i / numMeasurements) * monthsInTreatment)
      );

      const phq9Score = Math.max(
        0,
        Math.min(27, Math.round(phq9Start + phq9Trend * i * 2 + (seededRandom() * 2 - 1)))
      );
      const gad7Score = Math.max(
        0,
        Math.min(21, Math.round(gad7Start + gad7Trend * i * 2 + (seededRandom() * 2 - 1)))
      );

      measures.push({
        id: `om-${String(measureId++).padStart(5, "0")}`,
        patient_id: patient.id,
        measure_type: "PHQ-9",
        score: phq9Score,
        max_score: 27,
        measurement_date: measureDate.toISOString().split("T")[0]!,
        administered_by: "Dr. Demo",
      });

      measures.push({
        id: `om-${String(measureId++).padStart(5, "0")}`,
        patient_id: patient.id,
        measure_type: "GAD-7",
        score: gad7Score,
        max_score: 21,
        measurement_date: measureDate.toISOString().split("T")[0]!,
        administered_by: "Dr. Demo",
      });

      // PCL-5 only for PTSD patients
      if (patient.primary_diagnosis_code === "F43.10") {
        const pcl5Score = Math.max(0, Math.min(80, 45 + Math.floor(seededRandom() * 20) - i * 5));
        measures.push({
          id: `om-${String(measureId++).padStart(5, "0")}`,
          patient_id: patient.id,
          measure_type: "PCL-5",
          score: pcl5Score,
          max_score: 80,
          measurement_date: measureDate.toISOString().split("T")[0]!,
          administered_by: "Dr. Demo",
        });
      }
    }
  });

  return measures.sort((a, b) => a.measurement_date.localeCompare(b.measurement_date));
}

export const SYNTHETIC_OUTCOME_MEASURES = generateOutcomeMeasures();
export default SYNTHETIC_OUTCOME_MEASURES;
