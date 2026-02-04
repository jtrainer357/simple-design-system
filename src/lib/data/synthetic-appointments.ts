/**
 * 200+ Synthetic Appointments
 * Past, TODAY, and Future appointments for realistic schedule
 */

import { SYNTHETIC_PATIENTS } from "./synthetic-patients";

export interface SyntheticAppointment {
  id: string;
  patient_id: string;
  patient_name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM (24h)
  end_time: string;
  duration_minutes: number;
  status: "Completed" | "Scheduled" | "No-Show" | "Cancelled";
  service_type: string;
  cpt_code: string;
  location: string;
  notes?: string;
}

const serviceTypes = [
  { name: "Individual Therapy (45 min)", cpt: "90834", duration: 45 },
  { name: "Individual Therapy (60 min)", cpt: "90837", duration: 60 },
  { name: "Initial Evaluation", cpt: "90791", duration: 60 },
  { name: "Crisis Session", cpt: "90839", duration: 60 },
];

const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

// Seeded random for consistency
let seed = 12345;
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function generateAppointments(): SyntheticAppointment[] {
  const appointments: SyntheticAppointment[] = [];
  let appointmentId = 1;

  // PAST APPOINTMENTS (last 6 months)
  for (let daysAgo = 180; daysAgo > 0; daysAgo -= 1) {
    if (seededRandom() > 0.3) continue; // Skip ~70% of days

    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0]!;

    // 3-6 appointments per day
    const numAppts = 3 + Math.floor(seededRandom() * 4);
    const usedSlots: string[] = [];

    for (let i = 0; i < numAppts; i++) {
      const patient = SYNTHETIC_PATIENTS[Math.floor(seededRandom() * SYNTHETIC_PATIENTS.length)]!;
      const service = serviceTypes[Math.floor(seededRandom() * serviceTypes.length)]!;
      let timeSlot = timeSlots[Math.floor(seededRandom() * timeSlots.length)]!;
      let attempts = 0;
      while (usedSlots.includes(timeSlot) && attempts < 10) {
        timeSlot = timeSlots[Math.floor(seededRandom() * timeSlots.length)]!;
        attempts++;
      }
      if (usedSlots.includes(timeSlot)) continue;
      usedSlots.push(timeSlot);

      const [hours, mins] = timeSlot.split(":").map(Number);
      const endHours = hours! + Math.floor((mins! + service.duration) / 60);
      const endMins = (mins! + service.duration) % 60;

      // 5% no-show rate, 3% cancelled
      let status: SyntheticAppointment["status"] = "Completed";
      const rand = seededRandom();
      if (rand < 0.05) status = "No-Show";
      else if (rand < 0.08) status = "Cancelled";

      appointments.push({
        id: `apt-${String(appointmentId++).padStart(5, "0")}`,
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        date: dateStr,
        start_time: timeSlot,
        end_time: `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`,
        duration_minutes: service.duration,
        status,
        service_type: service.name,
        cpt_code: service.cpt,
        location: "Main Office",
      });
    }
  }

  // TODAY'S APPOINTMENTS (8 appointments for demo)
  const today = new Date().toISOString().split("T")[0]!;
  const todayPatients = SYNTHETIC_PATIENTS.slice(0, 8);
  const todaySlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  todayPatients.forEach((patient, i) => {
    const service = serviceTypes[i % 2]!; // Alternate 45/60 min
    const timeSlot = todaySlots[i]!;
    const [hours, mins] = timeSlot.split(":").map(Number);
    const endHours = hours! + Math.floor((mins! + service.duration) / 60);
    const endMins = (mins! + service.duration) % 60;

    appointments.push({
      id: `apt-${String(appointmentId++).padStart(5, "0")}`,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      date: today,
      start_time: timeSlot,
      end_time: `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`,
      duration_minutes: service.duration,
      status: i < 3 ? "Completed" : "Scheduled", // First 3 done, rest upcoming
      service_type: service.name,
      cpt_code: service.cpt,
      location: "Main Office",
    });
  });

  // FUTURE APPOINTMENTS (next 2 weeks)
  for (let daysAhead = 1; daysAhead <= 14; daysAhead++) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split("T")[0]!;
    const numAppts = 4 + Math.floor(seededRandom() * 4);
    const usedSlots: string[] = [];

    for (let i = 0; i < numAppts; i++) {
      const patient = SYNTHETIC_PATIENTS[Math.floor(seededRandom() * SYNTHETIC_PATIENTS.length)]!;
      const service = serviceTypes[Math.floor(seededRandom() * serviceTypes.length)]!;
      let timeSlot = timeSlots[Math.floor(seededRandom() * timeSlots.length)]!;
      let attempts = 0;
      while (usedSlots.includes(timeSlot) && attempts < 10) {
        timeSlot = timeSlots[Math.floor(seededRandom() * timeSlots.length)]!;
        attempts++;
      }
      if (usedSlots.includes(timeSlot)) continue;
      usedSlots.push(timeSlot);

      const [hours, mins] = timeSlot.split(":").map(Number);
      const endHours = hours! + Math.floor((mins! + service.duration) / 60);
      const endMins = (mins! + service.duration) % 60;

      appointments.push({
        id: `apt-${String(appointmentId++).padStart(5, "0")}`,
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        date: dateStr,
        start_time: timeSlot,
        end_time: `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`,
        duration_minutes: service.duration,
        status: "Scheduled",
        service_type: service.name,
        cpt_code: service.cpt,
        location: "Main Office",
      });
    }
  }

  return appointments.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.start_time.localeCompare(b.start_time);
  });
}

export const SYNTHETIC_APPOINTMENTS = generateAppointments();
export default SYNTHETIC_APPOINTMENTS;
