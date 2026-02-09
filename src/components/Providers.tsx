"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SessionRefresh } from "./SessionRefresh";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionRefresh />
      {children}
    </SessionProvider>
  );
}
