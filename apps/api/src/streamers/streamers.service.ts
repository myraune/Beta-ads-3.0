import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { channelSchema, streamerProfileSchema } from "@beta/shared";
import { PrismaService } from "../common/prisma.service";
import type { AuthUser } from "../common/current-user.decorator";

@Injectable()
export class StreamersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertProfile(user: AuthUser, payload: unknown) {
    const parsed = streamerProfileSchema.parse(payload);

    return this.prisma.streamerProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: parsed.displayName,
        twitchHandle: parsed.twitchHandle,
        country: parsed.country,
        language: parsed.language,
        categories: parsed.categories,
        avgViewers: parsed.avgViewers,
        pricingTier: parsed.pricingTier
      },
      create: {
        userId: user.id,
        displayName: parsed.displayName,
        twitchHandle: parsed.twitchHandle,
        country: parsed.country,
        language: parsed.language,
        categories: parsed.categories,
        avgViewers: parsed.avgViewers,
        pricingTier: parsed.pricingTier
      }
    });
  }

  async getProfile(user: AuthUser) {
    const profile = await this.prisma.streamerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      throw new NotFoundException("Streamer profile not found");
    }

    return profile;
  }

  async createChannel(user: AuthUser, payload: unknown) {
    const parsed = channelSchema.parse(payload);
    const profile = await this.prisma.streamerProfile.findUnique({ where: { userId: user.id } });

    if (!profile) {
      throw new NotFoundException("Streamer profile not found");
    }

    return this.prisma.channel.create({
      data: {
        streamerProfileId: profile.id,
        twitchChannelName: parsed.twitchChannelName,
        country: parsed.country,
        language: parsed.language,
        categories: parsed.categories,
        avgViewers: parsed.avgViewers,
        pricingTier: parsed.pricingTier
      }
    });
  }

  async listChannels(user: AuthUser) {
    const profile = await this.prisma.streamerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      return [];
    }

    return this.prisma.channel.findMany({
      where: { streamerProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        overlayCredential: {
          select: {
            keyPrefix: true,
            rotatedAt: true
          }
        }
      }
    });
  }

  async assertChannelAccess(user: AuthUser, channelId: string): Promise<void> {
    if (user.role === "admin") {
      return;
    }

    const channel = await this.prisma.channel.findFirst({
      where: {
        id: channelId,
        streamerProfile: {
          userId: user.id
        }
      }
    });

    if (!channel) {
      throw new ForbiddenException("Channel access denied");
    }
  }
}
