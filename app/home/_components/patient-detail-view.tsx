"use client";

import * as React from "react";
import {
  Calendar,
  Phone,
  Mail,
  Shield,
  MoreVertical,
  CalendarClock,
  DollarSign,
  Sparkles,
  Star,
  MessageCircle,
  Instagram,
  MessageSquare,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  Wand2,
  Smile,
  Send,
  Play,
} from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { PatientStatCard } from "@/design-system/components/ui/patient-stat-card";
import { AppointmentPreviewCard } from "@/design-system/components/ui/appointment-preview-card";
import { ActivityRow } from "@/design-system/components/ui/activity-row";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components/ui/tabs";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientStatus } from "@/design-system/components/ui/patient-list-card";
import {
  PriorityActionCard,
  type PriorityLevel,
  type ActionType,
} from "@/design-system/components/ui/priority-action-card";

const tabTriggerStyles =
  "rounded-none border-b-2 border-transparent bg-transparent shadow-none px-3 py-2 text-xl font-light text-foreground-strong whitespace-nowrap hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4";

export interface PriorityAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  priority: PriorityLevel;
  dueDate?: string;
  aiConfidence?: number;
}

export interface PatientMessage {
  id: string;
  channel: string;
  direction: string;
  sender: string | null;
  messageBody: string | null;
  isRead: boolean;
  sentAt: string | null;
}

export interface PatientInvoice {
  id: string;
  invoiceDate: string | null;
  dateOfService: string | null;
  description: string | null;
  chargeAmount: number;
  insurancePaid: number;
  patientPaid: number;
  balance: number;
  status: string;
}

export interface PatientOutcomeMeasure {
  id: string;
  measureType: string;
  score: number | null;
  measurementDate: string;
  notes: string | null;
}

export interface PatientReview {
  id: string;
  reviewerName: string | null;
  reviewType: string;
  rating: number;
  title: string;
  reviewText: string;
  reviewDate: string;
  isAnonymous: boolean;
}

export interface PatientDetail {
  id: string;
  name: string;
  status: PatientStatus;
  dob: string;
  age: number;
  phone: string;
  phoneExt?: string;
  email: string;
  insurance?: string;
  avatarSrc?: string;
  lastVisit: {
    date: string;
    type: string;
  };
  appointments: {
    total: number;
    dateRange: string;
  };
  balance: {
    amount: string;
    type: string;
  };
  upcomingAppointments: Array<{
    id: string;
    status:
      | "Scheduled"
      | "Confirmed"
      | "Checked In"
      | "In Progress"
      | "Completed"
      | "Cancelled"
      | "No-Show";
    date: string;
    time: string;
    type: string;
    provider: string;
  }>;
  allAppointments?: Array<{
    id: string;
    status: string;
    date: string;
    time: string;
    type: string;
    provider: string;
  }>;
  prioritizedActions?: PriorityAction[];
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
  messages?: PatientMessage[];
  invoices?: PatientInvoice[];
  outcomeMeasures?: PatientOutcomeMeasure[];
  reviews?: PatientReview[];
}

interface PatientDetailViewProps {
  patient: PatientDetail | null;
  className?: string;
}

// Channel tabs for messaging
const messageChannels = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "messenger", label: "Messenger", icon: MessageCircle },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
];

// Helper to parse voice message metadata
function parseVoiceMessage(
  messageBody: string | null
): { isVoice: boolean; duration: string } | null {
  if (!messageBody) return null;
  const match = messageBody.match(/^\[Voice message - (\d+:\d+)\]/);
  if (match && match[1]) {
    return { isVoice: true, duration: match[1] };
  }
  return null;
}

// Voice Message Bubble Component
function VoiceMessageBubble({ duration, isOutbound }: { duration: string; isOutbound: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
          isOutbound ? "bg-white/20 hover:bg-white/30" : "bg-gray-100 hover:bg-gray-200"
        )}
      >
        <Play className={cn("ml-0.5 h-5 w-5", isOutbound ? "text-white" : "text-gray-600")} />
      </button>
      <div className="flex items-center gap-2">
        {/* Waveform visualization */}
        <div className="flex items-center gap-[2px]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={cn("w-[2px] rounded-full", isOutbound ? "bg-white/60" : "bg-gray-300")}
              style={{
                height: `${Math.max(4, Math.sin(i * 0.5) * 12 + Math.random() * 8 + 8)}px`,
              }}
            />
          ))}
        </div>
        <span
          className={cn("text-sm tabular-nums", isOutbound ? "text-white/80" : "text-gray-500")}
        >
          {duration}
        </span>
        <Smile className={cn("h-5 w-5", isOutbound ? "text-white/60" : "text-gray-400")} />
      </div>
    </div>
  );
}

