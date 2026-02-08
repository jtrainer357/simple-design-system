"use client";

import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { SessionTimeoutModal } from "./SessionTimeoutModal";

interface SessionProviderProps {
  children: React.ReactNode;
}

function SessionTimeoutWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session;

  return (
    <>
      {children}
      <SessionTimeoutModal isAuthenticated={isAuthenticated} />
    </>
  );
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <SessionTimeoutWrapper>{children}</SessionTimeoutWrapper>
    </NextAuthSessionProvider>
  );
}
