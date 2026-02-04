/**
 * Synthetic Message Threads for Communications Page
 */

import { SYNTHETIC_PATIENTS } from "./synthetic-patients";

export interface Message {
  id: string;
  patient_id: string;
  direction: "inbound" | "outbound";
  channel: "sms" | "email" | "portal";
  content: string;
  timestamp: string;
  read: boolean;
}

const inboundTemplates = [
  "Hi, I need to reschedule my appointment this week. Is there anything available on Friday?",
  "Thank you for the session today. I've been thinking about what we discussed.",
  "I'm feeling really anxious today. Can we talk about coping strategies at our next session?",
  "Just wanted to let you know the breathing exercises have been helping a lot!",
  "I had a rough weekend but I used the techniques we practiced.",
  "Is it okay if I bring my partner to the next session?",
  "Do you have any recommendations for books about managing anxiety?",
  "I think I need to increase my session frequency. Can we discuss?",
  "The medication adjustment seems to be working better now.",
  "I completed the homework assignment you gave me. Looking forward to discussing.",
];

const outboundTemplates = [
  "Of course! I have openings Friday at 10am or 2pm. Which works better for you?",
  "I'm glad to hear that. Remember, progress isn't always linear. You're doing great work.",
  "Let's definitely discuss that. In the meantime, try the 4-7-8 breathing technique.",
  "That's wonderful to hear! Keep up the great work with your practice.",
  "I'm proud of you for using your coping skills. We'll process this together.",
  "Absolutely, couples sessions can be very beneficial. We can arrange that.",
  "I'd recommend 'The Anxiety and Phobia Workbook' - it's an excellent resource.",
  "Yes, let's discuss that at your next session. I can see you twice weekly if needed.",
  "Great news! Let's continue monitoring and adjust as needed.",
  "Excellent work! I look forward to hearing about your experience with it.",
];

// Seeded random for consistency
let seed = 67890;
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function generateMessages(): Message[] {
  const messages: Message[] = [];
  let messageId = 1;

  // Generate message threads for first 30 patients (most active)
  SYNTHETIC_PATIENTS.slice(0, 30).forEach((patient) => {
    const numMessages = 3 + Math.floor(seededRandom() * 8); // 3-10 messages per patient
    const threadStart = new Date();
    threadStart.setDate(threadStart.getDate() - Math.floor(seededRandom() * 30)); // Within last 30 days

    for (let i = 0; i < numMessages; i++) {
      const isInbound = i % 2 === 0;
      const messageTime = new Date(threadStart);
      messageTime.setHours(messageTime.getHours() + i * (2 + Math.floor(seededRandom() * 24)));

      messages.push({
        id: `msg-${String(messageId++).padStart(5, "0")}`,
        patient_id: patient.id,
        direction: isInbound ? "inbound" : "outbound",
        channel: seededRandom() > 0.3 ? "sms" : "email",
        content: isInbound
          ? inboundTemplates[Math.floor(seededRandom() * inboundTemplates.length)]!
          : outboundTemplates[Math.floor(seededRandom() * outboundTemplates.length)]!,
        timestamp: messageTime.toISOString(),
        read: messageTime < new Date(Date.now() - 86400000), // Read if older than 1 day
      });
    }
  });

  // Add some unread recent messages for demo
  const recentPatients = SYNTHETIC_PATIENTS.slice(0, 5);
  recentPatients.forEach((patient, i) => {
    const recentTime = new Date();
    recentTime.setHours(recentTime.getHours() - (i + 1));

    messages.push({
      id: `msg-${String(messageId++).padStart(5, "0")}`,
      patient_id: patient.id,
      direction: "inbound",
      channel: "sms",
      content: inboundTemplates[i]!,
      timestamp: recentTime.toISOString(),
      read: false,
    });
  });

  return messages.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export const SYNTHETIC_MESSAGES = generateMessages();
export default SYNTHETIC_MESSAGES;