// Patient Chat Thread Component
function PatientChatThread({ patient }: { patient: PatientDetail }) {
  const [activeChannel, setActiveChannel] = React.useState("chat");
  const [messageInput, setMessageInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [patient.messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      // Handle sending message (would integrate with backend)
      setMessageInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  if (!patient.messages || patient.messages.length === 0) {
    return (
      <div className="flex h-full flex-col">
        {/* Empty state */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <MessageCircle className="text-muted-foreground/30 mx-auto h-12 w-12" />
            <Text size="sm" muted className="mt-3">
              No messages yet
            </Text>
            <Text size="xs" muted className="mt-1">
              Start a conversation with {patient.name}
            </Text>
          </div>
        </div>

        {/* Channel tabs */}
        <div className="border-border/50 border-t bg-white px-5 pt-3">
          <div className="flex items-center gap-4">
            {messageChannels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => setActiveChannel(channel.id)}
                className={cn(
                  "flex items-center gap-2 border-b-2 pb-3 text-sm transition-colors",
                  activeChannel === channel.id
                    ? "border-primary text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <channel.icon className="h-4 w-4" />
                {channel.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <div className="border-border/50 rounded-b-xl border-t bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="border-border bg-background focus-within:ring-ring flex h-10 flex-1 items-center rounded-full border pr-2 pl-4 focus-within:ring-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message"
                className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
              />
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-7 w-7"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-7 w-7"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-7 w-7"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-7 w-7"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={handleSend} disabled={!messageInput.trim()} className="gap-2">
              Send
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        <div className="space-y-4">
          {patient.messages.map((message, index) => {
            const isOutbound = message.direction === "outbound";
            const showHeader =
              index === 0 || patient.messages![index - 1]?.direction !== message.direction;

            const messageTime = message.sentAt
              ? new Date(message.sentAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={message.id}
                className={cn("flex gap-3", isOutbound ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar for incoming messages */}
                {!isOutbound && showHeader && (
                  <Avatar className="h-8 w-8 shrink-0">
                    {patient.avatarSrc && (
                      <AvatarImage src={patient.avatarSrc} alt={patient.name} />
                    )}
                    <AvatarFallback className="bg-avatar-fallback text-xs font-medium text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isOutbound && !showHeader && <div className="w-8 shrink-0" />}

                <div className={cn("max-w-[75%] space-y-1", isOutbound && "items-end")}>
                  {/* Header with name and time for incoming */}
                  {!isOutbound && showHeader && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{patient.name}</span>
                      <span className="text-muted-foreground text-xs">{messageTime}</span>
                    </div>
                  )}

                  {/* Message bubble */}
                  {(() => {
                    const voiceData = parseVoiceMessage(message.messageBody);
                    if (voiceData) {
                      return (
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3",
                            isOutbound
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "border-border/50 rounded-bl-md border bg-white shadow-sm"
                          )}
                        >
                          <VoiceMessageBubble
                            duration={voiceData.duration}
                            isOutbound={isOutbound}
                          />
                        </div>
                      );
                    }
                    return (
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3",
                          isOutbound
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "border-border/50 rounded-bl-md border bg-white shadow-sm"
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.messageBody || "(No content)"}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Time and status for outbound */}
                  {isOutbound && (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-muted-foreground text-xs">{messageTime}</span>
                      {message.isRead && <CheckCheck className="text-primary h-3.5 w-3.5" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Channel tabs */}
      <div className="border-border/50 border-t bg-white px-5 pt-3">
        <div className="flex items-center gap-4">
          {messageChannels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => setActiveChannel(channel.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 pb-3 text-sm transition-colors",
                activeChannel === channel.id
                  ? "border-primary text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              <channel.icon className="h-4 w-4" />
              {channel.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message input */}
      <div className="border-border/50 rounded-b-xl border-t bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="border-border bg-background focus-within:ring-ring flex h-10 flex-1 items-center rounded-full border pr-2 pl-4 focus-within:ring-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message"
              className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            />
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-7 w-7"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-7 w-7"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-7 w-7"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-7 w-7"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleSend} disabled={!messageInput.trim()} className="gap-2">
            Send
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PatientDetailView({ patient, className }: PatientDetailViewProps) {
  if (!patient) {
    return (
      <CardWrapper className={cn("flex h-full items-center justify-center", className)}>
        <Text muted className="text-center">
          Select a patient to view their details
        </Text>
      </CardWrapper>
    );
  }

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      {/* Patient Header Card */}
      <CardWrapper className="relative">
        <div className="flex flex-col gap-4 pr-8 sm:gap-6 sm:pr-0 lg:flex-row lg:items-start lg:justify-between">
          {/* Left - Avatar and Info */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
              {patient.avatarSrc && <AvatarImage src={patient.avatarSrc} alt={patient.name} />}
              <AvatarFallback className="bg-avatar-fallback text-base font-medium text-white sm:text-lg lg:text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Heading level={3} className="truncate text-xl sm:text-2xl">
                  {patient.name}
                </Heading>
                <Badge
                  variant={
                    patient.status === "ACTIVE"
                      ? "default"
                      : patient.status === "NEW"
                        ? "secondary"
                        : "outline"
                  }
                  className={cn(
                    "shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold sm:px-2.5 sm:py-1",
                    patient.status === "INACTIVE" && "bg-muted text-muted-foreground"
                  )}
                >
                  {patient.status}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:mt-3 sm:gap-x-6 sm:gap-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Text size="xs" className="sm:text-sm">
                    DOB: {patient.dob} ({patient.age} yrs)
                  </Text>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Phone className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Text size="xs" className="sm:text-sm">
                    {patient.phone}
                    {patient.phoneExt && ` x${patient.phoneExt}`}
                  </Text>
                </div>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:mt-2 sm:gap-x-6 sm:gap-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Mail className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Text size="xs" className="truncate sm:text-sm">
                    {patient.email}
                  </Text>
                </div>
                {patient.insurance && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Shield className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <Text size="xs" className="sm:text-sm">
                      {patient.insurance}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - More Actions */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 shrink-0 sm:relative sm:top-auto sm:right-auto sm:self-start"
          >
            <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
          <PatientStatCard
            icon={Calendar}
            label="Last Visit"
            value={patient.lastVisit.date}
            subtitle={patient.lastVisit.type}
          />
          <PatientStatCard
            icon={CalendarClock}
            label="Appointments"
            value={`${patient.appointments.total} Total`}
            subtitle={patient.appointments.dateRange}
          />
          <PatientStatCard
            icon={DollarSign}
            label="Balance"
            value={patient.balance.amount}
            subtitle={patient.balance.type}
          />
        </div>
      </CardWrapper>

      {/* Tabs Section */}
      <CardWrapper className="flex flex-1 flex-col overflow-hidden">
        <Tabs defaultValue="overview" className="flex h-full w-full flex-col">
          <TabsList className="border-border/50 mb-4 h-auto w-full justify-start gap-0 overflow-x-auto border-b-2 bg-transparent p-0 sm:mb-6">
            <TabsTrigger value="overview" className={tabTriggerStyles}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="appointments" className={tabTriggerStyles}>
              Appointments
            </TabsTrigger>
            <TabsTrigger value="medical-records" className={tabTriggerStyles}>
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="messages" className={tabTriggerStyles}>
              Messages
            </TabsTrigger>
            <TabsTrigger value="billing" className={tabTriggerStyles}>
              Billing
            </TabsTrigger>
            <TabsTrigger value="reviews" className={tabTriggerStyles}>
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-0 flex-1 overflow-y-auto">
            {/* Prioritized Actions - AI Surfaced */}
            <div className="mb-4 sm:mb-6">
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <div className="flex items-center gap-2">
                  <Heading level={5} className="text-base sm:text-lg">
                    Prioritized Actions
                  </Heading>
                  <span className="text-primary flex items-center gap-1 text-[10px] font-medium sm:text-xs">
                    <Sparkles className="h-3 w-3" />
                    AI Surfaced
                  </span>
                </div>
                <Button variant="link" className="h-auto p-0 text-xs sm:text-sm">
                  View All
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {(patient.prioritizedActions || []).slice(0, 4).map((action) => (
                  <PriorityActionCard
                    key={action.id}
                    type={action.type}
                    title={action.title}
                    description={action.description}
                    priority={action.priority}
                    dueDate={action.dueDate}
                    aiConfidence={action.aiConfidence}
                  />
                ))}
                {(!patient.prioritizedActions || patient.prioritizedActions.length === 0) && (
                  <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
                    <Text size="sm" muted className="text-center">
                      No prioritized actions at this time
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <Heading level={5} className="mb-3 text-base sm:mb-4 sm:text-lg">
                Recent Activity
              </Heading>
              <div>
                {patient.recentActivity.map((activity, index) => (
                  <ActivityRow
                    key={activity.id}
                    title={activity.title}
                    description={activity.description}
                    date={activity.date}
                    isRecent={index === 0}
                    isLast={index === patient.recentActivity.length - 1}
                  />
                ))}
                {patient.recentActivity.length === 0 && (
                  <Text size="sm" muted className="py-4 text-center">
                    No recent activity
                  </Text>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Placeholder content for other tabs */}
          <TabsContent value="appointments" className="mt-0 flex-1 overflow-y-auto pr-1">
            <div className="space-y-2">
              {(patient.allAppointments || patient.upcomingAppointments).map((apt) => (
                <AppointmentPreviewCard
                  key={apt.id}
                  status={
                    apt.status as
                      | "Scheduled"
                      | "Confirmed"
                      | "Checked In"
                      | "In Progress"
                      | "Completed"
                      | "Cancelled"
                      | "No-Show"
                  }
                  date={apt.date}
                  time={apt.time}
                  type={apt.type}
                  provider={apt.provider}
                />
              ))}
              {(patient.allAppointments || patient.upcomingAppointments).length === 0 && (
                <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
                  <Text size="sm" muted className="text-center">
                    No appointments found
                  </Text>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="medical-records" className="mt-0 flex-1 overflow-y-auto pr-1">
            {patient.outcomeMeasures && patient.outcomeMeasures.length > 0 ? (
              <div className="space-y-3">
                {patient.outcomeMeasures.map((measure) => (
                  <Card
                    key={measure.id}
                    className="hover:bg-card-hover/70 p-3 transition-all hover:border-white hover:shadow-md sm:p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Text className="font-medium">{measure.measureType}</Text>
                        {measure.score !== null && (
                          <Text size="sm" muted className="mt-1">
                            Score: {measure.score}
                          </Text>
                        )}
                        {measure.notes && (
                          <Text size="sm" muted className="mt-1">
                            {measure.notes}
                          </Text>
                        )}
                      </div>
                      <Text size="xs" muted>
                        {new Date(measure.measurementDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
                <Text size="sm" muted className="text-center">
                  No medical records found
                </Text>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="-mx-6 mt-0 -mb-6 flex-1 overflow-hidden">
            <PatientChatThread patient={patient} />
          </TabsContent>

          <TabsContent value="billing" className="mt-0 flex-1 overflow-y-auto pr-1">
            {patient.invoices && patient.invoices.length > 0 ? (
              <div className="space-y-3">
                {patient.invoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="hover:bg-card-hover/70 p-3 transition-all hover:border-white hover:shadow-md sm:p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Text className="font-medium">
                          {invoice.description || "Service Charge"}
                        </Text>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <Text size="sm" muted>
                            Charge: ${invoice.chargeAmount.toFixed(2)}
                          </Text>
                          {invoice.insurancePaid > 0 && (
                            <Text size="sm" muted>
                              Insurance: ${invoice.insurancePaid.toFixed(2)}
                            </Text>
                          )}
                          {invoice.patientPaid > 0 && (
                            <Text size="sm" muted>
                              Patient Paid: ${invoice.patientPaid.toFixed(2)}
                            </Text>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={invoice.balance > 0 ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {invoice.balance > 0 ? `Due: $${invoice.balance.toFixed(2)}` : "Paid"}
                        </Badge>
                        <Text size="xs" muted className="mt-1 block">
                          {invoice.dateOfService
                            ? new Date(invoice.dateOfService).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : ""}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
                <Text size="sm" muted className="text-center">
                  No billing records found
                </Text>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-0 flex-1 overflow-y-auto pr-1">
            {patient.reviews && patient.reviews.length > 0 ? (
              <div className="space-y-3">
                {patient.reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="hover:bg-card-hover/70 p-3 transition-all hover:border-white hover:shadow-md sm:p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-4 w-4",
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted"
                                )}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {review.reviewType.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <Text className="mt-2 font-medium">{review.title}</Text>
                        <Text size="sm" muted className="mt-1">
                          {review.reviewText}
                        </Text>
                        <Text size="xs" muted className="mt-2">
                          By {review.isAnonymous ? "Anonymous" : review.reviewerName || "Anonymous"}
                        </Text>
                      </div>
                      <Text size="xs" muted className="ml-4 shrink-0">
                        {new Date(review.reviewDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
                <Text size="sm" muted className="text-center">
                  No reviews yet
                </Text>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardWrapper>
    </div>
  );
}

export type { PatientDetailViewProps };
