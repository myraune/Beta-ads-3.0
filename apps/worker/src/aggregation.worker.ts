import { PrismaClient } from "@beta/db";

export async function runAggregation(prisma: PrismaClient) {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const events = await prisma.event.findMany({
    where: {
      ts: { gte: since },
      campaignId: { not: null },
      channelId: { not: null },
      type: {
        in: ["ad_completed", "ad_click"]
      }
    },
    select: {
      ts: true,
      type: true,
      campaignId: true,
      channelId: true,
      payload: true
    }
  });

  const grouped = new Map<string, { day: Date; campaignId: string; channelId: string; impressions: number; clicks: number; minutes: number }>();

  for (const event of events) {
    if (!event.campaignId || !event.channelId) {
      continue;
    }

    const dayString = event.ts.toISOString().slice(0, 10);
    const day = new Date(`${dayString}T00:00:00.000Z`);
    const key = `${dayString}:${event.campaignId}:${event.channelId}`;

    const current = grouped.get(key) ?? {
      day,
      campaignId: event.campaignId,
      channelId: event.channelId,
      impressions: 0,
      clicks: 0,
      minutes: 0
    };

    if (event.type === "ad_completed") {
      current.impressions += 1;
      const durationSec =
        typeof event.payload === "object" && event.payload && "durationSec" in event.payload
          ? Number((event.payload as { durationSec?: unknown }).durationSec)
          : 0;
      if (Number.isFinite(durationSec) && durationSec > 0) {
        current.minutes += durationSec / 60;
      }
    }

    if (event.type === "ad_click") {
      current.clicks += 1;
    }

    grouped.set(key, current);
  }

  await prisma.$transaction(
    [...grouped.values()].map((row) =>
      prisma.dailyMetric.upsert({
        where: {
          day_campaignId_channelId: {
            day: row.day,
            campaignId: row.campaignId,
            channelId: row.channelId
          }
        },
        update: {
          impressions: row.impressions,
          clicks: row.clicks,
          minutesOnScreen: row.minutes
        },
        create: {
          day: row.day,
          campaignId: row.campaignId,
          channelId: row.channelId,
          impressions: row.impressions,
          clicks: row.clicks,
          minutesOnScreen: row.minutes
        }
      })
    )
  );

  return {
    aggregatedRows: grouped.size,
    sampledEvents: events.length
  };
}
