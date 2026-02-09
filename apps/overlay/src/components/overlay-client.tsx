"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type OverlayCommand = {
  commandId: string;
  campaignId: string;
  creativeId: string;
  durationSec: number;
  assetUrl: string;
  clickUrl?: string;
  animation?: "fade" | "slide" | "pulse";
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WS_BASE = process.env.NEXT_PUBLIC_API_WS_URL ?? "http://localhost:4000";

function eventRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`;
}

export function OverlayClient({ overlayKey }: { overlayKey: string }) {
  const socketRef = useRef<Socket | null>(null);
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [command, setCommand] = useState<OverlayCommand | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const commandRef = useRef<OverlayCommand | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const renderMode = useMemo(() => {
    if (!command) return "none";
    if (command.assetUrl.endsWith(".mp4")) return "video";
    return "image";
  }, [command]);

  useEffect(() => {
    commandRef.current = command;
  }, [command]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (!overlayKey) {
      return;
    }

    const sendEvent = async (type: string, payload: Record<string, unknown> = {}, overrides: Partial<OverlayCommand> = {}) => {
      try {
        await fetch(`${API_BASE}/events/ingest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-overlay-key": overlayKey
          },
          body: JSON.stringify({
            type,
            ts: new Date().toISOString(),
            request_id: eventRequestId(),
            session_id: sessionIdRef.current,
            campaign_id: overrides.campaignId ?? commandRef.current?.campaignId ?? null,
            creative_id: overrides.creativeId ?? commandRef.current?.creativeId ?? null,
            payload
          })
        });
      } catch {
        // silent retry behavior, overlay should never block OBS render loop.
      }
    };

    const socket = io(`${WS_BASE}/overlay`, {
      transports: ["websocket"],
      auth: { key: overlayKey },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on("connect", async () => {
      await sendEvent("overlay_connected", { transport: "socket_io" });
    });

    socket.on("session", (payload: { sessionId: string }) => {
      setSessionId(payload.sessionId);
    });

    socket.on("ad:command", async (incoming: OverlayCommand) => {
      setCommand(incoming);
      await sendEvent("ad_rendered", { durationSec: incoming.durationSec }, incoming);

      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
      }

      activeTimerRef.current = setTimeout(async () => {
        await sendEvent("ad_completed", { durationSec: incoming.durationSec }, incoming);
        setCommand(null);
      }, incoming.durationSec * 1000);
    });

    socket.on("disconnect", async () => {
      await sendEvent("overlay_disconnected", { reason: "socket_disconnect" });
      setCommand(null);
    });

    const heartbeatId = setInterval(async () => {
      socket.emit("overlay:heartbeat", {
        requestId: eventRequestId(),
        payload: { source: "overlay_client" }
      });
      await sendEvent("overlay_heartbeat", { source: "overlay_client" });
    }, 25_000);

    return () => {
      clearInterval(heartbeatId);
      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
      }
      socket.disconnect();
    };
  }, [overlayKey]);

  if (!command) {
    return <div className="h-screen w-screen bg-transparent" />;
  }

  const animation = command.animation === "pulse" ? "animate-adPulse" : "animate-adFadeIn";

  return (
    <div className="pointer-events-none fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-transparent">
      <div className="pointer-events-auto absolute bottom-6 right-6 w-[34vw] max-w-[420px] min-w-[220px]">
        <button
          type="button"
          className={`group relative w-full overflow-hidden rounded-xl border border-white/30 bg-black/20 shadow-2xl backdrop-blur ${animation}`}
          onClick={async () => {
            try {
              await fetch(`${API_BASE}/events/ingest`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-overlay-key": overlayKey
                },
                body: JSON.stringify({
                  type: "ad_click",
                  ts: new Date().toISOString(),
                  request_id: eventRequestId(),
                  session_id: sessionId,
                  campaign_id: command.campaignId,
                  creative_id: command.creativeId,
                  payload: { source: "overlay_click" }
                })
              });
            } catch {
              // do not block click behavior if API is temporarily unreachable.
            }

            if (command.clickUrl) {
              window.open(command.clickUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          {renderMode === "video" ? (
            <video className="h-full w-full object-cover" autoPlay muted playsInline>
              <source src={command.assetUrl} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={command.assetUrl} alt="Sponsored creative" className="h-full w-full object-cover" />
          )}

          <div className="absolute left-3 top-3 rounded bg-black/65 px-2 py-1 text-[10px] uppercase tracking-wide text-white">Sponsored</div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 text-left text-xs text-white">
            Tap for details
          </div>
        </button>
      </div>
    </div>
  );
}
