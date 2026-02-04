"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { InboxSidebar } from "./inbox-sidebar";
import { ConversationList, type Conversation } from "./conversation-list";
import { ChatThread, type Message } from "./chat-thread";
import { Button } from "@/design-system/components/ui/button";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { ArrowLeft, Plus } from "lucide-react";

const messageFilterTabs = [
  { id: "all", label: "All Messages" },
  { id: "unread", label: "Unread" },
  { id: "pinned", label: "Pinned" },
  { id: "archived", label: "Archived" },
];

interface CommunicationsPageProps {
  className?: string;
}

const sampleConversations: Conversation[] = [
  {
    id: "1",
    name: "Michael Chen",
    preview: "Thank you for the prescription refill reminder...",
    time: "Today",
    unreadCount: 2,
    avatarSrc: "https://randomuser.me/api/portraits/men/52.jpg",
    pinned: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    preview: "Can I reschedule my appointment to next week?",
    time: "Today",
    unreadCount: 1,
    avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
    pinned: true,
  },
  {
    id: "3",
    name: "Margaret Williams",
    preview: "My blood pressure readings from this morning...",
    time: "Yesterday",
    avatarSrc: "https://randomuser.me/api/portraits/women/65.jpg",
    pinned: true,
  },
  {
    id: "4",
    name: "James Wilson",
    preview: "I have a question about my lab results",
    time: "Yesterday",
    unreadCount: 1,
    avatarSrc: "https://randomuser.me/api/portraits/men/41.jpg",
  },
  {
    id: "5",
    name: "Emily Davis",
    preview: "Confirming my new patient appointment for...",
    time: "Feb 2",
    avatarSrc: "https://randomuser.me/api/portraits/women/32.jpg",
  },
  {
    id: "6",
    name: "Robert Brown",
    preview: "Is my telehealth link still the same?",
    time: "Feb 1",
    unreadCount: 1,
    avatarSrc: "https://randomuser.me/api/portraits/men/29.jpg",
  },
  {
    id: "7",
    name: "Lisa Anderson",
    preview: "Thank you for the care plan summary",
    time: "Jan 31",
    avatarSrc: "https://randomuser.me/api/portraits/women/56.jpg",
  },
  {
    id: "8",
    name: "David Martinez",
    preview: "Called about insurance coverage question",
    time: "Jan 30",
  },
  {
    id: "9",
    name: "Jennifer Taylor",
    preview: "Appointment reminder received, will be there",
    time: "Jan 29",
    avatarSrc: "https://randomuser.me/api/portraits/women/28.jpg",
  },
  {
    id: "10",
    name: "Thomas Moore",
    preview: "Requesting medical records for specialist",
    time: "Jan 28",
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
  },
];

const sampleMessages: Message[] = [
  {
    id: "1",
    content: "Hi Dr. Chen's office,",
    time: "Feb 3, 2026",
    isOwn: false,
    senderName: "Sarah Johnson",
    senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "2",
    content:
      "I received the appointment reminder for next Monday at 9 AM. Unfortunately, something came up at work and I need to reschedule. Would it be possible to move my appointment to later in the week?",
    time: "",
    isOwn: false,
    senderName: "Sarah Johnson",
    senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "3",
    content: "Thank you,\nSarah Johnson",
    time: "10:44",
    isOwn: false,
    senderName: "Sarah Johnson",
    senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "read",
  },
  {
    id: "4",
    content: "Hello Sarah!",
    time: "Feb 3, 2026",
    isOwn: true,
    senderName: "You",
  },
  {
    id: "5",
    content:
      "Thank you for letting us know in advance. I'd be happy to help you reschedule.\n\nWe have availability on Wednesday at 2:30 PM or Thursday at 10:00 AM. Would either of those work for you?\n\nPlease let me know and I'll get you confirmed right away.\n\nBest,\nDr. Chen's Office",
    time: "11:02",
    isOwn: true,
    senderName: "You",
    status: "read",
  },
  {
    id: "6",
    content: "Thursday at 10 AM would be perfect! Thank you so much for accommodating me.",
    time: "11:15",
    isOwn: false,
    senderName: "Sarah Johnson",
    senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "read",
  },
];

type MobileView = "list" | "chat";

export function CommunicationsPage({ className }: CommunicationsPageProps) {
  const [selectedConversation, setSelectedConversation] = React.useState<string>("2");
  const [activeSection, setActiveSection] = React.useState<string>("unassigned");
  const [activeContact, setActiveContact] = React.useState<string | undefined>();
  const [mobileView, setMobileView] = React.useState<MobileView>("list");
  const [activeFilter, setActiveFilter] = React.useState("all");

  const handleSendMessage = (_message: string) => {
    // Message sending will be implemented
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setMobileView("chat");
  };

  const handleBackToList = () => {
    setMobileView("list");
  };

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      {/* Filter Tabs and Add Message Button */}
      <div className="mb-4 flex items-center justify-between">
        <FilterTabs
          tabs={messageFilterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
        />
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 gap-2">
        {/* Inbox Sidebar - Hidden on mobile/tablet, shown on lg+ */}
        <div className="hidden w-40 shrink-0 lg:block xl:w-44 2xl:w-48">
          <InboxSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            activeContact={activeContact}
            onContactSelect={setActiveContact}
            className="h-full"
          />
        </div>

        {/* Conversation List - Full width on mobile, fixed width on sm+ */}
        <div
          className={cn(
            "w-full shrink-0 sm:w-72 md:w-80 lg:w-64 xl:w-72 2xl:w-80",
            mobileView === "chat" && "hidden sm:block"
          )}
        >
          <ConversationList
            conversations={sampleConversations}
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
            className="h-full"
          />
        </div>

        {/* Chat Thread - Full width on mobile when selected, flexible width on sm+ */}
        <div className={cn("min-w-0 flex-1", mobileView === "list" && "hidden sm:block")}>
          {/* Mobile Back Button */}
          <div className="mb-2 sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="text-muted-foreground gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to conversations
            </Button>
          </div>
          <ChatThread
            contactName="Sarah Johnson"
            contactRole="Patient"
            contactAvatar="https://randomuser.me/api/portraits/women/44.jpg"
            messages={sampleMessages}
            onSendMessage={handleSendMessage}
            className="h-full sm:h-full"
          />
        </div>
      </div>
    </div>
  );
}

export type { CommunicationsPageProps };
