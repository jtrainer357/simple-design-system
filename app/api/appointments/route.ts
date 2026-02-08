/**
 * POST /api/appointments - Create appointment
 * GET /api/appointments - List appointments
 * Agent: GAMMA
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createLogger } from "@/src/lib/logger";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { v4 as uuidv4 } from "uuid";
import { addWeeks, addMonths, parse, format } from "date-fns";
import type { AppointmentReminderInsert } from "@/src/lib/supabase/scheduling-types";

const log = createLogger("api/appointments");

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = (hours ?? 0) * 60 + (minutes ?? 0) + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}:00`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const practiceId = DEMO_PRACTICE_ID;

    const {
      patientId,
      date,
      startTime,
      duration,
      appointmentType,
      cptCode,
      format: appointmentFormat,
      room,
      notes,
      recurring,
      skipConflictCheck,
    } = body;

    if (!patientId || !date || !startTime || !duration || !appointmentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startTimeFormatted = startTime.includes(":")
      ? startTime.length === 5
        ? `${startTime}:00`
        : startTime
      : `${startTime}:00:00`;
    const endTime = calculateEndTime(startTimeFormatted, duration);

    if (!skipConflictCheck) {
      const { data: conflicts } = await supabase
        .from("appointments")
        .select(`id, date, start_time, end_time, patient:patients(first_name, last_name)`)
        .eq("practice_id", practiceId)
        .eq("date", date)
        .not("status", "in", '("Cancelled","No-Show")')
        .or(`and(start_time.lt.${endTime},end_time.gt.${startTimeFormatted})`);
      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          {
            error: "Conflict detected",
            conflicts: conflicts.map((c) => ({
              id: c.id,
              patientName: c.patient
                ? `${(c.patient as { first_name: string }).first_name} ${(c.patient as { last_name: string }).last_name}`
                : "Unknown",
              date: c.date,
              startTime: c.start_time,
              endTime: c.end_time,
            })),
          },
          { status: 409 }
        );
      }
    }

    const recurringGroupId = recurring ? uuidv4() : null;
    const appointmentData = {
      practice_id: practiceId,
      patient_id: patientId,
      date,
      start_time: startTimeFormatted,
      end_time: endTime,
      duration_minutes: duration,
      status: "Scheduled" as const,
      service_type: appointmentType,
      cpt_code: cptCode || null,
      appointment_type: appointmentType,
      format: appointmentFormat,
      room: room || null,
      notes: notes || null,
      recurring_group_id: recurringGroupId,
      recurring_pattern: recurring?.pattern || null,
    };

    const { data: mainAppointment, error: mainError } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select()
      .single();
    if (mainError) {
      log.error("Failed to create appointment", mainError, { patientId, date });
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }

    // Create reminders
    const appointmentDateTime = parse(
      `${date} ${startTimeFormatted}`,
      "yyyy-MM-dd HH:mm:ss",
      new Date()
    );
    const reminder24h = new Date(appointmentDateTime);
    reminder24h.setHours(reminder24h.getHours() - 24);
    const reminder2h = new Date(appointmentDateTime);
    reminder2h.setHours(reminder2h.getHours() - 2);
    const reminders: AppointmentReminderInsert[] = [
      {
        practice_id: practiceId,
        appointment_id: mainAppointment.id,
        reminder_type: "24h",
        scheduled_at: reminder24h.toISOString(),
        channel: "email",
        status: "pending",
      },
      {
        practice_id: practiceId,
        appointment_id: mainAppointment.id,
        reminder_type: "2h",
        scheduled_at: reminder2h.toISOString(),
        channel: "email",
        status: "pending",
      },
    ];
    await supabase.from("appointment_reminders").insert(reminders);

    const allAppointments = [mainAppointment];
    if (recurring) {
      const dates: string[] = [];
      let currentDate = new Date(date);
      for (let i = 1; i < Math.min(recurring.occurrences || 52, 52); i++) {
        switch (recurring.pattern) {
          case "weekly":
            currentDate = addWeeks(currentDate, 1);
            break;
          case "biweekly":
            currentDate = addWeeks(currentDate, 2);
            break;
          case "monthly":
            currentDate = addMonths(currentDate, 1);
            break;
        }
        if (recurring.endDate && currentDate > new Date(recurring.endDate)) break;
        dates.push(format(currentDate, "yyyy-MM-dd"));
      }

      for (const futureDate of dates) {
        const recurringAppt = { ...appointmentData, date: futureDate };
        const { data: recurringData, error: recurringError } = await supabase
          .from("appointments")
          .insert(recurringAppt)
          .select()
          .single();
        if (!recurringError && recurringData) {
          allAppointments.push(recurringData);
          const futureDateTime = parse(
            `${futureDate} ${startTimeFormatted}`,
            "yyyy-MM-dd HH:mm:ss",
            new Date()
          );
          const fr24h = new Date(futureDateTime);
          fr24h.setHours(fr24h.getHours() - 24);
          const fr2h = new Date(futureDateTime);
          fr2h.setHours(fr2h.getHours() - 2);
          await supabase.from("appointment_reminders").insert([
            {
              practice_id: practiceId,
              appointment_id: recurringData.id,
              reminder_type: "24h",
              scheduled_at: fr24h.toISOString(),
              channel: "email",
              status: "pending",
            },
            {
              practice_id: practiceId,
              appointment_id: recurringData.id,
              reminder_type: "2h",
              scheduled_at: fr2h.toISOString(),
              channel: "email",
              status: "pending",
            },
          ]);
        }
      }
    }

    log.info("Appointments created", { count: allAppointments.length, mainId: mainAppointment.id });
    return NextResponse.json({
      appointment: mainAppointment,
      allAppointments,
      count: allAppointments.length,
    });
  } catch (error: unknown) {
    log.error("Failed to create appointment", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const practiceId = DEMO_PRACTICE_ID;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    let query = supabase
      .from("appointments")
      .select(
        `*, patient:patients(id, first_name, last_name, avatar_url, phone_mobile, risk_level, date_of_birth)`
      )
      .eq("practice_id", practiceId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);
    if (patientId) query = query.eq("patient_id", patientId);
    if (status)
      query = query.eq("status", status as "Scheduled" | "Completed" | "No-Show" | "Cancelled");

    const { data, error } = await query;
    if (error) {
      log.error("Failed to fetch appointments", error, { practiceId });
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }

    return NextResponse.json({ appointments: data || [] });
  } catch (error: unknown) {
    log.error("Failed to fetch appointments", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
