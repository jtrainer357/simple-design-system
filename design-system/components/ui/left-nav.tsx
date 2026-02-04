"use client";
import * as React from "react";
import { LucideIcon, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/design-system/lib/utils";
import { Button } from "@/design-system/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface LogoConfig {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface UserConfig {
  name?: string;
  initials: string;
  avatarSrc?: string;
  onClick?: () => void;
}

export interface LeftNavProps {
  logo: LogoConfig;
  items: NavItem[];
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  notificationCount?: number;
  user?: UserConfig;
  className?: string;
}

export function LeftNav({
  logo,
  items,
  showNotifications = true,
  onNotificationsClick,
  notificationCount,
  user,
  className,
}: LeftNavProps) {
  return (
    <>
      {/* Desktop Side Nav */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 hidden h-screen w-36 flex-col items-center pt-6 pb-4 lg:flex",
          className
        )}
      >
        {/* Logo */}
        <div className="mb-6 px-4">
          <Image
            src={logo.src}
            alt={logo.alt || "Logo"}
            width={logo.width || 96}
            height={logo.height || 23}
          />
        </div>

        {/* Main Nav Icons */}
        <nav className="-mt-20 flex flex-1 flex-col items-center justify-center gap-10">
          {items.map((item, index) => {
            const buttonContent = (
              <>
                <item.icon className="h-6 w-6" />
                <span className="sr-only">{item.label}</span>
              </>
            );
            const buttonClassName = cn(
              "h-12 w-12 rounded-full border-[0.5px] border-[#B3C6C4] text-[#195B63] transition-all hover:bg-white/50",
              item.active &&
                "border-0 bg-[#195B63] text-white shadow-xl hover:bg-[#195B63] hover:text-white"
            );

            if (item.href) {
              return (
                <Button key={index} variant="ghost" size="icon" asChild className={buttonClassName}>
                  <Link href={item.href}>{buttonContent}</Link>
                </Button>
              );
            }

            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={item.onClick}
                className={buttonClassName}
              >
                {buttonContent}
              </Button>
            );
          })}
        </nav>

        {/* Bottom Icons */}
        <div className="mt-auto mb-[60px] flex flex-col items-center gap-6">
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationsClick}
              className="relative h-12 w-12 rounded-full border-[0.5px] border-[#B3C6C4] text-[#195B63] hover:bg-white/50"
            >
              <Bell className="h-6 w-6" />
              {notificationCount && notificationCount > 0 && (
                <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          )}
          {user && (
            <Avatar
              className="h-12 w-12 cursor-pointer rounded-full border-[0.5px] border-[#B3C6C4] transition-all hover:bg-white/50"
              onClick={user.onClick}
            >
              {user.avatarSrc && <AvatarImage src={user.avatarSrc} alt={user.name} />}
              <AvatarFallback className="bg-muted text-xs font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </aside>

      {/* Tablet/Mobile Bottom Nav */}
      <nav className="bg-card/95 safe-area-pb fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t px-4 py-3 backdrop-blur-sm lg:hidden">
        {items.map((item, index) => {
          const mobileButtonContent = (
            <>
              <item.icon className="h-5 w-5" />
              <span className="sr-only">{item.label}</span>
            </>
          );
          const mobileButtonClassName = cn(
            "h-11 w-11 rounded-full border-[0.5px] border-[#B3C6C4] text-[#195B63] transition-all hover:bg-white/50",
            item.active &&
              "border-0 bg-[#195B63] text-white shadow-xl hover:bg-[#195B63] hover:text-white"
          );

          if (item.href) {
            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                asChild
                className={mobileButtonClassName}
              >
                <Link href={item.href}>{mobileButtonContent}</Link>
              </Button>
            );
          }

          return (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onClick={item.onClick}
              className={mobileButtonClassName}
            >
              {mobileButtonContent}
            </Button>
          );
        })}
        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationsClick}
            className="relative h-11 w-11 rounded-full border-[0.5px] border-[#B3C6C4] text-[#195B63] hover:bg-white/50"
          >
            <Bell className="h-5 w-5" />
            {notificationCount && notificationCount > 0 && (
              <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        )}
      </nav>
    </>
  );
}
