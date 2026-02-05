"use client";
import * as React from "react";
import { Home, Users, Calendar, MessageSquare, CreditCard, TrendingUp } from "lucide-react";
import { LeftNav as LeftNavBase, NavItem } from "@/design-system/components/ui/left-nav";

type ActivePage = "home" | "patients" | "schedule" | "messages" | "billing" | "marketing";

interface LeftNavProps {
  activePage?: ActivePage;
}

function getNavItems(activePage: ActivePage = "home"): NavItem[] {
  return [
    { icon: Home, label: "Home", active: activePage === "home", href: "/home" },
    { icon: Users, label: "Patients", active: activePage === "patients", href: "/home/patients" },
    {
      icon: Calendar,
      label: "Schedule",
      active: activePage === "schedule",
      href: "/home/schedule",
    },
    {
      icon: MessageSquare,
      label: "Communications",
      active: activePage === "messages",
      href: "/home/communications",
    },
    {
      icon: CreditCard,
      label: "Billing",
      active: activePage === "billing",
      href: "/home/billing",
    },
    {
      icon: TrendingUp,
      label: "Marketing",
      active: activePage === "marketing",
      href: "/home/marketing",
    },
  ];
}

export function LeftNav({ activePage = "home" }: LeftNavProps) {
  return (
    <LeftNavBase
      logo={{
        src: "/tebra-logo.svg",
        alt: "HealthAI",
        width: 96,
        height: 23,
      }}
      items={getNavItems(activePage)}
      showNotifications={true}
      user={{
        initials: "DR",
        name: "Dr. Sarah Chen",
        avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/32.jpg", // Asian middle-aged female
      }}
      isHomePage={activePage === "home"}
    />
  );
}
