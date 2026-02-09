import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { deliveryTriggerSchema } from "@beta/shared";
import { MetricsService } from "../common/metrics.service";
import { PrismaService } from "../common/prisma.service";
import { OverlayGateway } from "../overlay/overlay.gateway";
import { DashboardGateway } from "../overlay/dashboard.gateway";
import { StorageService } from "../creatives/storage.service";
import { EventsService } from "../events/events.service";
import { evaluateDeliveryCaps } from "./delivery-policy";

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly overlayGateway: OverlayGateway,
    private readonly dashboardGateway: DashboardGateway,
    private readonly storageService: StorageService,
    private readonly eventsService: EventsService,
    private readonly metricsService: MetricsService
  ) {}

  async trigger(body: unknown) {
    const parsed = deliveryTriggerSchema.parse(body);

    const channel = await this.prisma.channel.findUnique({
      where: { id: parsed.channelId },
      include: {
        streamerProfile: true
      }
    });

    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    const assignment = await this.prisma.campaignAssignment.findFirst({
      where: {
        channelId: parsed.channelId,
        ...(parsed.campaignId ? { campaignId: parsed.campaignId } : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          include: {
            flights: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (!assignment) {
      throw new BadRequestException("No campaign assignment found for channel");
    }

    const campaign = assignment.campaign;
    const flight = campaign.flights.at(0);

    if (!flight) {
      throw new BadRequestException("Campaign has no flight configured");
    }

    const session = await this.prisma.streamSession.findFirst({
      where: {
        channelId: parsed.channelId,
        status: "active"
      },
      orderBy: { startedAt: "desc" }
    });

    if (!session) {
      throw new BadRequestException("No active stream session for channel");
    }

    const creative = parsed.creativeId
      ? await this.prisma.creative.findFirst({
          where: {
            id: parsed.creativeId,
            campaignId: campaign.id,
            approvalStatus: "approved"
          }
        })
      : await this.prisma.creative.findFirst({
          where: {
            campaignId: campaign.id,
            approvalStatus: "approved",
            format: {
              in: flight.allowedFormats
            }
          },
          orderBy: { createdAt: "asc" }
        });

    if (!creative) {
      throw new BadRequestException("No approved creative available for delivery");
    }

    await this.eventsService.recordSystemEvent("ad_candidate_selected", {
      requestId: `sys_${randomUUID()}`,
      streamerId: channel.streamerProfileId,
      channelId: channel.id,
      sessionId: session.id,
      campaignId: campaign.id,
      creativeId: creative.id,
      payload: {
        reason: parsed.creativeId ? "manual" : "first_approved_creative"
      }
    });

    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const [hourlyDelivered, sessionDelivered, campaignHourlyCommands] = await Promise.all([
      this.prisma.event.count({
        where: {
          type: "ad_completed",
          channelId: channel.id,
          campaignId: campaign.id,
          ts: { gte: lastHour }
        }
      }),
      this.prisma.event.count({
        where: {
          type: "ad_completed",
          sessionId: session.id,
          campaignId: campaign.id
        }
      }),
      this.prisma.event.count({
        where: {
          type: "ad_command_sent",
          campaignId: campaign.id,
          ts: { gte: lastHour }
        }
      })
    ]);

    const decision = evaluateDeliveryCaps({
      hourlyDelivered,
      sessionDelivered,
      campaignHourlyCommands,
      capPerStreamerPerHour: flight.capPerStreamerPerHour,
      capPerSession: flight.capPerSession,
      pacingPerHour: flight.pacingPerHour
    });

    if (!decision.allowed) {
      this.metricsService.deliveryCommandCounter.inc({ result: `blocked_${decision.reason}` });
      throw new BadRequestException(`Delivery blocked by pacing rules: ${decision.reason}`);
    }

    const commandId = randomUUID();
    const sent = await this.overlayGateway.pushAdCommand(channel.id, {
      commandId,
      campaignId: campaign.id,
      creativeId: creative.id,
      durationSec: parsed.durationSec || creative.durationSec,
      assetUrl: this.storageService.objectUrl(creative.objectKey),
      clickUrl: creative.clickUrl,
      animation: "fade"
    });

    if (!sent) {
      this.metricsService.deliveryCommandCounter.inc({ result: "failed_no_overlay" });
      throw new BadRequestException("Overlay is not connected");
    }

    await this.eventsService.recordSystemEvent("ad_command_sent", {
      requestId: commandId,
      streamerId: channel.streamerProfileId,
      channelId: channel.id,
      sessionId: session.id,
      campaignId: campaign.id,
      creativeId: creative.id,
      payload: {
        durationSec: parsed.durationSec || creative.durationSec,
        transport: "websocket"
      }
    });

    this.metricsService.deliveryCommandCounter.inc({ result: "sent" });

    this.dashboardGateway.broadcast("delivery_sent", {
      commandId,
      channelId: channel.id,
      campaignId: campaign.id,
      creativeId: creative.id,
      sessionId: session.id,
      sentAt: new Date().toISOString()
    });

    return {
      ok: true,
      commandId,
      channelId: channel.id,
      campaignId: campaign.id,
      creativeId: creative.id,
      sessionId: session.id
    };
  }
}
