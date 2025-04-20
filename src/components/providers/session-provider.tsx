"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

export function ClientSessionProvider({ children }: { children: ReactNode }) {
  // Log when the provider mounts
  useEffect(() => {
    console.log("SessionProvider mounted");
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
