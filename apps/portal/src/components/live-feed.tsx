"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

type FeedEvent = {
  event: string;
  at: string;
  payload: Record<string, unknown>;
};

const WS_BASE = process.env.NEXT_PUBLIC_API_WS_URL ?? "http://localhost:4000";

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const socket = io(`${WS_BASE}/dashboard`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000
    });

    const pushEvent = (event: string, payload: Record<string, unknown>) => {
      setEvents((previous) => [{ event, payload, at: new Date().toISOString() }, ...previous].slice(0, 10));
    };

    socket.on("overlay_status", (payload) => pushEvent("overlay_status", payload));
    socket.on("overlay_heartbeat", (payload) => pushEvent("overlay_heartbeat", payload));
    socket.on("delivery_sent", (payload) => pushEvent("delivery_sent", payload));

    return () => {
      socket.disconnect();
    };
  }, []);

  const hasEvents = useMemo(() => events.length > 0, [events]);

  return (
    <section className="portal-card rounded-2xl p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-ink">Live Delivery Feed</h3>
          <p className="text-sm text-ink/65">Incoming dashboard namespace events.</p>
        </div>
        <span className="rounded-full border border-emerald-300/60 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          websocket
        </span>
      </header>

      {!hasEvents ? (
        <p className="rounded-xl border border-ink/10 bg-white/75 px-4 py-5 text-sm text-ink/70">
          Waiting for overlay and delivery events.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={`${event.event}-${event.at}`} className="rounded-xl border border-ink/10 bg-white/80 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink/85">{event.event}</p>
                <p className="font-[family-name:var(--font-mono)] text-xs text-ink/60">{formatClock(event.at)}</p>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-ink/10 bg-white p-2 text-[11px] text-ink/80">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
