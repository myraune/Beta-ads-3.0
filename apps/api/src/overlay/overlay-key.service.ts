import { createHash, randomBytes } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import type { AuthUser } from "../common/current-user.decorator";
import { StreamersService } from "../streamers/streamers.service";

@Injectable()
export class OverlayKeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streamersService: StreamersService
  ) {}

  private hashOverlayKey(rawKey: string): string {
    return createHash("sha256").update(rawKey).digest("hex");
  }

  async rotateKey(user: AuthUser, channelId: string): Promise<{ overlayKey: string; overlayUrl: string; keyPrefix: string }> {
    await this.streamersService.assertChannelAccess(user, channelId);

    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    const overlayKey = randomBytes(48).toString("base64url");
    const keyHash = this.hashOverlayKey(overlayKey);
    const keyPrefix = overlayKey.slice(0, 8);

    await this.prisma.overlayCredential.upsert({
      where: { channelId },
      update: { keyHash, keyPrefix, rotatedAt: new Date() },
      create: { channelId, keyHash, keyPrefix }
    });

    return {
      overlayKey,
      keyPrefix,
      overlayUrl: `${process.env.OVERLAY_URL ?? "http://localhost:3001"}/overlay?key=${overlayKey}`
    };
  }

  async validateOverlayKey(rawKey: string) {
    const keyHash = this.hashOverlayKey(rawKey);

    const credential = await this.prisma.overlayCredential.findFirst({
      where: { keyHash },
      include: {
        channel: {
          include: {
            streamerProfile: true
          }
        }
      }
    });

    if (!credential) {
      return null;
    }

    return credential;
  }
}
