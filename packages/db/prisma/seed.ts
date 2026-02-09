import { createHash, randomBytes } from "node:crypto";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

function hashOverlayKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function upsertUser(email: string, role: Role) {
  return prisma.user.upsert({
    where: { email },
    update: { role, emailVerifiedAt: new Date() },
    create: { email, role, emailVerifiedAt: new Date() }
  });
}

async function main() {
  const admin = await upsertUser("admin@betaads.local", "admin");
  await upsertUser("agency@betaads.local", "agency");
  await upsertUser("brand@betaads.local", "brand");
  const streamerUser = await upsertUser("streamer@betaads.local", "streamer");

  const streamerProfile = await prisma.streamerProfile.upsert({
    where: { userId: streamerUser.id },
    update: {
      displayName: "Demo Streamer",
      twitchHandle: "demo_streamer"
    },
    create: {
      userId: streamerUser.id,
      displayName: "Demo Streamer",
      twitchHandle: "demo_streamer",
      country: "US",
      language: "en",
      categories: ["gaming", "fps"],
      avgViewers: 120,
      pricingTier: "mid"
    }
  });

  const channel = await prisma.channel.upsert({
    where: { id: "a9a57f97-e6ea-4728-94e7-af1edca9f0aa" },
    update: {
      streamerProfileId: streamerProfile.id
    },
    create: {
      id: "a9a57f97-e6ea-4728-94e7-af1edca9f0aa",
      streamerProfileId: streamerProfile.id,
      twitchChannelName: "demo_streamer",
      country: "US",
      language: "en",
      categories: ["gaming", "fps"],
      avgViewers: 120,
      pricingTier: "mid"
    }
  });

  const overlayKey = randomBytes(48).toString("base64url");
  await prisma.overlayCredential.upsert({
    where: { channelId: channel.id },
    update: {
      keyHash: hashOverlayKey(overlayKey),
      keyPrefix: overlayKey.slice(0, 8),
      rotatedAt: new Date()
    },
    create: {
      channelId: channel.id,
      keyHash: hashOverlayKey(overlayKey),
      keyPrefix: overlayKey.slice(0, 8)
    }
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: "9a2f2c28-48bc-4ad9-9547-d40fa6f40046" },
    update: {
      status: "approved"
    },
    create: {
      id: "9a2f2c28-48bc-4ad9-9547-d40fa6f40046",
      name: "Launch Campaign",
      advertiser: "Beta Brands",
      objective: "Awareness",
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      budget: 5000,
      currency: "USD",
      status: "approved",
      targeting: {
        country: ["US"],
        language: ["en"]
      }
    }
  });

  await prisma.flight.upsert({
    where: { id: "4e530940-2f74-42e7-9fa5-d08656bf6dff" },
    update: {},
    create: {
      id: "4e530940-2f74-42e7-9fa5-d08656bf6dff",
      campaignId: campaign.id,
      pacingPerHour: 30,
      capPerStreamerPerHour: 6,
      capPerSession: 30,
      allowedFormats: ["image", "gif", "mp4"]
    }
  });

  await prisma.campaignAssignment.upsert({
    where: {
      campaignId_channelId: {
        campaignId: campaign.id,
        channelId: channel.id
      }
    },
    update: {
      cpmRate: 15
    },
    create: {
      campaignId: campaign.id,
      channelId: channel.id,
      cpmRate: 15
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      action: "seed_initialized",
      entityType: "system",
      entityId: "seed",
      payload: { campaignId: campaign.id, channelId: channel.id }
    }
  });

  // This is only printed during local seed, it is never persisted in logs by the API.
  process.stdout.write(`Seed completed. Demo overlay key (save now): ${overlayKey}\n`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
