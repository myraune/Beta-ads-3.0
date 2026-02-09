import { Injectable, NotFoundException } from "@nestjs/common";
import { assignStreamerSchema, campaignCreateSchema, flightCreateSchema } from "@beta/shared";
import { PrismaService } from "../common/prisma.service";
import type { AuthUser } from "../common/current-user.decorator";

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, body: unknown) {
    const parsed = campaignCreateSchema.parse(body);

    const campaign = await this.prisma.campaign.create({
      data: {
        name: parsed.name,
        advertiser: parsed.advertiser,
        objective: parsed.objective,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        budget: parsed.budget,
        currency: parsed.currency.toUpperCase(),
        targeting: parsed.targeting,
        status: parsed.status
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "campaign_created",
        entityType: "campaign",
        entityId: campaign.id,
        payload: { campaignName: campaign.name }
      }
    });

    return campaign;
  }

  async list(user: AuthUser) {
    if (user.role === "streamer") {
      const profile = await this.prisma.streamerProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        return [];
      }

      return this.prisma.campaign.findMany({
        where: {
          assignments: {
            some: {
              channel: {
                streamerProfileId: profile.id
              }
            }
          }
        },
        include: {
          flights: true,
          creatives: true
        },
        orderBy: { createdAt: "desc" }
      });
    }

    return this.prisma.campaign.findMany({
      include: {
        flights: true,
        creatives: true,
        assignments: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        flights: true,
        creatives: true,
        assignments: {
          include: { channel: true }
        }
      }
    });

    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    return campaign;
  }

  async createFlight(user: AuthUser, campaignId: string, body: unknown) {
    const parsed = flightCreateSchema.parse(body);

    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    const flight = await this.prisma.flight.create({
      data: {
        campaignId,
        pacingPerHour: parsed.pacingPerHour,
        capPerStreamerPerHour: parsed.capPerStreamerPerHour,
        capPerSession: parsed.capPerSession,
        allowedFormats: parsed.allowedFormats
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "campaign_flight_created",
        entityType: "campaign",
        entityId: campaignId,
        payload: {
          flightId: flight.id,
          pacingPerHour: parsed.pacingPerHour
        }
      }
    });

    return flight;
  }

  async assignStreamers(user: AuthUser, campaignId: string, body: unknown) {
    const parsed = assignStreamerSchema.parse(body);

    const assignments = await this.prisma.$transaction(
      parsed.streamerChannelIds.map((channelId) =>
        this.prisma.campaignAssignment.upsert({
          where: {
            campaignId_channelId: {
              campaignId,
              channelId
            }
          },
          update: {
            cpmRate: parsed.cpmRate,
            fixedFee: parsed.fixedFee
          },
          create: {
            campaignId,
            channelId,
            cpmRate: parsed.cpmRate,
            fixedFee: parsed.fixedFee
          }
        })
      )
    );

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "campaign_streamers_assigned",
        entityType: "campaign",
        entityId: campaignId,
        payload: {
          count: assignments.length,
          channelIds: parsed.streamerChannelIds
        }
      }
    });

    return { count: assignments.length, assignments };
  }
}
