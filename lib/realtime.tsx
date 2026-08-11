"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";

export type ChangeScope = "phones" | "investments" | "payments" | "ledger" | "auth";

interface RealtimeState {
  // Bumps every time the backend says something changed, per scope. Pages watch the
  // scope(s) they care about and refetch when the number changes — no reload needed.
  ticks: Record<ChangeScope, number>;
}

const RealtimeContext = createContext<RealtimeState>({
  ticks: { phones: 0, investments: 0, payments: 0, ledger: 0, auth: 0 },
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ticks, setTicks] = useState<Record<ChangeScope, number>>({
    phones: 0,
    investments: 0,
    payments: 0,
    ledger: 0,
    auth: 0,
  });

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    function onChange(payload: { scope: ChangeScope }) {
      setTicks((prev) => ({ ...prev, [payload.scope]: prev[payload.scope] + 1 }));
    }

    socket.on("data:changed", onChange);
    return () => {
      socket.off("data:changed", onChange);
    };
  }, [user]);

  return <RealtimeContext.Provider value={{ ticks }}>{children}</RealtimeContext.Provider>;
}

/** Re-runs `onChange` whenever any of the given scopes gets a live update. */
export function useLiveRefresh(scopes: ChangeScope[], onChange: () => void) {
  const { ticks } = useContext(RealtimeContext);
  const key = scopes.map((s) => ticks[s]).join(":");

  useEffect(() => {
    // All ticks start at 0, so this only fires after a real "data:changed" event —
    // the initial page-load fetch is handled separately by each page's own mount effect.
    if (scopes.some((s) => ticks[s] > 0)) onChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
