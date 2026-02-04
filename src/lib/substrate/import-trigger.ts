/**
 * Substrate Import Trigger
 * Generates initial tasks for newly imported patients.
 *
 * AGENT BETA: This module creates 2-3 initial tasks per imported patient.
 */

export interface SubstrateTask {
  id: string;
  practice_id: string;
  patient_id: string | null;
  task_type: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "dismissed";
  due_date: string;
  metadata: {
    icon?: string;
    source?: string;
    confidence?: number;
    import_batch_id?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

interface ImportedPatient {
  id: string;
  first_name: string;
  last_name: string;
  practice_id: string;
}

/**
 * Generates 2-3 initial substrate tasks for a newly imported patient.
 */
export function generateSubstrateTasksForNewPatient(
  patient: ImportedPatient,
  importBatchId: string
): SubstrateTask[] {
  const now = new Date();
  const tasks: SubstrateTask[] = [];

  // Task 1: Complete intake assessment (high priority, due in 3 days)
  tasks.push({
    id: crypto.randomUUID(),
    practice_id: patient.practice_id,
    patient_id: patient.id,
    task_type: "intake_assessment",
    title: `Complete intake assessment for ${patient.first_name} ${patient.last_name}`,
    description: `New patient imported from previous EHR system. Complete intake assessment and verify all information is accurate.`,
    priority: "high",
    status: "pending",
    due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      icon: "clipboard-list",
      source: "import_trigger",
      confidence: 0.95,
      import_batch_id: importBatchId,
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  // Task 2: Verify contact info (medium priority, due in 5 days)
  tasks.push({
    id: crypto.randomUUID(),
    practice_id: patient.practice_id,
    patient_id: patient.id,
    task_type: "contact_verification",
    title: `Verify contact info for ${patient.first_name} ${patient.last_name}`,
    description: `Confirm phone number and email address are current. Send welcome message to verify patient can receive communications.`,
    priority: "medium",
    status: "pending",
    due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      icon: "phone",
      source: "import_trigger",
      confidence: 0.9,
      import_batch_id: importBatchId,
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  // Task 3: Verify insurance (medium priority, due in 7 days)
  tasks.push({
    id: crypto.randomUUID(),
    practice_id: patient.practice_id,
    patient_id: patient.id,
    task_type: "insurance_verification",
    title: `Verify insurance for ${patient.first_name} ${patient.last_name}`,
    description: `Confirm insurance information is current and verify eligibility. Update insurance details if needed.`,
    priority: "medium",
    status: "pending",
    due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      icon: "shield-check",
      source: "import_trigger",
      confidence: 0.88,
      import_batch_id: importBatchId,
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  return tasks;
}

/**
 * Generates a practice-level summary task after batch import completes.
 */
export function generateImportSummaryActions(
  practiceId: string,
  importBatchId: string,
  importedCount: number
): SubstrateTask {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    practice_id: practiceId,
    patient_id: null,
    task_type: "import_review",
    title: `Review ${importedCount} imported patients from batch import`,
    description: `Batch import completed successfully. Review imported patient records for accuracy and completeness. Follow up on any flagged issues.`,
    priority: "high",
    status: "pending",
    due_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      icon: "users",
      source: "import_trigger",
      confidence: 1.0,
      import_batch_id: importBatchId,
      imported_count: importedCount,
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

/**
 * Generates all tasks for a batch import operation.
 */
export function generateAllImportTasks(
  patients: ImportedPatient[],
  practiceId: string,
  importBatchId: string
): SubstrateTask[] {
  const allTasks: SubstrateTask[] = [];

  // Generate per-patient tasks
  for (const patient of patients) {
    const patientTasks = generateSubstrateTasksForNewPatient(patient, importBatchId);
    allTasks.push(...patientTasks);
  }

  // Generate practice-level summary task
  const summaryTask = generateImportSummaryActions(practiceId, importBatchId, patients.length);
  allTasks.push(summaryTask);

  return allTasks;
}
