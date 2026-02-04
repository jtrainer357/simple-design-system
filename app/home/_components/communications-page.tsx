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
    name: "Jonas Smith",
    preview: "I believe a subtle blue or green would be...",
    time: "Jul 2024",
    unreadCount: 3,
    avatarSrc: "https://randomuser.me/api/portraits/men/52.jpg",
    pinned: true,
  },
  {
    id: "2",
    name: "Herry Brooks",
    preview: "I believe a subtle blue or green would be...",
    time: "Jul 2024",
    unreadCount: 3,
    avatarSrc: "https://randomuser.me/api/portraits/men/22.jpg",
    pinned: true,
  },
  {
    id: "3",
    name: "Sahid Ajmol",
    preview: "Ready your last final project",
    time: "Jul 2024",
    avatarSrc: "https://randomuser.me/api/portraits/men/35.jpg",
    pinned: true,
  },
  {
    id: "4",
    name: "Joe Roots",
    preview: "I believe a subtle blue or green would be...",
    time: "Jul 2024",
    unreadCount: 3,
    avatarSrc: "https://randomuser.me/api/portraits/men/41.jpg",
    countryFlag: "🇬🇧",
  },
  {
    id: "5",
    name: "Janson Roy",
    preview: "are you ready for new project",
    time: "Jul 2024",
    avatarSrc: "https://randomuser.me/api/portraits/men/18.jpg",
  },
  {
    id: "6",
    name: "Azam Khan",
    preview: "I believe a subtle blue or green would be...",
    time: "Jul 2024",
    unreadCount: 3,
    avatarSrc: "https://randomuser.me/api/portraits/men/29.jpg",
    countryFlag: "🇵🇰",
  },
  {
    id: "7",
    name: "David Willey",
    preview: "great id i can try it's",
    time: "Jul 2024",
    unreadCount: 3,
    avatarSrc: "https://randomuser.me/api/portraits/men/56.jpg",
  },
  {
    id: "8",
    name: "Tim David",
    preview: "well great i'd",
    time: "Jul 2024",
    unreadCount: 3,
  },
  {
    id: "9",
    name: "Dashi Lukce",
    preview: "I believe a subtle blue or green would be...",
    time: "Jul 2024",
    unreadCount: 3,
    countryFlag: "🇬🇧",
  },
  {
    id: "10",
    name: "Henry Killer",
    preview: "Thanks for the update",
    time: "Jul 2024",
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
  },
];

const sampleMessages: Message[] = [
  {
    id: "1",
    content: "Hi there",
    time: "Jul 07, 2024",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: "2",
    content:
      "I recently filled out the form on your website to sign up for a demo account and am now waiting for further instructions. Is there anything else I need to do at this point?",
    time: "",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: "3",
    content: "Best regards,\nBrooks",
    time: "10:44",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    status: "read",
  },
  {
    id: "4",
    content: "Hello Brooks! 👋",
    time: "Jul 07, 2024",
    isOwn: true,
    senderName: "You",
  },
  {
    id: "5",
    content:
      "Thank you for your interest in our product. I've added you to the waitlist for our private beta. You'll receive an access key via email in the next few days.\n\nThanks again for your patience and enthusiasm!\n\nBest regards,\nTahsan",
    time: "12:02",
    isOwn: true,
    senderName: "You",
    status: "read",
    reaction: "😊",
  },
  {
    id: "6",
    content: "Thats Perfect, looking forward! my email herrybro@pixem.com",
    time: "",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: "7",
    content: "",
    time: "10:44",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    type: "voice",
    voiceDuration: "00:24",
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

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
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
          Add Message
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
            contactName="Tahsan Khan"
            contactRole="Assignee"
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
