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

const generatedMeasures = generateOutcomeMeasures();

// ============================================================================
// COMPREHENSIVE DEMO PATIENT OUTCOME MEASURES
// Specific trajectories matching clinical narratives
// ============================================================================

const DEMO_OUTCOME_MEASURES: OutcomeMeasure[] = [
  // RACHEL TORRES - Depression Recovery (PHQ-9: 18 -> 14 -> 10 -> 7 -> 5 -> 5)
  // Also GAD-7 for comorbid anxiety
  {
    id: "om-demo-rachel-001",
    patient_id: "rachel-torres-demo",
    measure_type: "PHQ-9",
    score: 18,
    max_score: 27,
    measurement_date: "2025-06-22",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-002",
    patient_id: "rachel-torres-demo",
    measure_type: "GAD-7",
    score: 12,
    max_score: 21,
    measurement_date: "2025-06-22",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-003",
    patient_id: "rachel-torres-demo",
    measure_type: "PHQ-9",
    score: 14,
    max_score: 27,
    measurement_date: "2025-07-20",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-004",
    patient_id: "rachel-torres-demo",
    measure_type: "GAD-7",
    score: 10,
    max_score: 21,
    measurement_date: "2025-07-20",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-005",
    patient_id: "rachel-torres-demo",
    measure_type: "PHQ-9",
    score: 10,
    max_score: 27,
    measurement_date: "2025-09-14",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-006",
    patient_id: "rachel-torres-demo",
    measure_type: "GAD-7",
    score: 8,
    max_score: 21,
    measurement_date: "2025-09-14",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-007",
    patient_id: "rachel-torres-demo",
    measure_type: "PHQ-9",
    score: 7,
    max_score: 27,
    measurement_date: "2025-10-26",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-008",
    patient_id: "rachel-torres-demo",
    measure_type: "GAD-7",
    score: 6,
    max_score: 21,
    measurement_date: "2025-10-26",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-009",
    patient_id: "rachel-torres-demo",
    measure_type: "PHQ-9",
    score: 5,
    max_score: 27,
    measurement_date: "2025-12-07",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-010",
    patient_id: "rachel-torres-demo",
    measure_type: "GAD-7",
    score: 5,
    max_score: 21,
    measurement_date: "2025-12-07",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-011",
    patient_id: "rachel-torres-demo",
    measure_type: "PHQ-9",
    score: 5,
    max_score: 27,
    measurement_date: "2026-01-26",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-rachel-012",
    patient_id: "rachel-torres-demo",
    measure_type: "GAD-7",
    score: 4,
    max_score: 21,
    measurement_date: "2026-01-26",
    administered_by: "Dr. Demo",
  },

  // JAMES OKAFOR - PTSD Treatment (PCL-5: 58 -> 52 -> 44 -> 38 -> 32)
  // Also PHQ-9 for comorbid depression
  {
    id: "om-demo-james-001",
    patient_id: "james-okafor-demo",
    measure_type: "PCL-5",
    score: 58,
    max_score: 80,
    measurement_date: "2025-04-17",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-002",
    patient_id: "james-okafor-demo",
    measure_type: "PHQ-9",
    score: 14,
    max_score: 27,
    measurement_date: "2025-04-17",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-003",
    patient_id: "james-okafor-demo",
    measure_type: "PCL-5",
    score: 52,
    max_score: 80,
    measurement_date: "2025-06-12",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-004",
    patient_id: "james-okafor-demo",
    measure_type: "PHQ-9",
    score: 12,
    max_score: 27,
    measurement_date: "2025-06-12",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-005",
    patient_id: "james-okafor-demo",
    measure_type: "PCL-5",
    score: 44,
    max_score: 80,
    measurement_date: "2025-08-07",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-006",
    patient_id: "james-okafor-demo",
    measure_type: "PHQ-9",
    score: 10,
    max_score: 27,
    measurement_date: "2025-08-07",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-007",
    patient_id: "james-okafor-demo",
    measure_type: "PCL-5",
    score: 38,
    max_score: 80,
    measurement_date: "2025-11-20",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-008",
    patient_id: "james-okafor-demo",
    measure_type: "PHQ-9",
    score: 8,
    max_score: 27,
    measurement_date: "2025-11-20",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-009",
    patient_id: "james-okafor-demo",
    measure_type: "PCL-5",
    score: 32,
    max_score: 80,
    measurement_date: "2026-01-26",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-james-010",
    patient_id: "james-okafor-demo",
    measure_type: "PHQ-9",
    score: 7,
    max_score: 27,
    measurement_date: "2026-01-26",
    administered_by: "Dr. Demo",
  },

  // SOPHIA CHEN-MARTINEZ - Academic Anxiety (GAD-7: 16 -> 14 -> 12 -> 10 -> 8)
  {
    id: "om-demo-sophia-001",
    patient_id: "sophia-chen-martinez-demo",
    measure_type: "GAD-7",
    score: 16,
    max_score: 21,
    measurement_date: "2025-09-08",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-sophia-002",
    patient_id: "sophia-chen-martinez-demo",
    measure_type: "PHQ-9",
    score: 8,
    max_score: 27,
    measurement_date: "2025-09-08",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-sophia-003",
    patient_id: "sophia-chen-martinez-demo",
    measure_type: "GAD-7",
    score: 14,
    max_score: 21,
    measurement_date: "2025-10-06",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-sophia-004",
    patient_id: "sophia-chen-martinez-demo",
    measure_type: "GAD-7",
    score: 12,
    max_score: 21,
    measurement_date: "2025-11-03",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-sophia-005",
    patient_id: "sophia-chen-martinez-demo",
    measure_type: "GAD-7",
    score: 10,
    max_score: 21,
    measurement_date: "2025-12-01",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-sophia-006",
    patient_id: "sophia-chen-martinez-demo",
    measure_type: "GAD-7",
    score: 8,
    max_score: 21,
    measurement_date: "2026-01-12",
    administered_by: "Dr. Demo",
  },

  // MARCUS WASHINGTON - Bipolar II Stable (PHQ-9: 8 -> 6 -> 5 -> 4 -> 5 -> 4 -> 6 -> 4)
  {
    id: "om-demo-marcus-001",
    patient_id: "marcus-washington-demo",
    measure_type: "PHQ-9",
    score: 8,
    max_score: 27,
    measurement_date: "2024-12-02",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-marcus-002",
    patient_id: "marcus-washington-demo",
    measure_type: "PHQ-9",
    score: 6,
    max_score: 27,
    measurement_date: "2025-01-06",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-marcus-003",
    patient_id: "marcus-washington-demo",
    measure_type: "PHQ-9",
    score: 5,
    max_score: 27,
    measurement_date: "2025-02-03",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-marcus-004",
    patient_id: "marcus-washington-demo",
    measure_type: "PHQ-9",
    score: 4,
    max_score: 27,
    measurement_date: "2025-03-03",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-marcus-005",
    patient_id: "marcus-washington-demo",
    measure_type: "PHQ-9",
    score: 5,
    max_score: 27,
    measurement_date: "2025-05-05",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-marcus-006",
    patient_id: "marcus-washington-demo",
    measure_type: "PHQ-9",
    score: 4,
    max_score: 27,
    measurement_date: "2025-07-07",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-marcus-007",
    patient_id: "marcus-washington-demo",
    measure_type: "PHQ-9",
    score: 6,
    max_score: 27,
    measurement_date: "2025-09-08",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-marcus-008",
    patient_id: "marcus-washington-demo",
    measure_type: "PHQ-9",
    score: 4,
    max_score: 27,
    measurement_date: "2026-01-12",
    administered_by: "Dr. Demo",
  },

  // EMMA KOWALSKI - Bulimia Recovery (PHQ-9: 12 -> 10 -> 8 -> 6)
  {
    id: "om-demo-emma-001",
    patient_id: "emma-kowalski-demo",
    measure_type: "PHQ-9",
    score: 12,
    max_score: 27,
    measurement_date: "2025-04-01",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-emma-002",
    patient_id: "emma-kowalski-demo",
    measure_type: "PHQ-9",
    score: 10,
    max_score: 27,
    measurement_date: "2025-06-15",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-emma-003",
    patient_id: "emma-kowalski-demo",
    measure_type: "PHQ-9",
    score: 8,
    max_score: 27,
    measurement_date: "2025-09-22",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-emma-004",
    patient_id: "emma-kowalski-demo",
    measure_type: "PHQ-9",
    score: 6,
    max_score: 27,
    measurement_date: "2026-01-29",
    administered_by: "Dr. Demo",
  },

  // DAVID NAKAMURA - Work Stress (GAD-7: 14 -> 12 -> 10 -> 9)
  {
    id: "om-demo-david-001",
    patient_id: "david-nakamura-demo",
    measure_type: "GAD-7",
    score: 14,
    max_score: 21,
    measurement_date: "2025-10-08",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-david-002",
    patient_id: "david-nakamura-demo",
    measure_type: "GAD-7",
    score: 12,
    max_score: 21,
    measurement_date: "2025-11-05",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-david-003",
    patient_id: "david-nakamura-demo",
    measure_type: "GAD-7",
    score: 10,
    max_score: 21,
    measurement_date: "2025-12-03",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-david-004",
    patient_id: "david-nakamura-demo",
    measure_type: "GAD-7",
    score: 9,
    max_score: 21,
    measurement_date: "2026-01-28",
    administered_by: "Dr. Demo",
  },

  // AALIYAH BROOKS - Social Anxiety + Identity (GAD-7: 18 -> 15 -> 13 -> 11 -> 9)
  {
    id: "om-demo-aaliyah-001",
    patient_id: "aaliyah-brooks-demo",
    measure_type: "GAD-7",
    score: 18,
    max_score: 21,
    measurement_date: "2025-08-20",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-aaliyah-002",
    patient_id: "aaliyah-brooks-demo",
    measure_type: "PHQ-9",
    score: 9,
    max_score: 27,
    measurement_date: "2025-08-20",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-aaliyah-003",
    patient_id: "aaliyah-brooks-demo",
    measure_type: "GAD-7",
    score: 15,
    max_score: 21,
    measurement_date: "2025-09-17",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-aaliyah-004",
    patient_id: "aaliyah-brooks-demo",
    measure_type: "GAD-7",
    score: 13,
    max_score: 21,
    measurement_date: "2025-10-15",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-aaliyah-005",
    patient_id: "aaliyah-brooks-demo",
    measure_type: "GAD-7",
    score: 11,
    max_score: 21,
    measurement_date: "2025-11-05",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-aaliyah-006",
    patient_id: "aaliyah-brooks-demo",
    measure_type: "GAD-7",
    score: 9,
    max_score: 21,
    measurement_date: "2026-01-28",
    administered_by: "Dr. Demo",
  },

  // ROBERT FITZGERALD - Geriatric Grief (PHQ-9: 20 -> 16 -> 14 -> 11 -> 9)
  {
    id: "om-demo-robert-001",
    patient_id: "robert-fitzgerald-demo",
    measure_type: "PHQ-9",
    score: 20,
    max_score: 27,
    measurement_date: "2025-07-10",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-robert-002",
    patient_id: "robert-fitzgerald-demo",
    measure_type: "PHQ-9",
    score: 16,
    max_score: 27,
    measurement_date: "2025-08-21",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-robert-003",
    patient_id: "robert-fitzgerald-demo",
    measure_type: "PHQ-9",
    score: 14,
    max_score: 27,
    measurement_date: "2025-10-02",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-robert-004",
    patient_id: "robert-fitzgerald-demo",
    measure_type: "PHQ-9",
    score: 11,
    max_score: 27,
    measurement_date: "2025-11-13",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-robert-005",
    patient_id: "robert-fitzgerald-demo",
    measure_type: "PHQ-9",
    score: 9,
    max_score: 27,
    measurement_date: "2026-01-30",
    administered_by: "Dr. Demo",
  },

  // CARMEN ALVAREZ - Postpartum Depression (PHQ-9: 21 -> 18 -> 14 -> 11)
  // Also Edinburgh Postnatal tracked in notes but using PHQ-9 here
  {
    id: "om-demo-carmen-001",
    patient_id: "carmen-alvarez-demo",
    measure_type: "PHQ-9",
    score: 21,
    max_score: 27,
    measurement_date: "2025-11-10",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-carmen-002",
    patient_id: "carmen-alvarez-demo",
    measure_type: "GAD-7",
    score: 17,
    max_score: 21,
    measurement_date: "2025-11-10",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-carmen-003",
    patient_id: "carmen-alvarez-demo",
    measure_type: "PHQ-9",
    score: 18,
    max_score: 27,
    measurement_date: "2025-11-24",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-carmen-004",
    patient_id: "carmen-alvarez-demo",
    measure_type: "GAD-7",
    score: 14,
    max_score: 21,
    measurement_date: "2025-11-24",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-carmen-005",
    patient_id: "carmen-alvarez-demo",
    measure_type: "PHQ-9",
    score: 14,
    max_score: 27,
    measurement_date: "2025-12-15",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-carmen-006",
    patient_id: "carmen-alvarez-demo",
    measure_type: "GAD-7",
    score: 11,
    max_score: 21,
    measurement_date: "2025-12-15",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-carmen-007",
    patient_id: "carmen-alvarez-demo",
    measure_type: "PHQ-9",
    score: 11,
    max_score: 27,
    measurement_date: "2026-02-07",
    administered_by: "Dr. Demo",
  },
  {
    id: "om-demo-carmen-008",
    patient_id: "carmen-alvarez-demo",
    measure_type: "GAD-7",
    score: 9,
    max_score: 21,
    measurement_date: "2026-02-07",
    administered_by: "Dr. Demo",
  },
];

// Combine generated and demo measures
export const SYNTHETIC_OUTCOME_MEASURES = [...generatedMeasures, ...DEMO_OUTCOME_MEASURES].sort(
  (a, b) => a.measurement_date.localeCompare(b.measurement_date)
);

export default SYNTHETIC_OUTCOME_MEASURES;
