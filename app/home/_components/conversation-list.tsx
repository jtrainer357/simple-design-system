"use client";

import * as React from "react";
import { useCallback, useMemo } from "react";
import { cn } from "@/design-system/lib/utils";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { ConversationCard } from "@/design-system/components/ui/conversation-card";
import { Button } from "@/design-system/components/ui/button";
import { Heading } from "@/design-system/components/ui/typography";
import { Pin, MessageSquare, UserPlus } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  preview: string;
  time: string;
  unreadCount?: number;
  avatarSrc?: string;
  countryFlag?: string;
  pinned?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onAssign?: () => void;
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

export function ConversationList({
  conversations = sampleConversations,
  selectedId,
  onSelect,
  onAssign,
  className,
}: ConversationListProps) {
  const pinnedConversations = useMemo(() => conversations.filter((c) => c.pinned), [conversations]);
  const allConversations = useMemo(() => conversations.filter((c) => !c.pinned), [conversations]);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect?.(id);
    },
    [onSelect]
  );

  return (
    <CardWrapper className={cn("flex h-full flex-col overflow-hidden p-0", className)}>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && (
          <div className="p-4 pb-2">
            <div className="mb-3 flex items-center gap-2">
              <Pin className="text-primary h-4 w-4" />
              <Heading level={6} className="text-primary text-sm font-semibold">
                Pinned
              </Heading>
            </div>
            <div className="space-y-2">
              {pinnedConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  name={conversation.name}
                  preview={conversation.preview}
                  time={conversation.time}
                  unreadCount={conversation.unreadCount}
                  avatarSrc={conversation.avatarSrc}
                  countryFlag={conversation.countryFlag}
                  selected={selectedId === conversation.id}
                  onClick={() => handleSelect(conversation.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Conversations Section */}
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="text-muted-foreground h-4 w-4" />
            <Heading level={6} className="text-muted-foreground text-sm font-semibold">
              All Conversations
            </Heading>
          </div>
          <div className="space-y-2">
            {allConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                name={conversation.name}
                preview={conversation.preview}
                time={conversation.time}
                unreadCount={conversation.unreadCount}
                avatarSrc={conversation.avatarSrc}
                countryFlag={conversation.countryFlag}
                selected={selectedId === conversation.id}
                onClick={() => handleSelect(conversation.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-border/50 border-t p-3">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground w-full justify-start gap-2"
          onClick={onAssign}
        >
          <UserPlus className="h-4 w-4" />
          Assign to
        </Button>
      </div>
    </CardWrapper>
  );
}

export type { ConversationListProps, Conversation };
