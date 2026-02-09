"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/** Refresh interval: 25 minutes. JWT maxAge is 1 hour; refresh before expiry for sliding window. */
const REFRESH_INTERVAL_MS = 25 * 60 * 1000;

/**
 * Calls session update() on an interval while the user is signed in.
 * This triggers the JWT callback with trigger "update", extending the token expiry (sliding window).
 */
export function SessionRefresh() {
  const { data: session, status, update } = useSession();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const refresh = () => {
      update().catch(() => {
        // Ignore errors (e.g. network); next interval will retry
      });
    };

    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, session, update]);

  return null;
}
