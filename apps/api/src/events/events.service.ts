import { Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Prisma } from "@beta/db";
import { overlayEventSchema, type EventType } from "@beta/shared";
import { MetricsService } from "../common/metrics.service";
import { PrismaService } from "../common/prisma.service";
import { EventRateLimitService } from "../common/rate-limit.service";
import { OverlayKeyService } from "../overlay/overlay-key.service";

interface IngestContext {
  ip: string;
  userAgent?: string;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly overlayKeyService: OverlayKeyService,
    private readonly rateLimitService: EventRateLimitService,
    private readonly metricsService: MetricsService
  ) {}

  async getOrCreateSession(channelId: string, streamerId: string) {
    const now = new Date();
    const existing = await this.prisma.streamSession.findFirst({
      where: { channelId },
      orderBy: { startedAt: "desc" }
    });

    if (!existing) {
      const created = await this.prisma.streamSession.create({
        data: {
          channelId,
          streamerProfileId: streamerId,
          startedAt: now,
          lastHeartbeatAt: now,
          status: "active"
        }
      });

      await this.recordSystemEvent("session_started", {
        requestId: `sys_${randomUUID()}`,
        streamerId,
        channelId,
        sessionId: created.id,
        payload: { reason: "auto_started_on_overlay_connection" }
      });

      return created;
    }

    if (existing.status === "active") {
      return this.prisma.streamSession.update({
        where: { id: existing.id },
        data: { lastHeartbeatAt: now }
      });
    }

    const graceWindowMs = 5 * 60 * 1000;
    const gapMs = now.getTime() - existing.lastHeartbeatAt.getTime();

    if (existing.status === "disconnected" && gapMs <= graceWindowMs) {
      return this.prisma.streamSession.update({
        where: { id: existing.id },
        data: {
          status: "active",
          endedAt: null,
          lastHeartbeatAt: now
        }
      });
    }

    if (existing.status !== "ended") {
      await this.prisma.streamSession.update({
        where: { id: existing.id },
        data: {
          status: "ended",
          endedAt: existing.lastHeartbeatAt
        }
      });

      await this.recordSystemEvent("session_ended", {
        requestId: `sys_${randomUUID()}`,
        streamerId,
        channelId,
        sessionId: existing.id,
        payload: { reason: "disconnect_grace_elapsed" }
      });
    }

    const created = await this.prisma.streamSession.create({
      data: {
        channelId,
        streamerProfileId: streamerId,
        startedAt: now,
        lastHeartbeatAt: now,
        status: "active"
      }
    });

    await this.recordSystemEvent("session_started", {
      requestId: `sys_${randomUUID()}`,
      streamerId,
      channelId,
      sessionId: created.id,
      payload: { reason: "new_session_after_disconnect" }
    });

    return created;
  }

  async markDisconnected(sessionId: string) {
    await this.prisma.streamSession.update({
      where: { id: sessionId },
      data: {
        status: "disconnected",
        lastHeartbeatAt: new Date()
      }
    });
  }

  async ingest(overlayKey: string, body: unknown, context: IngestContext) {
    await this.rateLimitService.consume(overlayKey, context.ip);

    const credential = await this.overlayKeyService.validateOverlayKey(overlayKey);
    if (!credential) {
      throw new UnauthorizedException("Invalid overlay key");
    }

    const parsed = overlayEventSchema.parse(body);
    const channelId = parsed.channel_id ?? credential.channel.id;
    const streamerId = parsed.streamer_id ?? credential.channel.streamerProfileId;

    let sessionId = parsed.session_id ?? null;

    if (parsed.type === "overlay_connected" || parsed.type === "overlay_heartbeat") {
      const session = await this.getOrCreateSession(channelId, streamerId);
      sessionId = session.id;
    }

    if (!sessionId) {
      const latestSession = await this.prisma.streamSession.findFirst({
        where: { channelId },
        orderBy: { startedAt: "desc" }
      });
      sessionId = latestSession?.id ?? null;
    }

    if (parsed.type === "overlay_disconnected" && sessionId) {
      await this.markDisconnected(sessionId);
    }

    if (parsed.type === "overlay_heartbeat" && sessionId) {
      await this.prisma.streamSession.update({
        where: { id: sessionId },
        data: { status: "active", lastHeartbeatAt: new Date() }
      });
    }

    const event = await this.prisma.event.create({
      data: {
        id: parsed.id ?? randomUUID(),
        type: parsed.type,
        ts: parsed.ts,
        requestId: parsed.request_id,
        streamerId,
        channelId,
        sessionId,
        campaignId: parsed.campaign_id ?? null,
        creativeId: parsed.creative_id ?? null,
        payload: parsed.payload,
        ip: context.ip,
        userAgent: context.userAgent ?? null
      }
    });

    this.metricsService.eventIngestCounter.inc({ type: parsed.type });

    return { id: event.id, sessionId };
  }

  async recordSystemEvent(
    type: EventType,
    params: {
      requestId: string;
      streamerId?: string | null;
      channelId?: string | null;
      sessionId?: string | null;
      campaignId?: string | null;
      creativeId?: string | null;
      payload?: Record<string, unknown>;
      ip?: string | null;
      userAgent?: string | null;
    }
  ) {
    const event = await this.prisma.event.create({
      data: {
        type,
        ts: new Date(),
        requestId: params.requestId,
        streamerId: params.streamerId ?? null,
        channelId: params.channelId ?? null,
        sessionId: params.sessionId ?? null,
        campaignId: params.campaignId ?? null,
        creativeId: params.creativeId ?? null,
        payload: (params.payload ?? {}) as Prisma.InputJsonValue,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null
      }
    });

    this.metricsService.eventIngestCounter.inc({ type });

    return event;
  }
}
