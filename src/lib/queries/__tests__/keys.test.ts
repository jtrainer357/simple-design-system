/**
 * Query Keys Tests
 * Ensures query keys are properly structured for caching and invalidation
 */

import { describe, it, expect } from "vitest";
import {
  patientKeys,
  appointmentKeys,
  priorityActionKeys,
  billingKeys,
  communicationKeys,
  practiceKeys,
  outcomeKeys,
  reviewKeys,
  queryKeys,
} from "../keys";

describe("Query Keys", () => {
  describe("patientKeys", () => {
    it("creates unique keys for different patients", () => {
      const key1 = patientKeys.detail("patient-123");
      const key2 = patientKeys.detail("patient-456");

      expect(key1).not.toEqual(key2);
      expect(key1).toContain("patient-123");
      expect(key2).toContain("patient-456");
    });

    it("nests detail keys under all patients key", () => {
      const allKey = patientKeys.all;
      const detailKey = patientKeys.detail("patient-123");

      // Detail key should start with the "all" key
      expect(detailKey[0]).toBe(allKey[0]);
      expect(detailKey).toContain("detail");
    });

    it("creates list keys for specific practices", () => {
      const practiceList1 = patientKeys.list("practice-a");
      const practiceList2 = patientKeys.list("practice-b");

      expect(practiceList1).not.toEqual(practiceList2);
      expect(practiceList1).toContain("list");
      expect(practiceList1).toContain("practice-a");
    });

    it("creates search keys with query string and practice", () => {
      const searchKey = patientKeys.search("john", "practice-123");

      expect(searchKey).toContain("search");
      expect(searchKey).toContain("john");
      expect(searchKey).toContain("practice-123");
    });

    it("creates high-risk patient keys by practice", () => {
      const key = patientKeys.highRisk("practice-123");

      expect(key).toContain("high-risk");
      expect(key).toContain("practice-123");
    });

    it("creates patient-specific nested keys", () => {
      const appointmentsKey = patientKeys.appointments("patient-123");
      const messagesKey = patientKeys.messages("patient-123");
      const invoicesKey = patientKeys.invoices("patient-123");

      expect(appointmentsKey).toContain("appointments");
      expect(messagesKey).toContain("messages");
      expect(invoicesKey).toContain("invoices");

      // All should contain the patient detail prefix
      expect(appointmentsKey).toContain("patient-123");
      expect(messagesKey).toContain("patient-123");
      expect(invoicesKey).toContain("patient-123");
    });
  });

  describe("appointmentKeys", () => {
    it("creates appointment keys by date", () => {
      const date1 = appointmentKeys.byDate("2024-02-06");
      const date2 = appointmentKeys.byDate("2024-02-07");

      expect(date1).not.toEqual(date2);
      expect(date1).toContain("date");
      expect(date1).toContain("2024-02-06");
    });

    it("creates appointment keys by patient", () => {
      const patientKey = appointmentKeys.byPatient("patient-123");

      expect(patientKey).toContain("patient");
      expect(patientKey).toContain("patient-123");
    });

    it("creates today appointment keys", () => {
      const todayKey = appointmentKeys.today("practice-123");

      expect(todayKey).toContain("today");
      expect(todayKey).toContain("practice-123");
    });

    it("creates upcoming appointment keys with days parameter", () => {
      const upcomingKey = appointmentKeys.upcoming("practice-123", 7);

      expect(upcomingKey).toContain("upcoming");
      expect(upcomingKey).toContain("practice-123");
      expect(upcomingKey).toContain(7);
    });

    it("creates recent appointment keys", () => {
      const recentKey = appointmentKeys.recent("practice-123", 30);

      expect(recentKey).toContain("recent");
      expect(recentKey).toContain("practice-123");
      expect(recentKey).toContain(30);
    });

    it("creates stats keys for practice", () => {
      const statsKey = appointmentKeys.stats("practice-123");

      expect(statsKey).toContain("stats");
      expect(statsKey).toContain("practice-123");
    });
  });

  describe("priorityActionKeys", () => {
    it("creates list keys by practice", () => {
      const listKey = priorityActionKeys.list("practice-123");

      expect(listKey).toContain("list");
      expect(listKey).toContain("practice-123");
    });

    it("creates keys by patient", () => {
      const patientKey = priorityActionKeys.byPatient("patient-123");

      expect(patientKey).toContain("patient");
      expect(patientKey).toContain("patient-123");
    });

    it("creates count keys by practice", () => {
      const countsKey = priorityActionKeys.counts("practice-123");

      expect(countsKey).toContain("counts");
      expect(countsKey).toContain("practice-123");
    });
  });

  describe("billingKeys", () => {
    it("creates invoice keys by patient", () => {
      const invoiceKey = billingKeys.invoicesByPatient("patient-123");

      expect(invoiceKey).toContain("invoices");
      expect(invoiceKey).toContain("patient");
      expect(invoiceKey).toContain("patient-123");
    });

    it("creates invoice list keys by practice", () => {
      const listKey = billingKeys.invoiceList("practice-123");

      expect(listKey).toContain("invoices");
      expect(listKey).toContain("practice-123");
    });

    it("creates outstanding invoices key", () => {
      const outstandingKey = billingKeys.outstanding("practice-123");

      expect(outstandingKey).toContain("outstanding");
      expect(outstandingKey).toContain("practice-123");
    });

    it("creates billing summary key", () => {
      const summaryKey = billingKeys.summary("practice-123");

      expect(summaryKey).toContain("summary");
      expect(summaryKey).toContain("practice-123");
    });

    it("creates date range keys", () => {
      const dateRangeKey = billingKeys.byDateRange("practice-123", "2024-01-01", "2024-01-31");

      expect(dateRangeKey).toContain("dateRange");
      expect(dateRangeKey).toContain("practice-123");
      expect(dateRangeKey).toContain("2024-01-01");
      expect(dateRangeKey).toContain("2024-01-31");
    });
  });

  describe("communicationKeys", () => {
    it("creates list keys by practice", () => {
      const listKey = communicationKeys.list("practice-123");

      expect(listKey).toContain("list");
      expect(listKey).toContain("practice-123");
    });

    it("creates message keys by patient", () => {
      const messageKey = communicationKeys.byPatient("patient-123");

      expect(messageKey).toContain("patient");
      expect(messageKey).toContain("patient-123");
    });

    it("creates unread count keys by practice", () => {
      const unreadKey = communicationKeys.unreadCount("practice-123");

      expect(unreadKey).toContain("unread");
      expect(unreadKey).toContain("practice-123");
    });

    it("creates threads keys by practice", () => {
      const threadsKey = communicationKeys.threads("practice-123");

      expect(threadsKey).toContain("threads");
      expect(threadsKey).toContain("practice-123");
    });
  });

  describe("practiceKeys", () => {
    it("creates practice detail keys", () => {
      const detailKey = practiceKeys.detail("practice-123");

      expect(detailKey).toContain("practice-123");
    });

    it("creates demo practice keys", () => {
      const demoKey = practiceKeys.demo();

      expect(demoKey).toContain("demo");
    });

    it("creates dashboard stats keys", () => {
      const statsKey = practiceKeys.dashboardStats("practice-123");

      expect(statsKey).toContain("dashboardStats");
      expect(statsKey).toContain("practice-123");
    });

    it("creates isPopulated keys", () => {
      const populatedKey = practiceKeys.isPopulated("practice-123");

      expect(populatedKey).toContain("isPopulated");
      expect(populatedKey).toContain("practice-123");
    });
  });

  describe("outcomeKeys", () => {
    it("creates outcome keys by patient", () => {
      const patientKey = outcomeKeys.byPatient("patient-123");

      expect(patientKey).toContain("patient");
      expect(patientKey).toContain("patient-123");
    });

    it("creates trend keys by patient", () => {
      const trendKey = outcomeKeys.trends("patient-123");

      expect(trendKey).toContain("trends");
      expect(trendKey).toContain("patient-123");
    });
  });

  describe("reviewKeys", () => {
    it("creates list keys by practice", () => {
      const listKey = reviewKeys.list("practice-123");

      expect(listKey).toContain("list");
      expect(listKey).toContain("practice-123");
    });

    it("creates keys by patient", () => {
      const patientKey = reviewKeys.byPatient("patient-123");

      expect(patientKey).toContain("patient");
      expect(patientKey).toContain("patient-123");
    });

    it("creates keys by type", () => {
      const typeKey = reviewKeys.byType("practice-123", "google");

      expect(typeKey).toContain("type");
      expect(typeKey).toContain("practice-123");
      expect(typeKey).toContain("google");
    });

    it("creates average rating keys", () => {
      const ratingKey = reviewKeys.averageRating("practice-123");

      expect(ratingKey).toContain("averageRating");
      expect(ratingKey).toContain("practice-123");
    });

    it("creates recent keys with limit", () => {
      const recentKey = reviewKeys.recent("practice-123", 10);

      expect(recentKey).toContain("recent");
      expect(recentKey).toContain("practice-123");
      expect(recentKey).toContain(10);
    });
  });

  describe("key hierarchy", () => {
    it("all keys start with their domain", () => {
      expect(patientKeys.all[0]).toBe("patients");
      expect(appointmentKeys.all[0]).toBe("appointments");
      expect(priorityActionKeys.all[0]).toBe("priority-actions");
      expect(billingKeys.all[0]).toBe("billing");
      expect(communicationKeys.all[0]).toBe("communications");
      expect(practiceKeys.all[0]).toBe("practice");
      expect(outcomeKeys.all[0]).toBe("outcomes");
      expect(reviewKeys.all[0]).toBe("reviews");
    });

    it("derived keys maintain parent hierarchy", () => {
      // Patient keys hierarchy
      const patientListKey = patientKeys.list("practice-1");
      expect(patientListKey[0]).toBe("patients");
      expect(patientListKey[1]).toBe("list");

      // Appointment keys hierarchy
      const appointmentDateKey = appointmentKeys.byDate("2024-02-06");
      expect(appointmentDateKey[0]).toBe("appointments");
      expect(appointmentDateKey[1]).toBe("list");
      expect(appointmentDateKey[2]).toBe("date");
    });
  });

  describe("queryKeys combined export", () => {
    it("exports all key factories", () => {
      expect(queryKeys.patients).toBe(patientKeys);
      expect(queryKeys.appointments).toBe(appointmentKeys);
      expect(queryKeys.priorityActions).toBe(priorityActionKeys);
      expect(queryKeys.billing).toBe(billingKeys);
      expect(queryKeys.communications).toBe(communicationKeys);
      expect(queryKeys.practice).toBe(practiceKeys);
      expect(queryKeys.outcomes).toBe(outcomeKeys);
      expect(queryKeys.reviews).toBe(reviewKeys);
    });
  });
});
